from rest_framework import serializers
from .models import CategorieChambre, Chambre


class CategorieChambreSerializer(serializers.ModelSerializer):
    """Serializer complet pour CategorieChambre."""
    nb_chambres = serializers.IntegerField(source='chambres.count', read_only=True)

    class Meta:
        model = CategorieChambre
        fields = [
            'id_categorie',
            'libelle',
            'capacite',
            'tarif_nuit',
            'description',
            'nb_chambres',
        ]
        read_only_fields = ['id_categorie']

    def validate_libelle(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Le libellé ne peut pas être vide.")
        # Unicité (hors instance en cours de modification)
        qs = CategorieChambre.objects.filter(libelle__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Une catégorie avec ce libellé existe déjà.")
        return val

    def validate_capacite(self, value):
        if value < 1:
            raise serializers.ValidationError("La capacité doit être d'au moins 1 personne.")
        return value

    def validate_tarif_nuit(self, value):
        if value < 0:
            raise serializers.ValidationError("Le tarif ne peut pas être négatif.")
        return value


class ChambreSerializer(serializers.ModelSerializer):
    """Serializer complet pour Chambre avec données de catégorie imbriquées en lecture."""
    categorie_detail = CategorieChambreSerializer(source='categorie', read_only=True)
    etat_physique_display = serializers.CharField(
        source='get_etat_physique_display', read_only=True
    )

    class Meta:
        model = Chambre
        fields = [
            'id_chambre',
            'numero_chambre',
            'etage',
            'etat_physique',
            'etat_physique_display',
            'description',
            'categorie',
            'categorie_detail',
        ]
        read_only_fields = ['id_chambre']

    def validate_numero_chambre(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Le numéro de chambre ne peut pas être vide.")
        qs = Chambre.objects.filter(numero_chambre__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"La chambre '{val}' existe déjà."
            )
        return val

    def validate_etage(self, value):
        if value < 0:
            raise serializers.ValidationError("L'étage ne peut pas être négatif.")
        return value


class ChambreDisponibiliteSerializer(serializers.Serializer):
    """Paramètres pour vérifier la disponibilité d'une chambre sur une période."""
    date_debut = serializers.DateField(required=True)
    date_fin = serializers.DateField(required=True)

    def validate(self, data):
        if data['date_fin'] <= data['date_debut']:
            raise serializers.ValidationError(
                "La date de fin doit être strictement après la date de début."
            )
        return data
