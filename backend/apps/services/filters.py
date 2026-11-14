import django_filters
from .models import Service, ConsommationService


class ServiceFilter(django_filters.FilterSet):
    """
    Filtres pour le catalogue de services : ?type_service=
    """
    type_service = django_filters.ChoiceFilter(choices=Service.TypeService.choices)

    class Meta:
        model = Service
        fields = ['type_service']


class ConsommationServiceFilter(django_filters.FilterSet):
    """
    Filtres pour les consommations : ?sejour=&service=
    """
    sejour = django_filters.NumberFilter(field_name='sejour_id')
    service = django_filters.NumberFilter(field_name='service_id')

    class Meta:
        model = ConsommationService
        fields = ['sejour', 'service']
