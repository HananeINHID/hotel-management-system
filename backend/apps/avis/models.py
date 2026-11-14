from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Avis(models.Model):
    """
    Modèle AVIS selon le MLD :
    AVIS(id_avis PK, date_avis, note, commentaire,
         id_client FK -> CLIENT, id_sejour FK -> SEJOUR, UQ(id_sejour))
    Associations :
    - REDIGER : AVIS (1,1) -> CLIENT (0,N)
    - EVALUER : AVIS (1,1) -> SEJOUR (0,1)   => un seul avis par séjour (OneToOne)
    """

    id_avis = models.AutoField(primary_key=True)
    date_avis = models.DateField(default=timezone.localdate)
    note = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Note de 1 à 5",
    )
    commentaire = models.TextField(blank=True)
    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.PROTECT,
        related_name='avis',
        db_column='id_client',
    )
    sejour = models.OneToOneField(
        'sejours.Sejour',
        on_delete=models.PROTECT,
        related_name='avis',
        db_column='id_sejour',
    )

    class Meta:
        ordering = ['-date_avis', '-id_avis']
        verbose_name_plural = 'avis'
        constraints = [
            models.CheckConstraint(
                condition=models.Q(note__gte=1) & models.Q(note__lte=5),
                name='chk_avis_note_1_5',
            ),
        ]

    def __str__(self):
        return f"Avis #{self.id_avis} — {self.note}/5"
