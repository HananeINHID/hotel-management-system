from django.contrib import admin
from .models import Employe


@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    list_display = ('id_employe', 'nom', 'prenom', 'poste', 'email', 'telephone', 'statut', 'date_embauche')
    list_filter = ('statut', 'poste', 'date_embauche')
    search_fields = ('nom', 'prenom', 'email', 'telephone')
    ordering = ('nom', 'prenom')
