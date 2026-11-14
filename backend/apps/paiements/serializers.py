from decimal import Decimal
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Paiement
from . import selectors


class PaiementSerializer(serializers.ModelSerializer):
    """
    Serializer pour les paiements d'un séjour.
    Règles métier :
    - montant > 0
    - mode_paiement : ESPECES, CARTE_BANCAIRE, VIREMENT, CHEQUE
    - statut : EN_ATTENTE, VALIDE, REFUSE, REMBOURSE
    - reference_paiement auto-générée si absente : PAY-AAAAMMJJ-XXXX (unique)
    - Un paiement VALIDE n'est plus modifiable/supprimable (seulement remboursable via action dédiée)
    - Un paiement ne peut pas dépasser le reste à payer du séjour (si calculable)
    - Un employé INACTIF ou EN_CONGE ne peut pas enregistrer de paiement
    """
    sejour_label = serializers.SerializerMethodField(read_only=True)
    employe_nom_complet = serializers.SerializerMethodField(read_only=True)
    mode_paiement_display = serializers.CharField(source='get_mode_paiement_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    reference_paiement = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Paiement
        fields = [
            'id_paiement',
            'sejour',
            'sejour_label',
            'employe',
            'employe_nom_complet',
            'date_paiement',
            'montant',
            'mode_paiement',
            'mode_paiement_display',
            'statut',
            'statut_display',
            'reference_paiement',
        ]
        read_only_fields = ['id_paiement']

    @extend_schema_field(serializers.CharField)
    def get_sejour_label(self, obj):
        return f"Séjour #{obj.sejour_id}"

    @extend_schema_field(serializers.CharField)
    def get_employe_nom_complet(self, obj):
        return f"{obj.employe.nom} {obj.employe.prenom}" if obj.employe else ""

    def validate_montant(self, value):
        if value is None or value <= Decimal('0.00'):
            raise serializers.ValidationError("Le montant du paiement doit être strictement supérieur à 0 MAD.")
        return value

    def validate(self, attrs):
        # 1. Vérification modification d'un paiement déjà validé
        if self.instance and self.instance.statut == Paiement.StatutPaiement.VALIDE:
            raise serializers.ValidationError(
                "Un paiement déjà validé n'est plus modifiable. Seule l'action dédiée de remboursement est permise."
            )

        employe = attrs.get('employe') or (self.instance.employe if self.instance else None)
        sejour = attrs.get('sejour') or (self.instance.sejour if self.instance else None)
        montant = attrs.get('montant') or (self.instance.montant if self.instance else None)

        # 2. Règle métier : Un employé INACTIF ne peut pas enregistrer de paiement
        if employe:
            from apps.employes.models import Employe
            if employe.statut != Employe.Statut.ACTIF:
                raise serializers.ValidationError({
                    'employe': f"L'employé '{employe.nom} {employe.prenom}' est actuellement {employe.get_statut_display().lower()} et ne peut pas enregistrer de paiement."
                })

        # 3. Règle métier : Un paiement ne peut pas dépasser le reste à payer du séjour (si calculable)
        if sejour and montant:
            total_du = selectors.get_total_du_sejour(sejour.pk)
            if total_du > Decimal('0.00'):
                reste = selectors.calculer_reste_a_payer_sejour(
                    sejour.pk,
                    exclude_paiement_id=self.instance.pk if self.instance else None
                )
                if montant > reste:
                    raise serializers.ValidationError({
                        'montant': f"Le montant du paiement ({montant} MAD) dépasse le reste à payer ({reste} MAD) pour ce séjour."
                    })

        return attrs


class PaiementActionSerializer(serializers.Serializer):
    """
    Serializer pour documenter les actions POST /valider/ et /rembourser/ dans Swagger.
    """
    motif = serializers.CharField(required=False, allow_blank=True, help_text="Motif facultatif de l'action")


class ResumeFinancierConsoItemSerializer(serializers.Serializer):
    id_consommation = serializers.IntegerField()
    service_id = serializers.IntegerField()
    service_nom = serializers.CharField()
    service_type = serializers.CharField()
    quantite = serializers.IntegerField()
    prix_applique = serializers.CharField()
    montant_total = serializers.CharField()
    date_consommation = serializers.CharField(allow_null=True)


class ResumeFinancierPaiementItemSerializer(serializers.Serializer):
    id_paiement = serializers.IntegerField()
    reference_paiement = serializers.CharField()
    montant = serializers.CharField()
    mode_paiement = serializers.CharField()
    mode_paiement_display = serializers.CharField()
    statut = serializers.CharField()
    statut_display = serializers.CharField()
    date_paiement = serializers.CharField(allow_null=True)
    employe_id = serializers.IntegerField()
    employe_nom_complet = serializers.CharField()


class ResumeFinancierSerializer(serializers.Serializer):
    """
    Serializer pour la réponse de GET /api/sejours/{id}/resume-financier/
    """
    sejour_id = serializers.IntegerField()
    statut_sejour = serializers.CharField()
    est_archive = serializers.BooleanField()
    arrivee_reelle = serializers.DateTimeField(allow_null=True)
    depart_reel = serializers.DateTimeField(allow_null=True)
    total_consommations = serializers.CharField()
    total_du = serializers.CharField()
    total_paye = serializers.CharField()
    reste_a_payer = serializers.CharField()
    est_solde = serializers.BooleanField()
    nombre_consommations = serializers.IntegerField()
    nombre_paiements = serializers.IntegerField()
    consommations = ResumeFinancierConsoItemSerializer(many=True)
    paiements = ResumeFinancierPaiementItemSerializer(many=True)


class DashboardTopServiceSerializer(serializers.Serializer):
    id_service = serializers.IntegerField()
    nom = serializers.CharField()
    type_service = serializers.CharField()
    prix_unitaire = serializers.CharField()
    total_quantite = serializers.IntegerField()


class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializer pour la réponse de GET /api/dashboard/stats/
    """
    date = serializers.CharField()
    total_encaisse_jour = serializers.CharField()
    total_encaisse_global = serializers.CharField()
    paiements_en_attente_count = serializers.IntegerField()
    top_services = DashboardTopServiceSerializer(many=True)
    dernieres_transactions = PaiementSerializer(many=True)
