from django.contrib import admin
from .models import Service, ConsommationService


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id_service', 'nom', 'type_service', 'prix_unitaire')
    list_filter = ('type_service',)
    search_fields = ('nom', 'description')
    ordering = ('nom',)


@admin.register(ConsommationService)
class ConsommationServiceAdmin(admin.ModelAdmin):
    list_display = ('id_consommation', 'service', 'sejour', 'quantite', 'prix_applique', 'date_consommation')
    list_filter = ('service__type_service', 'date_consommation')
    search_fields = ('service__nom', 'sejour__id_sejour')
    ordering = ('-date_consommation',)
