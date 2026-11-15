from rest_framework import serializers

from .models import Avis

# Un séjour "terminé" : valeurs acceptées (stub de Karima : TERMINE ; modèle final de Hmza : à confirmer)
STATUTS_SEJOUR_TERMINE = {'TERMINE', 'TERMINÉ', 'TERMINEE', 'CLOTURE'}


class AvisSerializer(serializers.ModelSerializer):
    """Serializer Avis avec infos client/séjour en lecture."""

    client_nom = serializers.SerializerMethodField()
    sejour_statut = serializers.CharField(source='sejour.statut_sejour', read_only=True)

    class Meta:
        model = Avis
        fields = [
            'id_avis',
            'date_avis',
            'note',
            'commentaire',
            'client',
            'client_nom',
            'sejour',
            'sejour_statut',
        ]
        read_only_fields = ['id_avis']

    def get_client_nom(self, obj):
        return f"{obj.client.prenom} {obj.client.nom}"

    def validate_note(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("La note doit être comprise entre 1 et 5.")
        return value

    def validate(self, attrs):
        sejour = attrs.get('sejour') or (self.instance.sejour if self.instance else None)
        client = attrs.get('client') or (self.instance.client if self.instance else None)

        # Règle 1 : l'avis porte sur un séjour terminé
        statut = (getattr(sejour, 'statut_sejour', '') or '').upper()
        if statut not in STATUTS_SEJOUR_TERMINE:
            raise serializers.ValidationError(
                {'sejour': "Un avis ne peut être déposé que sur un séjour terminé."}
            )

        # Règle 2 : l'avis vient du client de la réservation du séjour.
        # Vérifiée dès que le modèle Séjour de Hmza expose la réservation.
        reservation = getattr(sejour, 'reservation', None)
        client_resa_id = getattr(reservation, 'client_id', None)
        if client_resa_id is not None and client is not None and client_resa_id != client.pk:
            raise serializers.ValidationError(
                {'client': "L'avis doit être rédigé par le client de la réservation de ce séjour."}
            )
        return attrs
