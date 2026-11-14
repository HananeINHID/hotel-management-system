from django.contrib import admin

from .models import Avis


@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    list_display = ('id_avis', 'client', 'sejour', 'note', 'date_avis')
    list_filter = ('note',)
    search_fields = ('commentaire', 'client__nom', 'client__prenom')
