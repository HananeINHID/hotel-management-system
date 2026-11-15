
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Sejour


@transaction.atomic
def check_in(reservation_chambre, observations="", arrivee_reelle=None):

    reservation = reservation_chambre.reservation

    if reservation.statut_reservation != "CONFIRMEE":
        raise ValidationError(
            "Le check-in est autorisé uniquement pour une réservation confirmée."
        )

    existe = Sejour.objects.filter(
        reservation_id=reservation_chambre.reservation_id,
        chambre_id=reservation_chambre.chambre_id,
    ).exists()

    if existe:
        raise ValidationError(
            "Un séjour existe déjà pour cette réservation et cette chambre."
        )

    arrivee = arrivee_reelle or timezone.now()

    if arrivee.date() < reservation_chambre.date_arrivee_prevue:
        raise ValidationError(
            "L'arrivée réelle ne peut pas précéder la date prévue."
        )

    if arrivee.date() >= reservation_chambre.date_depart_prevue:
        raise ValidationError(
            "L'arrivée doit être antérieure à la date de départ prévue."
        )

    sejour = Sejour(
        reservation_id=reservation_chambre.reservation_id,
        chambre_id=reservation_chambre.chambre_id,
        arrivee_reelle=arrivee,
        statut_sejour=Sejour.Statut.EN_COURS,
        observations=observations or "",
    )

    sejour.full_clean()
    sejour.save()

    return sejour


@transaction.atomic
def check_out(sejour, observations="", depart_reel=None):

    sejour = Sejour.objects.select_for_update().get(pk=sejour.pk)

    if sejour.statut_sejour != Sejour.Statut.EN_COURS:
        raise ValidationError(
            "Seul un séjour en cours peut être clôturé."
        )

    if sejour.est_archive:
        raise ValidationError(
            "Un séjour archivé ne peut pas être clôturé."
        )

    depart = depart_reel or timezone.now()

    if not sejour.arrivee_reelle or depart <= sejour.arrivee_reelle:
        raise ValidationError(
            "Le départ doit être postérieur à l'arrivée réelle."
        )

    sejour.depart_reel = depart
    sejour.statut_sejour = Sejour.Statut.TERMINE

    if observations:
        sejour.observations = (
            f"{sejour.observations}\n{observations}".strip()
        )

    sejour.full_clean()
    sejour.save()

    return sejour


@transaction.atomic
def archiver(sejour):

    sejour = Sejour.objects.select_for_update().get(pk=sejour.pk)

    if sejour.statut_sejour != Sejour.Statut.TERMINE:
        raise ValidationError(
            "Seul un séjour terminé peut être archivé."
        )

    if sejour.est_archive:
        raise ValidationError(
            "Ce séjour est déjà archivé."
        )

    sejour.est_archive = True
    sejour.date_archivage = timezone.now()

    sejour.full_clean()
    sejour.save()

    return sejour


@transaction.atomic
def desarchiver(sejour):

    sejour = Sejour.objects.select_for_update().get(pk=sejour.pk)

    if not sejour.est_archive:
        raise ValidationError(
            "Ce séjour n'est pas archivé."
        )

    sejour.est_archive = False
    sejour.date_archivage = None

    sejour.full_clean()
    sejour.save()

    return sejour
