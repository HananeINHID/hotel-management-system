from django.db import models
from django.core.validators import MinValueValidator


class CategorieChambre(models.Model):
    id_categorie = models.AutoField(primary_key=True)
    libelle = models.CharField(max_length=100)
    capacite = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    tarif_nuit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    description = models.TextField(blank=True)

    def __str__(self):
        return self.libelle


class Chambre(models.Model):
    class EtatPhysique(models.TextChoices):
        DISPONIBLE = "disponible", "Disponible"
        HORS_SERVICE = "hors_service", "Hors service"
        EN_MAINTENANCE = "en_maintenance", "En maintenance"

    id_chambre = models.AutoField(primary_key=True)
    numero_chambre = models.CharField(
        max_length=10,
        unique=True
    )
    etage = models.IntegerField()
    etat_physique = models.CharField(
        max_length=20,
        choices=EtatPhysique.choices,
        default=EtatPhysique.DISPONIBLE
    )
    description = models.TextField(blank=True)

    categorie = models.ForeignKey(
        CategorieChambre,
        on_delete=models.PROTECT,
        related_name="chambres"
    )

    def __str__(self):
        return f"Chambre {self.numero_chambre}"