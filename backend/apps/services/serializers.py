from decimal import Decimal
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Service, ConsommationService
from apps.paiements import selectors


class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour le catalogue de Services.
    """
    type_service_display = serializers.CharField(source='get_type_service_display', read_only=True)
    nb_consommations = serializers.IntegerField(source='consommations.count', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id_service',
            'nom',
            'type_service',
            'type_service_display',
            'prix_unitaire',
            'description',
            'nb_consommations',
        ]
        read_only_fields = ['id_service']

    def validate_prix_unitaire(self, value):
        if value is None or value < Decimal('0.00'):
            raise serializers.ValidationError("Le prix unitaire doit être supérieur ou égal à 0 MAD.")
        return value

    def validate_nom(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Le nom du service ne peut pas être vide.")
        return val


class ConsommationServiceSerializer(serializers.ModelSerializer):
    """
    Serializer pour les consommations de services par les séjours.
    Règles métier :
    - prix_applique copié automatiquement depuis service.prix_unitaire à la création si non spécifié
    - quantite >= 1
    - date_consommation par défaut = maintenant
    - montant_total = quantite * prix_applique (champ calculé)
    - Interdit sur un séjour archivé ou terminé
    """
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    service_type = serializers.CharField(source='service.type_service', read_only=True)
    service_type_display = serializers.CharField(source='service.get_type_service_display', read_only=True)
    sejour_label = serializers.SerializerMethodField(read_only=True)
    montant_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    prix_applique = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )

    class Meta:
        model = ConsommationService
        fields = [
            'id_consommation',
            'service',
            'service_nom',
            'service_type',
            'service_type_display',
            'sejour',
            'sejour_label',
            'date_consommation',
            'quantite',
            'prix_applique',
            'montant_total',
        ]
        read_only_fields = ['id_consommation', 'montant_total']

    @extend_schema_field(serializers.CharField)
    def get_sejour_label(self, obj):
        return f"Séjour #{obj.sejour_id}"

    def validate_quantite(self, value):
        if value is None or value < 1:
            raise serializers.ValidationError("La quantité doit être supérieure ou égale à 1.")
        return value

    def validate(self, attrs):
        service = attrs.get('service') or (self.instance.service if self.instance else None)
        sejour = attrs.get('sejour') or (self.instance.sejour if self.instance else None)

        # Règle métier : Interdit sur un séjour archivé ou terminé
        if sejour and selectors.is_sejour_termine_ou_archive(sejour):
            raise serializers.ValidationError({
                'sejour': "Impossible d'enregistrer une consommation sur un séjour archivé ou terminé."
            })

        # Règle métier : Copie automatique du prix_unitaire si prix_applique omis ou vide
        if 'prix_applique' not in attrs or attrs.get('prix_applique') is None:
            if service:
                attrs['prix_applique'] = service.prix_unitaire
        elif attrs.get('prix_applique') < Decimal('0.00'):
            raise serializers.ValidationError({
                'prix_applique': "Le prix appliqué ne peut pas être négatif."
            })

        return attrs
