from django.contrib import admin

from .models import Reservation, ReservationChambre


class ReservationChambreInline(admin.TabularInline):
    model = ReservationChambre
    extra = 0


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id_reservation", "client", "statut_reservation",
                    "nb_personnes_total", "montant_estime", "date_reservation")
    list_filter = ("statut_reservation",)
    search_fields = ("client__nom", "client__prenom")
    readonly_fields = ("nb_personnes_total", "montant_estime")
    inlines = [ReservationChambreInline]


@admin.register(ReservationChambre)
class ReservationChambreAdmin(admin.ModelAdmin):
    list_display = ("reservation", "chambre", "date_arrivee_prevue",
                    "date_depart_prevue", "nb_occupants", "tarif_nuit_applique")
