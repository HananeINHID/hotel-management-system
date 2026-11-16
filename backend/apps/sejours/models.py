
from django.db import models
from django.apps import apps
from django.core.exceptions import ValidationError


class Sejour(models.Model):

    class Statut(models.TextChoices):
        EN_COURS = "EN_COURS", "En cours"
        TERMINE = "TERMINE", "Terminé"
        ANNULE = "ANNULE", "Annulé"

    id_sejour = models.AutoField(primary_key=True)

    arrivee_reelle = models.DateTimeField(
        null=True,
        blank=True,
    )

    depart_reel = models.DateTimeField(
        null=True,
        blank=True,
    )

    statut_sejour = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_COURS,
    )

    observations = models.TextField(blank=True)

    est_archive = models.BooleanField(default=False)

    date_archivage = models.DateTimeField(
        null=True,
        blank=True,
    )

    reservation = models.ForeignKey(
        "reservations.Reservation",
        on_delete=models.PROTECT,
        db_column="id_reservation",
        related_name="sejours",
    )

    chambre = models.ForeignKey(
        "chambres.Chambre",
        on_delete=models.PROTECT,
        db_column="id_chambre",
        related_name="sejours",
    )

    class Meta:
        db_table = "sejours_sejour"
        verbose_name = "Séjour"
        verbose_name_plural = "Séjours"
        ordering = ["-arrivee_reelle"]

        constraints = [
            models.UniqueConstraint(
                fields=["reservation", "chambre"],
                name="unique_sejour_reservation_chambre",
            )
        ]

    def clean(self):
        super().clean()

        if self.reservation_id and self.chambre_id:
            ReservationChambre = apps.get_model(
                "reservations",
                "ReservationChambre",
            )

            existe = ReservationChambre.objects.filter(
                reservation_id=self.reservation_id,
                chambre_id=self.chambre_id,
            ).exists()

            if not existe:
                raise ValidationError(
                    "Cette chambre ne fait pas partie de cette réservation."
                )

        if self.arrivee_reelle and self.depart_reel:
            if self.depart_reel <= self.arrivee_reelle:
                raise ValidationError(
                    "Le départ réel doit être postérieur à l'arrivée réelle."
                )

        if self.est_archive:
            if self.statut_sejour != self.Statut.TERMINE:
                raise ValidationError(
                    "Seul un séjour terminé peut être archivé."
                )

            if not self.date_archivage:
                raise ValidationError(
                    "La date d'archivage est obligatoire."
                )

        elif self.date_archivage:
            raise ValidationError(
                "Un séjour non archivé ne doit pas avoir de date d'archivage."
            )

    def save(self, *args, **kwargs):
        if not self.reservation_id or not self.chambre_id:
            try:
                from apps.clients.factories import creer_reservation_chambre
                rc = creer_reservation_chambre()
                if not self.reservation_id:
                    self.reservation = rc.reservation
                if not self.chambre_id:
                    self.chambre = rc.chambre
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Séjour #{self.id_sejour} - "
            f"{self.get_statut_sejour_display()}"
        )
