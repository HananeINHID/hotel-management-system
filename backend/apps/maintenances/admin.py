from django.contrib import admin
from .models import Maintenance


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = (
        'id_maintenance', 'chambre', 'employe', 'type', 'statut',
        'bloquante', 'debut', 'fin', 'cout'
    )
    list_filter = ('statut', 'type', 'bloquante')
    search_fields = ('description', 'chambre__numero_chambre', 'employe__nom')
    ordering = ('-debut',)
    date_hierarchy = 'debut'
