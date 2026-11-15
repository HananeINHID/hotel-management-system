from django.db import models
from django.core.exceptions import ValidationError


class Reservation(models.Model):

    class Statut(models.TextChoices):
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        CONFIRMEE = "CONFIRMEE", "Confirmée"
        ANNULEE = "ANNULEE", "Annulée"
        TERMINEE = "TERMINEE", "Terminée"

    id_reservation = models.AutoField(primary_key=True)

    date_reservation = models.DateTimeField(auto_now_add=True)

    statut_reservation = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )

    nb_personnes_total = models.PositiveIntegerField(default=1)

    montant_estime = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.PROTECT,
        db_column="id_client",
        related_name="reservations"
    )

    employe = models.ForeignKey(
        "employes.Employe",
        on_delete=models.PROTECT,
        db_column="id_employe",
        related_name="reservations"
    )

    class Meta:
        db_table = "reservations_reservation"
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"

    def __str__(self):
        return f"Réservation #{self.id_reservation}"


class ReservationChambre(models.Model):

    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        db_column="id_reservation",
        related_name="chambres_reservees"
    )

    chambre = models.ForeignKey(
        "chambres.Chambre",
        on_delete=models.PROTECT,
        db_column="id_chambre",
        related_name="reservations_chambre"
    )

    date_arrivee_prevue = models.DateField()

    date_depart_prevue = models.DateField()

    nb_occupants = models.PositiveIntegerField(default=1)

    tarif_nuit_applique = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        db_table = "reservations_reservation_chambre"
        verbose_name = "Chambre réservée"
        verbose_name_plural = "Chambres réservées"

        constraints = [
            models.UniqueConstraint(
                fields=["reservation", "chambre"],
                name="unique_reservation_chambre"
            ),
            models.CheckConstraint(
                condition=models.Q(
                    date_depart_prevue__gt=models.F("date_arrivee_prevue")
                ),
                name="date_depart_apres_arrivee_reservation"
            )
        ]

    def __str__(self):
        return (
            f"Réservation #{self.reservation_id} "
            f"- Chambre #{self.chambre_id}"
        )

    def clean(self):
        super().clean()

        if (
            self.date_arrivee_prevue
            and self.date_depart_prevue
            and self.date_depart_prevue <= self.date_arrivee_prevue
        ):
            raise ValidationError(
                "La date de départ prévue doit être postérieure "
                "à la date d'arrivée prévue."
            )

        if self.nb_occupants is not None and self.nb_occupants < 1:
            raise ValidationError(
                "Le nombre d'occupants doit être supérieur à zéro."
            )