import uuid
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


def generer_reference_paiement(date_ref=None) -> str:
    """
    Génère une référence unique au format PAY-AAAAMMJJ-XXXX.
    """
    dt = date_ref or timezone.now()
    date_str = dt.strftime('%Y%m%d')
    suffix = uuid.uuid4().hex[:4].upper()
    return f"PAY-{date_str}-{suffix}"


class Paiement(models.Model):
    """
    Modèle PAIEMENT selon le MCD :
    id_paiement (PK), date_paiement, montant (Decimal), mode_paiement, statut, reference_paiement (unique)
    Associations :
    - REGLER : PAIEMENT (1,1) -> SEJOUR (0,N)
    - ENREGISTRER_PAI : PAIEMENT (1,1) -> EMPLOYE (0,N)
    """

    class ModePaiement(models.TextChoices):
        ESPECES = 'ESPECES', 'Espèces'
        CARTE_BANCAIRE = 'CARTE_BANCAIRE', 'Carte bancaire'
        VIREMENT = 'VIREMENT', 'Virement bancaire'
        CHEQUE = 'CHEQUE', 'Chèque'

    class StatutPaiement(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        VALIDE = 'VALIDE', 'Validé'
        REFUSE = 'REFUSE', 'Refusé'
        REMBOURSE = 'REMBOURSE', 'Remboursé'

    id_paiement = models.AutoField(primary_key=True)
    sejour = models.ForeignKey(
        'sejours.Sejour',
        on_delete=models.PROTECT,
        related_name='paiements',
        db_column='id_sejour',
        help_text="Séjour réglé par ce versement"
    )
    employe = models.ForeignKey(
        'employes.Employe',
        on_delete=models.PROTECT,
        related_name='paiements',
        db_column='id_employe',
        help_text="Employé ayant encaissé ou enregistré le paiement"
    )
    date_paiement = models.DateTimeField(
        default=timezone.now,
        help_text="Date et heure de l'encaissement"
    )
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Montant encaissé en MAD (doit être strictement > 0)"
    )
    mode_paiement = models.CharField(
        max_length=30,
        choices=ModePaiement.choices,
        help_text="Moyen de paiement utilisé"
    )
    statut = models.CharField(
        max_length=20,
        choices=StatutPaiement.choices,
        default=StatutPaiement.EN_ATTENTE,
        help_text="État du paiement (EN_ATTENTE, VALIDE, REFUSE, REMBOURSE)"
    )
    reference_paiement = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        help_text="Référence transactionnelle unique (auto-générée si omise)"
    )

    class Meta:
        db_table = 'paiements_paiement'
        ordering = ['-date_paiement']
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'

    def save(self, *args, **kwargs):
        # Générer automatiquement la référence si non spécifiée
        if not self.reference_paiement:
            ref = generer_reference_paiement(self.date_paiement)
            # S'assurer de l'unicité
            while Paiement.objects.filter(reference_paiement=ref).exists():
                ref = generer_reference_paiement(self.date_paiement)
            self.reference_paiement = ref
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference_paiement} ({self.montant} MAD) - {self.get_statut_display()}"
