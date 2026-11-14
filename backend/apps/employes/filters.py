import django_filters
from .models import Employe


class EmployeFilter(django_filters.FilterSet):
    """
    Filtres pour les employés : ?statut=&poste=
    """
    statut = django_filters.ChoiceFilter(choices=Employe.Statut.choices)
    poste = django_filters.ChoiceFilter(choices=Employe.Poste.choices)

    class Meta:
        model = Employe
        fields = ['statut', 'poste']
