import django_filters
from .models import Maintenance


class MaintenanceFilter(django_filters.FilterSet):
    """Filtres avancés pour les maintenances."""
    chambre = django_filters.NumberFilter(field_name='chambre__id_chambre', label='ID Chambre')
    chambre_numero = django_filters.CharFilter(
        field_name='chambre__numero_chambre',
        lookup_expr='icontains',
        label='Numéro de chambre',
    )
    statut = django_filters.ChoiceFilter(
        choices=Maintenance.Statut.choices,
        field_name='statut',
        label='Statut',
    )
    type = django_filters.ChoiceFilter(
        choices=Maintenance.Type.choices,
        field_name='type',
        label='Type',
    )
    bloquante = django_filters.BooleanFilter(field_name='bloquante', label='Bloquante')
    employe = django_filters.NumberFilter(field_name='employe__id_employe', label='ID Employé')
    debut_apres = django_filters.DateTimeFilter(
        field_name='debut',
        lookup_expr='gte',
        label='Début après (YYYY-MM-DD)',
    )
    debut_avant = django_filters.DateTimeFilter(
        field_name='debut',
        lookup_expr='lte',
        label='Début avant (YYYY-MM-DD)',
    )
    fin_apres = django_filters.DateTimeFilter(
        field_name='fin',
        lookup_expr='gte',
        label='Fin après (YYYY-MM-DD)',
    )

    class Meta:
        model = Maintenance
        fields = ['chambre', 'statut', 'type', 'bloquante', 'employe']
