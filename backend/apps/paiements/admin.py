from django.contrib import admin
from .models import Paiement


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('id_paiement', 'reference_paiement', 'sejour', 'employe', 'montant', 'mode_paiement', 'statut', 'date_paiement')
    list_filter = ('statut', 'mode_paiement', 'date_paiement')
    search_fields = ('reference_paiement', 'employe__nom', 'employe__prenom')
    ordering = ('-date_paiement',)
