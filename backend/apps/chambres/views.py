from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
import datetime

from .models import CategorieChambre, Chambre
from .serializers import (
    CategorieChambreSerializer,
    ChambreSerializer,
    ChambreDisponibiliteSerializer,
)
from .filters import ChambreFilter


@extend_schema_view(
    list=extend_schema(summary="Lister les catégories de chambres"),
    retrieve=extend_schema(summary="Détails d'une catégorie"),
    create=extend_schema(summary="Créer une catégorie"),
    update=extend_schema(summary="Modifier une catégorie"),
    partial_update=extend_schema(summary="Mise à jour partielle d'une catégorie"),
    destroy=extend_schema(summary="Supprimer une catégorie (protégé si des chambres y sont rattachées)"),
)
class CategorieChambreViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des catégories de chambres.
    Règle métier : une catégorie ne peut pas être supprimée si elle possède des chambres.
    """
    queryset = CategorieChambre.objects.all().order_by('libelle')
    serializer_class = CategorieChambreSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['libelle', 'description']
    ordering_fields = ['libelle', 'capacite', 'tarif_nuit']
    ordering = ['libelle']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        nb_chambres = instance.chambres.count()
        if nb_chambres > 0:
            return Response(
                {
                    'detail': (
                        f"Impossible de supprimer la catégorie \u00ab {instance.libelle} \u00bb : "
                        f"elle est utilisée par {nb_chambres} chambre(s). "
                        "Réaffectez ou supprimez les chambres concernées en premier."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(summary="Lister les chambres avec filtres et recherche"),
    retrieve=extend_schema(summary="Détails d'une chambre"),
    create=extend_schema(summary="Créer une chambre"),
    update=extend_schema(summary="Modifier une chambre"),
    partial_update=extend_schema(summary="Mise à jour partielle d'une chambre"),
    destroy=extend_schema(summary="Supprimer une chambre"),
)
class ChambreViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des chambres.
    Actions personnalisées :
    - GET /chambres/{id}/disponibilite/?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD
    - GET /chambres/disponibles/?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD
    - PATCH /chambres/{id}/changer-etat/
    La disponibilité tient compte :
      1. De l'état physique de la chambre (hors_service -> jamais disponible)
      2. Des maintenances bloquantes actives sur la période
    """
    queryset = Chambre.objects.select_related('categorie').all()
    serializer_class = ChambreSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ChambreFilter
    search_fields = ['numero_chambre', 'description', 'categorie__libelle']
    ordering_fields = ['numero_chambre', 'etage', 'etat_physique', 'categorie__libelle']
    ordering = ['numero_chambre']

    def _verifier_disponibilite(self, chambre, date_debut, date_fin):
        """
        Retourne (True, None) si disponible, (False, raison) sinon.
        date_debut et date_fin sont des objets datetime.date.
        """
        # 1. Etat physique bloquant
        if chambre.etat_physique == Chambre.EtatPhysique.HORS_SERVICE:
            return False, "La chambre est hors service."

        # 2. Maintenances bloquantes sur la période
        try:
            from apps.maintenances.models import Maintenance
            debut_dt = datetime.datetime.combine(date_debut, datetime.time.min)
            fin_dt = datetime.datetime.combine(date_fin, datetime.time.max)

            maintenances_bloquantes = Maintenance.objects.filter(
                chambre=chambre,
                bloquante=True,
                statut__in=[
                    Maintenance.Statut.PLANIFIEE,
                    Maintenance.Statut.EN_COURS,
                ],
                debut__lt=fin_dt,
            ).filter(
                Q(fin__isnull=True) | Q(fin__gt=debut_dt)
            )

            if maintenances_bloquantes.exists():
                m = maintenances_bloquantes.first()
                return False, (
                    f"Maintenance bloquante en cours ou planifiée "
                    f"(#{m.id_maintenance}, statut: {m.get_statut_display()})."
                )
        except Exception:
            pass

        return True, None

    @extend_schema(
        parameters=[
            OpenApiParameter('date_debut', OpenApiTypes.DATE, description='Date de début (YYYY-MM-DD)', required=True),
            OpenApiParameter('date_fin', OpenApiTypes.DATE, description='Date de fin (YYYY-MM-DD)', required=True),
        ],
        summary="Vérifier la disponibilité d'une chambre sur une période",
    )
    @action(detail=True, methods=['get'], url_path='disponibilite')
    def disponibilite(self, request, pk=None):
        """Vérifie la disponibilité d'une chambre sur une période donnée."""
        chambre = self.get_object()
        serializer = ChambreDisponibiliteSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        date_debut = serializer.validated_data['date_debut']
        date_fin = serializer.validated_data['date_fin']

        est_dispo, raison = self._verifier_disponibilite(chambre, date_debut, date_fin)

        return Response({
            'disponible': est_dispo,
            'raison': raison,
            'chambre': chambre.pk,
            'numero_chambre': chambre.numero_chambre,
            'date_debut': date_debut,
            'date_fin': date_fin,
        })

    @extend_schema(
        parameters=[
            OpenApiParameter('date_debut', OpenApiTypes.DATE, description='Date de début (YYYY-MM-DD)', required=True),
            OpenApiParameter('date_fin', OpenApiTypes.DATE, description='Date de fin (YYYY-MM-DD)', required=True),
        ],
        summary="Lister toutes les chambres disponibles sur une période",
    )
    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        """Retourne la liste des chambres disponibles sur une période."""
        serializer = ChambreDisponibiliteSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        date_debut = serializer.validated_data['date_debut']
        date_fin = serializer.validated_data['date_fin']

        chambres = Chambre.objects.select_related('categorie').all()
        chambres_disponibles = []
        for chambre in chambres:
            est_dispo, _ = self._verifier_disponibilite(chambre, date_debut, date_fin)
            if est_dispo:
                chambres_disponibles.append(chambre)

        output_serializer = ChambreSerializer(chambres_disponibles, many=True)
        return Response({
            'count': len(chambres_disponibles),
            'date_debut': date_debut,
            'date_fin': date_fin,
            'results': output_serializer.data,
        })

    @extend_schema(
        request={'type': 'object', 'properties': {'etat_physique': {'type': 'string'}}},
        responses={200: ChambreSerializer},
        summary="Changer rapidement l'état physique d'une chambre",
    )
    @action(detail=True, methods=['patch'], url_path='changer-etat')
    def changer_etat(self, request, pk=None):
        """Change l'état physique d'une chambre."""
        chambre = self.get_object()
        etat = request.data.get('etat_physique')
        etats_valides = [c[0] for c in Chambre.EtatPhysique.choices]

        if etat not in etats_valides:
            return Response(
                {'detail': f"État invalide. Valeurs acceptées : {', '.join(etats_valides)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chambre.etat_physique = etat
        chambre.save(update_fields=['etat_physique'])
        return Response(ChambreSerializer(chambre).data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """Suppression sécurisée : vérifie l'absence de maintenances actives."""
        chambre = self.get_object()

        try:
            from apps.maintenances.models import Maintenance
            maintenances_actives = chambre.maintenances.filter(
                statut__in=[Maintenance.Statut.PLANIFIEE, Maintenance.Statut.EN_COURS]
            )
            if maintenances_actives.exists():
                return Response(
                    {
                        'detail': (
                            f"Impossible de supprimer la chambre {chambre.numero_chambre} : "
                            f"elle a {maintenances_actives.count()} maintenance(s) active(s)."
                        )
                    },
                    status=status.HTTP_409_CONFLICT,
                )
        except Exception:
            pass

        self.perform_destroy(chambre)
        return Response(status=status.HTTP_204_NO_CONTENT)
