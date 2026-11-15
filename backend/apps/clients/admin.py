from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id_client', 'nom', 'prenom', 'piece_identite', 'telephone', 'nationalite')
    search_fields = ('nom', 'prenom', 'piece_identite', 'email')
