from django.db import models


class Client(models.Model):

    id_client = models.AutoField(primary_key=True)

    nom = models.CharField(max_length=100)

    prenom = models.CharField(max_length=100)

    piece_identite = models.CharField(
        max_length=50,
        unique=True
    )

    telephone = models.CharField(max_length=20)

    email = models.EmailField(
        max_length=254,
        blank=True,
        null=True
    )

    nationalite = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    class Meta:
        db_table = "clients_client"
        verbose_name = "Client"
        verbose_name_plural = "Clients"

    def __str__(self):
        return f"{self.nom} {self.prenom}"