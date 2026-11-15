"""
Règles métier du module Réservations (Salma).

Une RESERVATION concerne plusieurs chambres via l'association CONCERNER
(modèle ReservationChambre), chacune avec ses propres dates, occupants et tarif.

Les mêmes règles sont aussi garanties en base par les triggers (triggers.py).
Ici on les vérifie avant l'écriture pour renvoyer des messages clairs à l'API.
"""
from datetime import datetime, time, timedelta
from decimal import Decimal

from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.chambres.models import Chambre
from apps.employes.models import Employe

from .models import Reservation, ReservationChambre

Statut = Reservation.Statut
STATUTS_ACTIFS = [Statut.EN_ATTENTE, Statut.CONFIRMEE]

TRANSITIONS = {
    Statut.EN_ATTENTE: {Statut.CONFIRMEE, Statut.ANNULEE},
    Statut.CONFIRMEE: {Statut.ANNULEE, Statut.TERMINEE},
    Statut.ANNULEE: set(),
    Statut.TERMINEE: set(),
}


def fmt(d):
    return d.strftime("%d/%m/%Y")


def nb_nuits(arrivee, depart):
    return (depart - arrivee).days


# --------------------------------------------------------------- disponibilité
def raisons_indisponibilite(chambres, debut, fin, exclure_reservation_id=None,
                            nb_occupants=None):
    """
    Retourne {id_chambre: raison} pour les chambres NON disponibles sur [debut, fin[.
    Une chambre absente du dictionnaire est disponible.

    Une chambre est indisponible si :
      1. elle est hors service ;
      2. le nombre d'occupants dépasse la capacité de sa catégorie ;
      3. une autre réservation (en attente ou confirmée) chevauche la période
         (départ le jour J = arrivée le jour J possible : intervalle [arrivée, départ[) ;
      4. une maintenance bloquante (planifiée ou en cours) chevauche la période ;
      5. un séjour en cours l'occupe encore (y compris dépassement du départ prévu).
    """
    raisons = {}
    ids = [c.pk for c in chambres]

    for c in chambres:
        if c.etat_physique == Chambre.EtatPhysique.HORS_SERVICE:
            raisons[c.pk] = "La chambre est hors service."
        elif nb_occupants and nb_occupants > c.categorie.capacite:
            raisons[c.pk] = (
                f"Capacité maximale dépassée ({c.categorie.capacite} personne(s))."
            )

    lignes = ReservationChambre.objects.filter(
        chambre_id__in=ids,
        reservation__statut_reservation__in=STATUTS_ACTIFS,
        date_arrivee_prevue__lt=fin,
        date_depart_prevue__gt=debut,
    )
    if exclure_reservation_id:
        lignes = lignes.exclude(reservation_id=exclure_reservation_id)
    for rc in lignes.order_by("date_arrivee_prevue"):
        raisons.setdefault(
            rc.chambre_id,
            f"Déjà réservée du {fmt(rc.date_arrivee_prevue)} au "
            f"{fmt(rc.date_depart_prevue)} (réservation #{rc.reservation_id}).",
        )

    Maintenance = apps.get_model("maintenances", "Maintenance")
    debut_dt = timezone.make_aware(datetime.combine(debut, time.min))
    fin_dt = timezone.make_aware(datetime.combine(fin, time.min))
    maints = Maintenance.objects.filter(
        chambre_id__in=ids,
        bloquante=True,
        statut__in=["planifiee", "en_cours"],
        debut__lt=fin_dt,
    ).exclude(fin__isnull=False, fin__lte=debut_dt)
    for m in maints:
        raisons.setdefault(
            m.chambre_id,
            f"Maintenance bloquante #{m.id_maintenance} sur la période.",
        )

    Sejour = apps.get_model("sejours", "Sejour")
    aujourdhui = timezone.localdate()
    en_cours = Sejour.objects.filter(
        chambre_id__in=ids, statut_sejour="EN_COURS", est_archive=False
    )
    if exclure_reservation_id:
        en_cours = en_cours.exclude(reservation_id=exclure_reservation_id)
    for s in en_cours:
        rc = ReservationChambre.objects.filter(
            reservation_id=s.reservation_id, chambre_id=s.chambre_id
        ).first()
        debut_occ = (
            timezone.localtime(s.arrivee_reelle).date()
            if s.arrivee_reelle else (rc.date_arrivee_prevue if rc else aujourdhui)
        )
        fin_occ = max(
            rc.date_depart_prevue if rc else aujourdhui,
            aujourdhui + timedelta(days=1),
        )
        if debut < fin_occ and fin > debut_occ:
            raisons.setdefault(
                s.chambre_id,
                f"Occupée par le séjour #{s.pk} (départ prévu le {fmt(fin_occ)}).",
            )
    return raisons


def disponibilites(debut, fin, exclure_reservation_id=None, nb_occupants=None,
                   categorie_id=None):
    """Toutes les chambres avec leur disponibilité sur la période."""
    qs = Chambre.objects.select_related("categorie").order_by("numero_chambre")
    if categorie_id:
        qs = qs.filter(categorie_id=categorie_id)
    chambres = list(qs)
    raisons = raisons_indisponibilite(
        chambres, debut, fin, exclure_reservation_id, nb_occupants
    )
    return [(c, raisons.get(c.pk)) for c in chambres]


# ------------------------------------------------------------- vérifications
def verifier_lignes(lignes, exclure_reservation_id=None, anciennes=None):
    """
    Vérifie les lignes CONCERNER d'une réservation.
    `lignes` : liste de dicts {chambre (objet), date_arrivee_prevue,
    date_depart_prevue, nb_occupants}.
    `anciennes` : {id_chambre: (arrivee, depart)} des lignes déjà enregistrées
    (une ligne inchangée n'est pas re-contrôlée sur la date passée).
    Lève ValidationError({"chambres": [...]}) avec toutes les erreurs.
    """
    erreurs = []
    if not lignes:
        raise ValidationError({"chambres": ["Ajoutez au moins une chambre."]})

    vus = set()
    aujourdhui = timezone.localdate()
    anciennes = anciennes or {}

    for ligne in lignes:
        ch = ligne["chambre"]
        nom = f"Chambre {ch.numero_chambre}"
        arr, dep = ligne["date_arrivee_prevue"], ligne["date_depart_prevue"]
        occ = ligne.get("nb_occupants", 1)

        if ch.pk in vus:
            erreurs.append(f"{nom} : elle apparaît plusieurs fois dans la réservation.")
            continue
        vus.add(ch.pk)

        if dep <= arr:
            erreurs.append(f"{nom} : le départ doit être après l'arrivée.")
            continue
        if occ < 1:
            erreurs.append(f"{nom} : au moins un occupant est requis.")
            continue
        if arr < aujourdhui and anciennes.get(ch.pk) != (arr, dep):
            erreurs.append(f"{nom} : la date d'arrivée ne peut pas être dans le passé.")
            continue

        raison = raisons_indisponibilite(
            [ch], arr, dep, exclure_reservation_id, occ
        ).get(ch.pk)
        if raison:
            erreurs.append(f"{nom} : {raison}")

    if erreurs:
        raise ValidationError({"chambres": erreurs})


def _charger_chambres(lignes):
    """Verrouille les chambres (évite deux réservations simultanées de la même chambre)."""
    ids = [l["chambre"].pk if hasattr(l["chambre"], "pk") else l["chambre"] for l in lignes]
    chambres = {
        c.pk: c
        for c in Chambre.objects.select_for_update()
        .select_related("categorie")
        .filter(pk__in=ids)
    }
    resultat = []
    for l in lignes:
        pk = l["chambre"].pk if hasattr(l["chambre"], "pk") else l["chambre"]
        resultat.append({**l, "chambre": chambres[pk]})
    return resultat


def verifier_employe(employe):
    if employe.statut != Employe.Statut.ACTIF:
        raise ValidationError({"employe": ["Cet employé n'est pas actif."]})


def recalculer_totaux(reservation):
    """Recalcule nb_personnes_total et montant_estime depuis les lignes CONCERNER."""
    total_pers, montant = 0, Decimal("0")
    for rc in reservation.chambres_reservees.all():
        total_pers += rc.nb_occupants
        montant += nb_nuits(rc.date_arrivee_prevue, rc.date_depart_prevue) * rc.tarif_nuit_applique
    reservation.nb_personnes_total = total_pers
    reservation.montant_estime = montant
    reservation.save(update_fields=["nb_personnes_total", "montant_estime"])


def _ecrire_ligne(reservation, ligne, existante=None):
    tarif = ligne.get("tarif_nuit_applique")
    if tarif is None:
        tarif = existante.tarif_nuit_applique if existante else ligne["chambre"].categorie.tarif_nuit
    valeurs = dict(
        date_arrivee_prevue=ligne["date_arrivee_prevue"],
        date_depart_prevue=ligne["date_depart_prevue"],
        nb_occupants=ligne.get("nb_occupants", 1),
        tarif_nuit_applique=tarif,
    )
    if existante:
        for k, v in valeurs.items():
            setattr(existante, k, v)
        existante.save()
        return existante
    return ReservationChambre.objects.create(
        reservation=reservation, chambre=ligne["chambre"], **valeurs
    )


# ------------------------------------------------------------------ opérations
@transaction.atomic
def creer_reservation(client, employe, lignes, confirmer=False):
    verifier_employe(employe)
    lignes = _charger_chambres(lignes)
    verifier_lignes(lignes)

    reservation = Reservation.objects.create(client=client, employe=employe)
    for ligne in lignes:
        _ecrire_ligne(reservation, ligne)
    recalculer_totaux(reservation)

    if confirmer:
        reservation = changer_statut(reservation, Statut.CONFIRMEE)
    return reservation


@transaction.atomic
def modifier_reservation(reservation, client=None, employe=None, lignes=None):
    reservation = Reservation.objects.select_for_update().get(pk=reservation.pk)

    if reservation.statut_reservation not in STATUTS_ACTIFS:
        raise ValidationError("Une réservation annulée ou terminée ne peut plus être modifiée.")
    if reservation.sejours.exists():
        raise ValidationError(
            "Un séjour a déjà commencé pour cette réservation : elle n'est plus modifiable."
        )

    if employe is not None:
        verifier_employe(employe)
        reservation.employe = employe
    if client is not None:
        reservation.client = client
    reservation.save()

    if lignes is not None:
        lignes = _charger_chambres(lignes)
        existantes = {rc.chambre_id: rc for rc in reservation.chambres_reservees.all()}
        anciennes = {
            cid: (rc.date_arrivee_prevue, rc.date_depart_prevue)
            for cid, rc in existantes.items()
        }
        verifier_lignes(lignes, reservation.pk, anciennes)

        nouveaux_ids = {l["chambre"].pk for l in lignes}
        for cid, rc in existantes.items():
            if cid not in nouveaux_ids:
                rc.delete()
        for ligne in lignes:
            _ecrire_ligne(reservation, ligne, existantes.get(ligne["chambre"].pk))
        reservation.refresh_from_db()
        recalculer_totaux(reservation)

    return reservation


@transaction.atomic
def changer_statut(reservation, nouveau):
    reservation = Reservation.objects.select_for_update().get(pk=reservation.pk)
    ancien = reservation.statut_reservation

    if nouveau not in TRANSITIONS[ancien]:
        raise ValidationError(
            f"Passage impossible de « {Statut(ancien).label} » à « {Statut(nouveau).label} »."
        )

    lignes = list(reservation.chambres_reservees.select_related("chambre__categorie"))

    if nouveau == Statut.CONFIRMEE:
        if not lignes:
            raise ValidationError("Une réservation sans chambre ne peut pas être confirmée.")
        verifier_lignes(
            [
                dict(chambre=rc.chambre, date_arrivee_prevue=rc.date_arrivee_prevue,
                     date_depart_prevue=rc.date_depart_prevue, nb_occupants=rc.nb_occupants)
                for rc in lignes
            ],
            exclure_reservation_id=reservation.pk,
            anciennes={rc.chambre_id: (rc.date_arrivee_prevue, rc.date_depart_prevue)
                       for rc in lignes},
        )

    sejours = reservation.sejours.all()
    if nouveau == Statut.ANNULEE and sejours.exists():
        raise ValidationError(
            "Impossible d'annuler : un séjour est déjà rattaché à cette réservation."
        )
    if nouveau == Statut.TERMINEE:
        if not sejours.exists():
            raise ValidationError("Aucun séjour n'a eu lieu pour cette réservation.")
        if sejours.filter(statut_sejour="EN_COURS").exists():
            raise ValidationError("Un séjour de cette réservation est encore en cours.")

    reservation.statut_reservation = nouveau
    reservation.save(update_fields=["statut_reservation"])
    return reservation


def verifier_suppression(reservation):
    if reservation.statut_reservation in (Statut.CONFIRMEE, Statut.TERMINEE):
        raise ValidationError(
            "Une réservation confirmée ou terminée ne peut pas être supprimée : annulez-la."
        )
    if reservation.sejours.exists():
        raise ValidationError("Des séjours sont rattachés à cette réservation.")
