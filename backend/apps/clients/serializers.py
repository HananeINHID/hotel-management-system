import re

from rest_framework import serializers

from .models import Client

TELEPHONE_REGEX = re.compile(r'^\+?[0-9 .\-()]{6,20}$')


class ClientSerializer(serializers.ModelSerializer):
    """Serializer complet pour Client (avec compteurs en lecture seule)."""

    nom_complet = serializers.SerializerMethodField()
    nb_avis = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id_client',
            'nom',
            'prenom',
            'nom_complet',
            'piece_identite',
            'telephone',
            'email',
            'nationalite',
            'nb_avis',
        ]
        read_only_fields = ['id_client']

    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"

    def get_nb_avis(self, obj):
        # 'avis' = related_name défini dans apps.avis.models.Avis
        return obj.avis.count() if hasattr(obj, 'avis') else 0

    def validate_nom(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Le nom ne peut pas être vide.")
        return val

    def validate_prenom(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Le prénom ne peut pas être vide.")
        return val

    def validate_piece_identite(self, value):
        val = value.strip().upper()
        if not val:
            raise serializers.ValidationError("La pièce d'identité est obligatoire.")
        qs = Client.objects.filter(piece_identite__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "Un client avec cette pièce d'identité existe déjà."
            )
        return val

    def validate_telephone(self, value):
        val = value.strip()
        if val and not TELEPHONE_REGEX.match(val):
            raise serializers.ValidationError(
                "Numéro de téléphone invalide (ex : +212 6 12 34 56 78)."
            )
        return val
