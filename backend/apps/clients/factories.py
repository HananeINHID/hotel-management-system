"""
Fonctions de test du module Clients + Avis (Safae) pour créer des données de test cohérentes avec le vrai
modèle Séjour (un séjour exige une réservation et une chambre).

Utilisation dans n'importe quel tests.py :

    from apps.clients.factories import creer_sejour

    sejour = creer_sejour()                               # EN_COURS
    sejour = creer_sejour(statut_sejour="TERMINE")
    sejour = creer_sejour(statut_sejour="TERMINE", est_archive=True)
    sejour = creer_sejour(client=mon_client)              # séjour de ce client

Chaque appel crée sa propre chambre, sa propre réservation et son propre
employé, avec des valeurs uniques : on peut l'appeler plusieurs fois dans un
même test sans conflit d'unicité.
"""
from datetime import date, timedelta
from decimal import Decimal
from itertools import count

from django.utils import timezone

from apps.chambres.models import CategorieChambre, Chambre
from apps.clients.models import Client
from apps.employes.models import Employe
from apps.reservations.models import Reservation, ReservationChambre

from apps.sejours.models import Sejour

_compteur = count(1)


def _n():
    return next(_compteur)


def creer_client(**kwargs):
    n = _n()
    data = {
        "nom": f"Client{n}",
        "prenom": "Test",
        "piece_identite": f"TEST{n:05d}",
        "telephone": "+212 600 000 000",
    }
    data.update(kwargs)
    return Client.objects.create(**data)


def creer_employe(**kwargs):
    n = _n()
    data = {
        "nom": f"Employe{n}",
        "prenom": "Test",
        "poste": Employe.Poste.RECEPTIONNISTE,
        "email": f"employe{n}@test.hotel.ma",
        "date_embauche": date(2024, 1, 1),
        "statut": Employe.Statut.ACTIF,
    }
    data.update(kwargs)
    return Employe.objects.create(**data)


def creer_chambre(**kwargs):
    n = _n()
    categorie = kwargs.pop("categorie", None) or CategorieChambre.objects.create(
        libelle=f"Catégorie test {n}",
        capacite=2,
        tarif_nuit=Decimal("500.00"),
    )
    data = {
        "numero_chambre": f"T{n}",
        "etage": 1,
        "categorie": categorie,
    }
    data.update(kwargs)
    return Chambre.objects.create(**data)


def creer_reservation_chambre(client=None, chambre=None, employe=None,
                              statut_reservation=Reservation.Statut.CONFIRMEE,
                              date_arrivee_prevue=None, nuits=3):
    """Crée une réservation (avec son client et son employé) et une chambre réservée."""
    client = client or creer_client()
    chambre = chambre or creer_chambre()
    employe = employe or creer_employe()
    arrivee = date_arrivee_prevue or timezone.localdate()

    reservation = Reservation.objects.create(
        client=client,
        employe=employe,
        statut_reservation=statut_reservation,
    )
    return ReservationChambre.objects.create(
        reservation=reservation,
        chambre=chambre,
        date_arrivee_prevue=arrivee,
        date_depart_prevue=arrivee + timedelta(days=nuits),
        tarif_nuit_applique=chambre.categorie.tarif_nuit,
    )


def creer_sejour(statut_sejour=Sejour.Statut.EN_COURS, est_archive=False,
                 client=None, chambre=None, **kwargs):
    """
    Crée un séjour complet : client, employé, chambre, réservation,
    chambre réservée, puis le séjour lui-même.
    """
    rc = creer_reservation_chambre(client=client, chambre=chambre)
    maintenant = timezone.now()

    data = {
        "reservation": rc.reservation,
        "chambre": rc.chambre,
        "statut_sejour": statut_sejour,
        "est_archive": est_archive,
        "arrivee_reelle": maintenant - timedelta(days=2),
    }
    if statut_sejour == Sejour.Statut.TERMINE:
        data["depart_reel"] = maintenant - timedelta(hours=1)
    if est_archive:
        data["date_archivage"] = maintenant
    data.update(kwargs)
    return Sejour.objects.create(**data)
