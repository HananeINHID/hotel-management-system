import django_filters

from .models import Avis


class AvisFilter(django_filters.FilterSet):
    """Filtres : ?client=&sejour=&note=&note_min=&note_max=&date_min=&date_max="""

    client = django_filters.NumberFilter(field_name='client_id')
    sejour = django_filters.NumberFilter(field_name='sejour_id')
    note_min = django_filters.NumberFilter(field_name='note', lookup_expr='gte')
    note_max = django_filters.NumberFilter(field_name='note', lookup_expr='lte')
    date_min = django_filters.DateFilter(field_name='date_avis', lookup_expr='gte')
    date_max = django_filters.DateFilter(field_name='date_avis', lookup_expr='lte')

    class Meta:
        model = Avis
        fields = ['client', 'sejour', 'note']
