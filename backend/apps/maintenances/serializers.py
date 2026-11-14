from rest_framework import serializers
from django.utils import timezone
from .models import Maintenance


class MaintenanceSerializer(serializers.ModelSerializer):
    """Serializer complet pour le modèle Maintenance."""
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    # Données de chambre en lecture seule
    chambre_numero = serializers.CharField(
        source='chambre.numero_chambre', read_only=True
    )
    chambre_etage = serializers.IntegerField(
        source='chambre.etage', read_only=True
    )

    # Données de l'employé en lecture seule
    employe_nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Maintenance
        fields = [
            'id_maintenance',
            'chambre',
            'chambre_numero',
            'chambre_etage',
            'employe',
            'employe_nom_complet',
            'debut',
            'fin',
            'type',
            'type_display',
            'description',
            'cout',
            'statut',
            'statut_display',
            'bloquante',
        ]
        read_only_fields = ['id_maintenance']

    def get_employe_nom_complet(self, obj):
        if obj.employe:
            return f"{obj.employe.nom} {obj.employe.prenom}"
        return None

    def validate(self, data):
        debut = data.get('debut') or (self.instance.debut if self.instance else None)
        fin = data.get('fin')

        if fin is not None and debut is not None:
            if fin <= debut:
                raise serializers.ValidationError({
                    'fin': "La date de fin doit être après la date de début."
                })

        # Règle : une maintenance TERMINEE ou ANNULEE ne peut pas redevenir EN_COURS
        statut = data.get('statut')
        if self.instance and statut:
            statut_actuel = self.instance.statut
            transitions_interdites = {
                Maintenance.Statut.TERMINEE: [
                    Maintenance.Statut.PLANIFIEE,
                    Maintenance.Statut.EN_COURS,
                ],
                Maintenance.Statut.ANNULEE: [
                    Maintenance.Statut.PLANIFIEE,
                    Maintenance.Statut.EN_COURS,
                ],
            }
            interdit = transitions_interdites.get(statut_actuel, [])
            if statut in interdit:
                raise serializers.ValidationError({
                    'statut': (
                        f"Transition de statut invalide : on ne peut pas passer de "
                        f"« {self.instance.get_statut_display()} » à "
                        f"« {Maintenance(statut=statut).get_statut_display()} »."
                    )
                })

        return data

    def validate_cout(self, value):
        if value < 0:
            raise serializers.ValidationError("Le coût ne peut pas être négatif.")
        return value

    def validate_debut(self, value):
        # On autorise les dates dans le passé (maintenances préventives planifiées rétroactivement)
        return value


class MaintenanceStatutUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mise à jour rapide du statut."""
    class Meta:
        model = Maintenance
        fields = ['statut']
