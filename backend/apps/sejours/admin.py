
from django.contrib import admin

from .models import Sejour


@admin.register(Sejour)
class SejourAdmin(admin.ModelAdmin):

    list_display = (
        "id_sejour",
        "reservation",
        "chambre",
        "arrivee_reelle",
        "depart_reel",
        "statut_sejour",
        "est_archive",
        "date_archivage",
    )

    list_filter = (
        "statut_sejour",
        "est_archive",
    )

    search_fields = (
        "id_sejour",
        "reservation__client__nom",
        "reservation__client__prenom",
        "chambre__numero_chambre",
    )

    readonly_fields = (
        "arrivee_reelle",
        "depart_reel",
        "date_archivage",
    )

    ordering = ("-arrivee_reelle", "-id_sejour")
