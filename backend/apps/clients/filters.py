import django_filters

from .models import Client


class ClientFilter(django_filters.FilterSet):
    """Filtres : ?nationalite=&nom=&prenom="""

    nationalite = django_filters.CharFilter(lookup_expr='iexact')
    nom = django_filters.CharFilter(lookup_expr='icontains')
    prenom = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Client
        fields = ['nationalite', 'nom', 'prenom']
