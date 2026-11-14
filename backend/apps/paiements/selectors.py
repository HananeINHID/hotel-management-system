"""
Module de sélection et d'agrégation des données liées aux séjours.
Point unique d'intégration avec le module Séjours de Hmza.
À l'intégration du vrai modèle de Hmza, seules les fonctions de ce fichier
auront besoin d'être ajustées si nécessaire !
"""
from decimal import Decimal
from typing import Optional, Dict, Any
from django.apps import apps
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from django.utils import timezone


def get_sejour_model():
    """Récupère dynamiquement le modèle Sejour via le registre Django."""
    return apps.get_model('sejours', 'Sejour')


def get_sejour_by_id(sejour_id: int):
    """
    Récupère une instance de Séjour par son identifiant.
    Retourne None si introuvable.
    """
    Sejour = get_sejour_model()
    try:
        return Sejour.objects.get(pk=sejour_id)
    except Sejour.DoesNotExist:
        return None


def is_sejour_termine_ou_archive(sejour) -> bool:
    """
    Règle métier : Interdit toute nouvelle consommation sur un séjour archivé ou terminé.
    Vérifie les drapeaux est_archive, statut_sejour, ou une date de départ passée.
    """
    if sejour is None:
        return True

    # Séjour explicitement archivé
    if getattr(sejour, 'est_archive', False):
        return True

    # Statut du séjour
    statut = str(getattr(sejour, 'statut_sejour', '')).upper()
    if statut in ['TERMINE', 'CLOTURE', 'ANNULE', 'ARCHIVE']:
        return True

    # Date de départ réel dépassée
    depart_reel = getattr(sejour, 'depart_reel', None)
    if depart_reel and depart_reel <= timezone.now():
        return True

    return False


def get_total_consommations_sejour(sejour_id: int) -> Decimal:
    """
    Calcule la somme des consommations de services pour un séjour donné :
    Somme(quantite * prix_applique)
    """
    ConsommationService = apps.get_model('services', 'ConsommationService')
    total = ConsommationService.objects.filter(sejour_id=sejour_id).aggregate(
        total=Sum(
            ExpressionWrapper(
                F('quantite') * F('prix_applique'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        )
    )['total']
    return Decimal(total or '0.00').quantize(Decimal('0.01'))


def get_total_paye_sejour(sejour_id: int, exclude_paiement_id: Optional[int] = None) -> Decimal:
    """
    Calcule le total des paiements effectivement VALIDÉS pour un séjour donné.
    Les paiements EN_ATTENTE, REFUSE ou REMBOURSE ne sont pas comptabilisés comme encaissés.
    """
    Paiement = apps.get_model('paiements', 'Paiement')
    qs = Paiement.objects.filter(sejour_id=sejour_id, statut='VALIDE')
    if exclude_paiement_id:
        qs = qs.exclude(pk=exclude_paiement_id)
    total = qs.aggregate(total=Sum('montant'))['total']
    return Decimal(total or '0.00').quantize(Decimal('0.01'))


def get_total_du_sejour(sejour_id: int) -> Decimal:
    """
    Calcule le total dû pour le séjour :
    Total = Somme des consommations + Frais d'hébergement/chambre (si calculables sur le modèle Sejour).
    """
    sejour = get_sejour_by_id(sejour_id)
    total_conso = get_total_consommations_sejour(sejour_id)

    # Si le vrai modèle Sejour fournit un montant de chambre ou réservation
    montant_chambre = Decimal('0.00')
    if sejour:
        for attr in ['montant_total', 'montant_chambre', 'prix_chambre', 'total_hebergement']:
            if hasattr(sejour, attr):
                val = getattr(sejour, attr)
                if val is not None:
                    try:
                        montant_chambre = Decimal(str(val))
                        break
                    except Exception:
                        pass

    return (total_conso + montant_chambre).quantize(Decimal('0.01'))


def calculer_reste_a_payer_sejour(sejour_id: int, exclude_paiement_id: Optional[int] = None) -> Decimal:
    """
    Règle métier : Un paiement ne peut pas dépasser le reste à payer du séjour.
    Reste à payer = Total dû (hébergement éventuel + consommations) - Total des paiements validés.
    """
    total_du = get_total_du_sejour(sejour_id)
    total_paye = get_total_paye_sejour(sejour_id, exclude_paiement_id=exclude_paiement_id)
    reste = total_du - total_paye
    return max(Decimal('0.00'), reste).quantize(Decimal('0.01'))


def get_sejour_resume_financier(sejour_id: int) -> Dict[str, Any]:
    """
    Fournit le résumé financier complet d'un séjour pour l'endpoint dédié et le frontend :
    - Détail des consommations
    - Détail des paiements
    - Totaux et reste à payer
    """
    sejour = get_sejour_by_id(sejour_id)
    if not sejour:
        return None

    ConsommationService = apps.get_model('services', 'ConsommationService')
    Paiement = apps.get_model('paiements', 'Paiement')

    consommations = ConsommationService.objects.filter(
        sejour_id=sejour_id
    ).select_related('service').order_by('-date_consommation')

    paiements = Paiement.objects.filter(
        sejour_id=sejour_id
    ).select_related('employe').order_by('-date_paiement')

    total_consommations = get_total_consommations_sejour(sejour_id)
    total_du = get_total_du_sejour(sejour_id)
    total_paye = get_total_paye_sejour(sejour_id)
    reste_a_payer = max(Decimal('0.00'), total_du - total_paye).quantize(Decimal('0.01'))

    return {
        'sejour_id': sejour.pk,
        'statut_sejour': getattr(sejour, 'statut_sejour', 'EN_COURS'),
        'est_archive': getattr(sejour, 'est_archive', False),
        'arrivee_reelle': getattr(sejour, 'arrivee_reelle', None),
        'depart_reel': getattr(sejour, 'depart_reel', None),
        'total_consommations': str(total_consommations),
        'total_du': str(total_du),
        'total_paye': str(total_paye),
        'reste_a_payer': str(reste_a_payer),
        'est_solde': reste_a_payer == Decimal('0.00') and total_du > 0,
        'nombre_consommations': consommations.count(),
        'nombre_paiements': paiements.count(),
        'consommations': [
            {
                'id_consommation': c.pk,
                'service_id': c.service_id,
                'service_nom': c.service.nom,
                'service_type': c.service.type_service,
                'quantite': c.quantite,
                'prix_applique': str(c.prix_applique),
                'montant_total': str(c.montant_total),
                'date_consommation': c.date_consommation.isoformat() if c.date_consommation else None,
            }
            for c in consommations
        ],
        'paiements': [
            {
                'id_paiement': p.pk,
                'reference_paiement': p.reference_paiement,
                'montant': str(p.montant),
                'mode_paiement': p.mode_paiement,
                'mode_paiement_display': p.get_mode_payment_display() if hasattr(p, 'get_mode_payment_display') else p.get_mode_paiement_display(),
                'statut': p.statut,
                'statut_display': p.get_statut_display(),
                'date_paiement': p.date_paiement.isoformat() if p.date_paiement else None,
                'employe_id': p.employe_id,
                'employe_nom_complet': f"{p.employe.nom} {p.employe.prenom}",
            }
            for p in paiements
        ]
    }
