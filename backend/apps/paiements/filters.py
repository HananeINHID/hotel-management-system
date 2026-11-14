import django_filters
from .models import Paiement


class PaiementFilter(django_filters.FilterSet):
    """
    Filtres pour les paiements : ?statut=&mode_paiement=&sejour=&employe=&date_min=&date_max=
    """
    statut = django_filters.ChoiceFilter(choices=Paiement.StatutPaiement.choices)
    mode_paiement = django_filters.ChoiceFilter(choices=Paiement.ModePaiement.choices)
    sejour = django_filters.NumberFilter(field_name='sejour_id')
    employe = django_filters.NumberFilter(field_name='employe_id')
    date_min = django_filters.DateFilter(field_name='date_paiement', lookup_expr='date__gte')
    date_max = django_filters.DateFilter(field_name='date_paiement', lookup_expr='date__lte')

    class Meta:
        model = Paiement
        fields = ['statut', 'mode_paiement', 'sejour', 'employe']
