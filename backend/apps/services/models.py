from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Service(models.Model):
    """
    Modèle SERVICE selon le MCD :
    id_service (PK), nom, type_service, prix_unitaire (Decimal), description
    """

    class TypeService(models.TextChoices):
        RESTAURATION = 'RESTAURATION', 'Restauration'
        SPA = 'SPA', 'Spa'
        BLANCHISSERIE = 'BLANCHISSERIE', 'Blanchisserie'
        TRANSPORT = 'TRANSPORT', 'Transport'
        MINIBAR = 'MINIBAR', 'Minibar'
        AUTRE = 'AUTRE', 'Autre'

    id_service = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=150)
    type_service = models.CharField(
        max_length=30,
        choices=TypeService.choices,
        help_text="Catégorie du service proposé"
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Prix unitaire standard en MAD (doit être >= 0)"
    )
    description = models.TextField(
        blank=True,
        help_text="Description détaillée du service"
    )

    class Meta:
        db_table = 'services_service'
        ordering = ['nom']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return f"{self.nom} ({self.prix_unitaire} MAD)"


class ConsommationService(models.Model):
    """
    Modèle CONSOMMATION_SERVICE selon le MCD :
    id_consommation (PK), date_consommation, quantite, prix_applique (Decimal)
    Associations :
    - AVOIR_CONSO : CONSOMMATION (1,1) -> SERVICE (0,N)
    - PORTER_SUR : CONSOMMATION (1,1) -> SEJOUR (0,N)
    """

    id_consommation = models.AutoField(primary_key=True)
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.PROTECT,
        related_name='consommations',
        db_column='id_service',
        help_text="Service consommé"
    )
    sejour = models.ForeignKey(
        'sejours.Sejour',
        on_delete=models.PROTECT,
        related_name='consommations',
        db_column='id_sejour',
        help_text="Séjour concerné par la prestation"
    )
    date_consommation = models.DateTimeField(
        default=timezone.now,
        help_text="Date et heure de la prestation"
    )
    quantite = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Quantité consommée (doit être >= 1)"
    )
    prix_applique = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Prix unitaire facturé au moment de la prestation"
    )

    class Meta:
        db_table = 'services_consommation'
        ordering = ['-date_consommation']
        verbose_name = 'Consommation de service'
        verbose_name_plural = 'Consommations de services'

    def __str__(self):
        return f"Conso #{self.id_consommation} - {self.service.nom} (x{self.quantite}) Séjour #{self.sejour_id}"

    @property
    def montant_total(self) -> Decimal:
        """Calcul dynamique du montant total de la ligne de consommation."""
        if self.quantite is not None and self.prix_applique is not None:
            return Decimal(self.quantite) * Decimal(self.prix_applique)
        return Decimal('0.00')
