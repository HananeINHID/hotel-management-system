from contextlib import contextmanager

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import DatabaseError
from rest_framework import serializers

from apps.chambres.models import Chambre

from . import services
from .models import Reservation, ReservationChambre


@contextmanager
def erreurs_metier():
    """Convertit les erreurs métier / triggers en erreurs 400 lisibles par le frontend."""
    try:
        yield
    except DjangoValidationError as e:
        if hasattr(e, "message_dict"):
            raise serializers.ValidationError(e.message_dict)
        raise serializers.ValidationError(e.messages)
    except DatabaseError as e:
        # Triggers MySQL (SIGNAL 45000) ou SQLite (RAISE) : le message est le dernier argument.
        message = str(e.args[-1]) if e.args else str(e)
        raise serializers.ValidationError({"detail": [message]})


class ReservationChambreSerializer(serializers.ModelSerializer):
    """Association CONCERNER : une chambre dans une réservation, avec ses propres dates."""

    chambre = serializers.PrimaryKeyRelatedField(queryset=Chambre.objects.all())
    numero_chambre = serializers.CharField(source="chambre.numero_chambre", read_only=True)
    categorie_libelle = serializers.CharField(
        source="chambre.categorie.libelle", read_only=True
    )
    capacite = serializers.IntegerField(source="chambre.categorie.capacite", read_only=True)
    tarif_nuit_applique = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, min_value=0
    )
    nb_nuits = serializers.SerializerMethodField()
    sous_total = serializers.SerializerMethodField()

    class Meta:
        model = ReservationChambre
        fields = [
            "id", "chambre", "numero_chambre", "categorie_libelle", "capacite",
            "date_arrivee_prevue", "date_depart_prevue", "nb_occupants",
            "tarif_nuit_applique", "nb_nuits", "sous_total",
        ]
        read_only_fields = ["id"]
        # unicité (réservation, chambre) vérifiée par le service sur toute la liste
        validators = []

    def get_nb_nuits(self, obj):
        return services.nb_nuits(obj.date_arrivee_prevue, obj.date_depart_prevue)

    def get_sous_total(self, obj):
        return self.get_nb_nuits(obj) * obj.tarif_nuit_applique

    def validate(self, data):
        if data["date_depart_prevue"] <= data["date_arrivee_prevue"]:
            raise serializers.ValidationError(
                {"date_depart_prevue": "Le départ doit être après l'arrivée."}
            )
        if data.get("nb_occupants", 1) < 1:
            raise serializers.ValidationError(
                {"nb_occupants": "Au moins un occupant est requis."}
            )
        return data


class ReservationSerializer(serializers.ModelSerializer):
    chambres = ReservationChambreSerializer(
        source="chambres_reservees", many=True, required=False
    )
    confirmer = serializers.BooleanField(write_only=True, required=False, default=False)

    client_nom = serializers.SerializerMethodField()
    employe_nom = serializers.SerializerMethodField()
    statut_display = serializers.CharField(source="get_statut_reservation_display", read_only=True)
    nb_chambres = serializers.SerializerMethodField()
    date_arrivee = serializers.SerializerMethodField()
    date_depart = serializers.SerializerMethodField()
    modifiable = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id_reservation", "date_reservation", "statut_reservation", "statut_display",
            "client", "client_nom", "employe", "employe_nom",
            "nb_personnes_total", "montant_estime",
            "chambres", "nb_chambres", "date_arrivee", "date_depart",
            "modifiable", "confirmer",
        ]
        read_only_fields = [
            "id_reservation", "date_reservation", "statut_reservation",
            "nb_personnes_total", "montant_estime",
        ]

    # -- champs calculés (lignes déjà préchargées par la vue : pas de requête en plus)
    def _lignes(self, obj):
        return list(obj.chambres_reservees.all())

    def get_client_nom(self, obj):
        return f"{obj.client.nom} {obj.client.prenom}"

    def get_employe_nom(self, obj):
        return f"{obj.employe.nom} {obj.employe.prenom}"

    def get_nb_chambres(self, obj):
        return len(self._lignes(obj))

    def get_date_arrivee(self, obj):
        dates = [l.date_arrivee_prevue for l in self._lignes(obj)]
        return min(dates) if dates else None

    def get_date_depart(self, obj):
        dates = [l.date_depart_prevue for l in self._lignes(obj)]
        return max(dates) if dates else None

    def get_modifiable(self, obj):
        return obj.statut_reservation in services.STATUTS_ACTIFS and not obj.sejours.exists()

    # -- validation
    def validate_chambres(self, lignes):
        ids = [l["chambre"].pk for l in lignes]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError(
                "Une même chambre ne peut pas apparaître deux fois dans la réservation."
            )
        return lignes

    def validate(self, data):
        if self.instance is None and not data.get("chambres_reservees"):
            raise serializers.ValidationError(
                {"chambres": "Ajoutez au moins une chambre."}
            )
        if "chambres_reservees" in data and not data["chambres_reservees"]:
            raise serializers.ValidationError(
                {"chambres": "Ajoutez au moins une chambre."}
            )
        return data

    # -- écriture : tout passe par les services (verrous + vérifications)
    def create(self, validated_data):
        lignes = validated_data.pop("chambres_reservees")
        with erreurs_metier():
            return services.creer_reservation(
                client=validated_data["client"],
                employe=validated_data["employe"],
                lignes=lignes,
                confirmer=validated_data.get("confirmer", False),
            )

    def update(self, instance, validated_data):
        with erreurs_metier():
            return services.modifier_reservation(
                instance,
                client=validated_data.get("client"),
                employe=validated_data.get("employe"),
                lignes=validated_data.get("chambres_reservees"),
            )


class DisponibiliteParamsSerializer(serializers.Serializer):
    date_debut = serializers.DateField()
    date_fin = serializers.DateField()
    nb_occupants = serializers.IntegerField(required=False, min_value=1)
    categorie = serializers.IntegerField(required=False)
    exclure_reservation = serializers.IntegerField(required=False)

    def validate(self, data):
        if data["date_fin"] <= data["date_debut"]:
            raise serializers.ValidationError(
                {"date_fin": "La date de fin doit être après la date de début."}
            )
        return data
