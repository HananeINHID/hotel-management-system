
from rest_framework import serializers

from apps.reservations.models import ReservationChambre
from .models import Sejour


class SejourSerializer(serializers.ModelSerializer):

    client_nom = serializers.CharField(
        source="reservation.client.nom",
        read_only=True,
    )

    client_prenom = serializers.CharField(
        source="reservation.client.prenom",
        read_only=True,
    )

    numero_chambre = serializers.CharField(
        source="chambre.numero_chambre",
        read_only=True,
    )

    statut_display = serializers.CharField(
        source="get_statut_sejour_display",
        read_only=True,
    )

    date_arrivee_prevue = serializers.SerializerMethodField()
    date_depart_prevue = serializers.SerializerMethodField()

    class Meta:
        model = Sejour
        fields = [
            "id_sejour",
            "reservation",
            "chambre",
            "client_nom",
            "client_prenom",
            "numero_chambre",
            "date_arrivee_prevue",
            "date_depart_prevue",
            "arrivee_reelle",
            "depart_reel",
            "statut_sejour",
            "statut_display",
            "observations",
            "est_archive",
            "date_archivage",
        ]

        read_only_fields = fields

    def get_reservation_chambre(self, obj):
        return ReservationChambre.objects.filter(
            reservation_id=obj.reservation_id,
            chambre_id=obj.chambre_id,
        ).first()

    def get_date_arrivee_prevue(self, obj):
        reservation_chambre = self.get_reservation_chambre(obj)
        return (
            reservation_chambre.date_arrivee_prevue
            if reservation_chambre else None
        )

    def get_date_depart_prevue(self, obj):
        reservation_chambre = self.get_reservation_chambre(obj)
        return (
            reservation_chambre.date_depart_prevue
            if reservation_chambre else None
        )


class CheckInSerializer(serializers.Serializer):

    reservation_chambre = serializers.IntegerField(min_value=1)

    observations = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    arrivee_reelle = serializers.DateTimeField(required=False)


class CheckOutSerializer(serializers.Serializer):

    observations = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    depart_reel = serializers.DateTimeField(required=False)


class ArriveeSerializer(serializers.ModelSerializer):

    client_nom = serializers.CharField(
        source="reservation.client.nom",
        read_only=True,
    )

    client_prenom = serializers.CharField(
        source="reservation.client.prenom",
        read_only=True,
    )

    numero_chambre = serializers.CharField(
        source="chambre.numero_chambre",
        read_only=True,
    )

    class Meta:
        model = ReservationChambre

        fields = [
            "id",
            "reservation",
            "chambre",
            "date_arrivee_prevue",
            "date_depart_prevue",
            "nb_occupants",
            "client_nom",
            "client_prenom",
            "numero_chambre",
        ]
