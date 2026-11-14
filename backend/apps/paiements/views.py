from decimal import Decimal
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from .models import Paiement
from .serializers import (
    PaiementSerializer,
    PaiementActionSerializer,
    ResumeFinancierSerializer,
    DashboardStatsSerializer,
)
from .filters import PaiementFilter
from . import selectors


@extend_schema_view(
    list=extend_schema(summary="Lister les paiements avec filtres (statut, mode, sejour, employe) et recherche"),
    retrieve=extend_schema(summary="Détails d'un paiement"),
    create=extend_schema(summary="Enregistrer un nouveau paiement"),
    update=extend_schema(summary="Modifier un paiement (interdit si déjà VALIDE)"),
    partial_update=extend_schema(summary="Mise à jour partielle d'un paiement (interdit si déjà VALIDE)"),
    destroy=extend_schema(summary="Supprimer un paiement (interdit si VALIDE)"),
)
class PaiementViewSet(viewsets.ModelViewSet):
    """
    CRUD et actions métier sur les paiements.
    Règles métier :
    - montant > 0
    - référence unique PAY-AAAAMMJJ-XXXX auto-générée
    - Employé actif requis
    - Interdiction de dépasser le reste à payer du séjour
    - Un paiement VALIDE est non modifiable et non supprimable (remboursement requis)
    """
    queryset = Paiement.objects.select_related('sejour', 'employe').all().order_by('-date_paiement')
    serializer_class = PaiementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PaiementFilter
    search_fields = ['reference_paiement', 'employe__nom', 'employe__prenom']
    ordering_fields = ['date_paiement', 'montant', 'statut']
    ordering = ['-date_paiement']

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.statut == Paiement.StatutPaiement.VALIDE:
            return Response(
                {
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'error': 'ValidationError',
                    'detail': "Un paiement validé ne peut plus être modifié. Seule l'action dédiée de remboursement est permise."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.statut == Paiement.StatutPaiement.VALIDE:
            return Response(
                {
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'error': 'ValidationError',
                    'detail': "Un paiement validé ne peut plus être modifié. Seule l'action dédiée de remboursement est permise."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.statut == Paiement.StatutPaiement.VALIDE:
            return Response(
                {
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'error': 'ValidationError',
                    'detail': "Un paiement validé ne peut pas être supprimé. Procédez à un remboursement si nécessaire."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        request=PaiementActionSerializer,
        responses={200: PaiementSerializer},
        summary="Valider un paiement en attente (POST /{id}/valider/)"
    )
    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        """
        Valide un paiement en attente.
        Vérifie qu'il n'est pas déjà validé, refusé ou remboursé,
        et qu'il ne dépasse pas le reste à payer du séjour.
        """
        paiement = self.get_object()

        if paiement.statut == Paiement.StatutPaiement.VALIDE:
            return Response(
                {
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'error': 'ValidationError',
                    'detail': "Ce paiement est déjà validé."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if paiement.statut in [Paiement.StatutPaiement.REFUSE, Paiement.StatutPaiement.REMBOURSE]:
            return Response(
                {
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'error': 'ValidationError',
                    'detail': f"Impossible de valider un paiement avec le statut {paiement.get_statut_display().lower()}."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérification du reste à payer au moment de la validation
        total_du = selectors.get_total_du_sejour(paiement.sejour_id)
        if total_du > Decimal('0.00'):
            reste = selectors.calculer_reste_a_payer_sejour(
                paiement.sejour_id,
                exclude_paiement_id=paiement.pk
            )
            if paiement.montant > reste:
                return Response(
                    {
                        'status_code': status.HTTP_400_BAD_REQUEST,
                        'error': 'ValidationError',
                        'detail': f"Le montant du paiement ({paiement.montant} MAD) dépasse le reste à payer actuel ({reste} MAD) pour ce séjour."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        paiement.statut = Paiement.StatutPaiement.VALIDE
        paiement.save(update_fields=['statut'])
        return Response(PaiementSerializer(paiement).data, status=status.HTTP_200_OK)

    @extend_schema(
        request=PaiementActionSerializer,
        responses={200: PaiementSerializer},
        summary="Rembourser un paiement validé (POST /{id}/rembourser/)"
    )
    @action(detail=True, methods=['post'], url_path='rembourser')
    def rembourser(self, request, pk=None):
        """
        Rembourse un paiement validé.
        Seul un paiement VALIDE peut faire l'objet d'un remboursement.
        """
        paiement = self.get_object()

        if paiement.statut != Paiement.StatutPaiement.VALIDE:
            return Response(
                {
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'error': 'ValidationError',
                    'detail': "Seul un paiement préalablement validé peut être remboursé."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        paiement.statut = Paiement.StatutPaiement.REMBOURSE
        paiement.save(update_fields=['statut'])
        return Response(PaiementSerializer(paiement).data, status=status.HTTP_200_OK)


class SejourResumeFinancierView(APIView):
    """
    Endpoint dédié au résumé financier d'un séjour :
    GET /api/sejours/{id}/resume-financier/
    Fournit : total consommations, total payé, reste à payer et détail complet.
    """
    @extend_schema(
        summary="Obtenir le résumé financier complet d'un séjour (consommations, paiements, reste à payer)",
        parameters=[
            OpenApiParameter(name='id', description="Identifiant du séjour (id_sejour)", required=True, type=int, location=OpenApiParameter.PATH)
        ],
        responses={200: ResumeFinancierSerializer}
    )
    def get(self, request, id=None):
        resume = selectors.get_sejour_resume_financier(id)
        if not resume:
            return Response(
                {
                    'status_code': status.HTTP_404_NOT_FOUND,
                    'error': 'NotFound',
                    'detail': f"Aucun séjour trouvé avec l'identifiant #{id}."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(resume, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    """
    Endpoint fournissant les indicateurs clés pour le mini tableau de bord :
    - Total encaissé aujourd'hui (MAD)
    - Nombre de paiements en attente de validation
    - Top des services les plus consommés
    - Dernières transactions
    """
    @extend_schema(
        summary="Indicateurs clés du tableau de bord (recettes du jour, paiements en attente, top services)",
        responses={200: DashboardStatsSerializer}
    )
    def get(self, request):
        today = timezone.now().date()

        # 1. Total encaissé du jour (paiements validés aujourd'hui)
        total_jour = Paiement.objects.filter(
            statut=Paiement.StatutPaiement.VALIDE,
            date_paiement__date=today
        ).aggregate(total=Sum('montant'))['total'] or Decimal('0.00')

        # 2. Total encaissé global
        total_global = Paiement.objects.filter(
            statut=Paiement.StatutPaiement.VALIDE
        ).aggregate(total=Sum('montant'))['total'] or Decimal('0.00')

        # 3. Paiements en attente
        en_attente_count = Paiement.objects.filter(
            statut=Paiement.StatutPaiement.EN_ATTENTE
        ).count()

        # 4. Top services consommés
        from apps.services.models import Service
        top_services = Service.objects.annotate(
            total_quantite=Sum('consommations__quantite'),
            total_revenu=Sum('consommations__quantite') * F('prix_unitaire') if False else Sum('consommations__prix_applique')
        ).filter(total_quantite__gt=0).order_by('-total_quantite')[:5]

        top_services_data = [
            {
                'id_service': s.pk,
                'nom': s.nom,
                'type_service': s.type_service,
                'prix_unitaire': str(s.prix_unitaire),
                'total_quantite': s.total_quantite or 0,
            }
            for s in top_services
        ]

        # 5. Dernières transactions
        recent_paiements = Paiement.objects.select_related('employe', 'sejour').order_by('-date_paiement')[:5]
        recent_data = PaiementSerializer(recent_paiements, many=True).data

        return Response({
            'date': today.isoformat(),
            'total_encaisse_jour': str(Decimal(total_jour).quantize(Decimal('0.01'))),
            'total_encaisse_global': str(Decimal(total_global).quantize(Decimal('0.01'))),
            'paiements_en_attente_count': en_attente_count,
            'top_services': top_services_data,
            'dernieres_transactions': recent_data
        }, status=status.HTTP_200_OK)
