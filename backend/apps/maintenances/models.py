from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator


class Maintenance(models.Model):

    class Statut(models.TextChoices):
        PLANIFIEE = "planifiee", "Planifiée"
        EN_COURS = "en_cours", "En cours"
        TERMINEE = "terminee", "Terminée"
        ANNULEE = "annulee", "Annulée"

    class Type(models.TextChoices):
        PREVENTIVE = "preventive", "Préventive"
        CORRECTIVE = "corrective", "Corrective"

    id_maintenance = models.AutoField(primary_key=True)

    chambre = models.ForeignKey(
        "chambres.Chambre",
        on_delete=models.PROTECT,
        related_name="maintenances"
    )

    employe = models.ForeignKey(
        "employes.Employe",
        on_delete=models.PROTECT,
        related_name="maintenances"
    )

    debut = models.DateTimeField()
    fin = models.DateTimeField(null=True, blank=True)

    type = models.CharField(
        max_length=20,
        choices=Type.choices
    )

    description = models.TextField()

    cout = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.PLANIFIEE
    )

    bloquante = models.BooleanField(default=True)

    def clean(self):
        if self.fin and self.fin <= self.debut:
            raise ValidationError({
                "fin": "La date de fin doit être après le début."
            })

    def __str__(self):
        return f"Maintenance {self.id_maintenance}"

