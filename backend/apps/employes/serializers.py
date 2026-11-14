from rest_framework import serializers
from .models import Employe


class EmployeSerializer(serializers.ModelSerializer):
    """
    Serializer complet pour le modèle Employe.
    """
    poste_display = serializers.CharField(source='get_poste_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    nb_paiements_enregistres = serializers.IntegerField(source='paiements.count', read_only=True)

    class Meta:
        model = Employe
        fields = [
            'id_employe',
            'nom',
            'prenom',
            'poste',
            'poste_display',
            'telephone',
            'email',
            'date_embauche',
            'statut',
            'statut_display',
            'nb_paiements_enregistres',
        ]
        read_only_fields = ['id_employe']

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

    def validate_email(self, value):
        val = value.strip().lower()
        # Vérification unicité hors instance en cours de modification
        qs = Employe.objects.filter(email__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée par un autre employé.")
        return val


class EmployeStatutUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer spécifique pour mise à jour rapide du statut d'un employé.
    """
    class Meta:
        model = Employe
        fields = ['statut']
