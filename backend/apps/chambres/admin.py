from django.contrib import admin
from .models import CategorieChambre, Chambre


@admin.register(CategorieChambre)
class CategorieChambreAdmin(admin.ModelAdmin):
    list_display = ('id_categorie', 'libelle', 'capacite', 'tarif_nuit', 'nb_chambres')
    search_fields = ('libelle',)
    ordering = ('libelle',)

    @admin.display(description='Nb chambres')
    def nb_chambres(self, obj):
        return obj.chambres.count()


@admin.register(Chambre)
class ChambreAdmin(admin.ModelAdmin):
    list_display = ('id_chambre', 'numero_chambre', 'etage', 'categorie', 'etat_physique')
    list_filter = ('etat_physique', 'categorie', 'etage')
    search_fields = ('numero_chambre', 'description')
    ordering = ('numero_chambre',)
