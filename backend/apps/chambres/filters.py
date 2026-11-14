import django_filters
from .models import Chambre, CategorieChambre


class ChambreFilter(django_filters.FilterSet):
    """Filtres avancés pour le listing des chambres."""
    categorie = django_filters.ModelChoiceFilter(
        queryset=CategorieChambre.objects.all(),
        field_name='categorie',
        label='Catégorie',
    )
    etage = django_filters.NumberFilter(field_name='etage', label='Étage')
    etage_min = django_filters.NumberFilter(field_name='etage', lookup_expr='gte', label='Étage min')
    etage_max = django_filters.NumberFilter(field_name='etage', lookup_expr='lte', label='Étage max')
    etat_physique = django_filters.ChoiceFilter(
        choices=Chambre.EtatPhysique.choices,
        field_name='etat_physique',
        label='État physique',
    )

    class Meta:
        model = Chambre
        fields = ['categorie', 'etage', 'etat_physique']
