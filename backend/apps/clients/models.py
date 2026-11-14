from django.db import models


class Client(models.Model):
    """
    Modèle CLIENT selon le MLD :
    CLIENT(id_client PK, nom, prenom, piece_identite UQ, telephone, email, nationalite)
    """

    id_client = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    piece_identite = models.CharField(
        max_length=50,
        unique=True,
        help_text="CIN ou numéro de passeport (unique)",
    )
    telephone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(max_length=150, blank=True)
    nationalite = models.CharField(max_length=80, blank=True)

    class Meta:
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom}"
