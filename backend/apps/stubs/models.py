"""
STUB TEMPORAIRE - À SUPPRIMER À L'INTÉGRATION
Modèle minimal fourni temporairement pour le bon fonctionnement des modules de Karima
(Paiements, Services, Consommations) en attendant le modèle complet de Hmza.
"""
from django.db import models


class Sejour(models.Model):
    """
    Séjour minimal (stub pour tests et développement du module Karima).
    """
    id_sejour = models.AutoField(primary_key=True)
    arrivee_reelle = models.DateTimeField(null=True, blank=True)
    depart_reel = models.DateTimeField(null=True, blank=True)
    statut_sejour = models.CharField(
        max_length=20,
        default='EN_COURS',
        help_text="Ex: EN_COURS, TERMINE, ANNULE"
    )
    est_archive = models.BooleanField(
        default=False,
        help_text="Indique si le séjour a été archivé"
    )

    class Meta:
        app_label = 'sejours'
        db_table = 'sejours_sejour'
        verbose_name = 'Séjour (Stub temporaire)'
        verbose_name_plural = 'Séjours (Stubs temporaires)'

    def __str__(self):
        return f"Séjour #{self.id_sejour} [{self.statut_sejour}]"
