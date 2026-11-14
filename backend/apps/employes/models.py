from django.db import models


class Employe(models.Model):
    """
    Modèle EMPLOYE selon le MCD :
    id_employe (PK), nom, prenom, poste, telephone, email, date_embauche, statut
    """

    class Poste(models.TextChoices):
        RECEPTIONNISTE = 'RECEPTIONNISTE', 'Réceptionniste'
        FEMME_DE_CHAMBRE = 'FEMME_DE_CHAMBRE', 'Femme de chambre'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        RESTAURATION = 'RESTAURATION', 'Restauration'
        MANAGER = 'MANAGER', 'Manager'
        COMPTABLE = 'COMPTABLE', 'Comptable'
        AUTRE = 'AUTRE', 'Autre'

    class Statut(models.TextChoices):
        ACTIF = 'ACTIF', 'Actif'
        EN_CONGE = 'EN_CONGE', 'En congé'
        INACTIF = 'INACTIF', 'Inactif'

    id_employe = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    poste = models.CharField(
        max_length=30,
        choices=Poste.choices,
        help_text="Poste occupé au sein de l'établissement"
    )
    telephone = models.CharField(max_length=25, blank=True)
    email = models.EmailField(
        unique=True,
        help_text="Adresse email professionnelle unique"
    )
    date_embauche = models.DateField(
        help_text="Date d'embauche de l'employé"
    )
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.ACTIF,
        help_text="Statut d'activité (ACTIF, EN_CONGE, INACTIF)"
    )

    class Meta:
        db_table = 'employes_employe'
        ordering = ['nom', 'prenom']
        verbose_name = 'Employé'
        verbose_name_plural = 'Employés'

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.get_poste_display()})"
