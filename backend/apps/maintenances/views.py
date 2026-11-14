from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Maintenance
from .serializers import MaintenanceSerializer, MaintenanceStatutUpdateSerializer
from .filters import MaintenanceFilter
from apps.chambres.models import Chambre


@extend_schema_view(
    list=extend_schema(summary="Lister les maintenances avec filtres"),
    retrieve=extend_schema(summary="Détails d'une maintenance"),
    create=extend_schema(summary="Créer une intervention de maintenance"),
    update=extend_schema(summary="Modifier une maintenance"),
    partial_update=extend_schema(summary="Mise à jour partielle d'une maintenance"),
    destroy=extend_schema(summary="Supprimer une maintenance (uniquement si annulée ou planifiée)"),
)
class MaintenanceViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des maintenances.
    Règles métier :
    - Création d'une maintenance bloquante → met automatiquement la chambre en 'en_maintenance'
    - Fin d'une maintenance → remet la chambre en 'disponible' si aucune autre maintenance active
    - Suppression uniquement si statut ANNULEE ou PLANIFIEE
    """
    queryset = Maintenance.objects.select_related('chambre', 'employe').all()
    serializer_class = MaintenanceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MaintenanceFilter
    search_fields = [
        'description',
        'chambre__numero_chambre',
        'employe__nom',
        'employe__prenom',
    ]
    ordering_fields = ['debut', 'fin', 'statut', 'type', 'cout', 'chambre__numero_chambre']
    ordering = ['-debut']

    def _sync_chambre_etat(self, chambre):
        """
        Synchronise l'état physique de la chambre en fonction des maintenances actives.
        Si une maintenance bloquante est PLANIFIEE ou EN_COURS → 'en_maintenance'
        Sinon → 'disponible' (si elle n'était pas hors_service)
        """
        if chambre.etat_physique == Chambre.EtatPhysique.HORS_SERVICE:
            return  # On ne touche pas aux chambres hors service

        maintenance_active = chambre.maintenances.filter(
            bloquante=True,
            statut__in=[Maintenance.Statut.PLANIFIEE, Maintenance.Statut.EN_COURS],
        ).exists()

        if maintenance_active:
            if chambre.etat_physique != Chambre.EtatPhysique.EN_MAINTENANCE:
                chambre.etat_physique = Chambre.EtatPhysique.EN_MAINTENANCE
                chambre.save(update_fields=['etat_physique'])
        else:
            if chambre.etat_physique == Chambre.EtatPhysique.EN_MAINTENANCE:
                chambre.etat_physique = Chambre.EtatPhysique.DISPONIBLE
                chambre.save(update_fields=['etat_physique'])

    def perform_create(self, serializer):
        maintenance = serializer.save()
        if maintenance.bloquante:
            self._sync_chambre_etat(maintenance.chambre)

    def perform_update(self, serializer):
        maintenance = serializer.save()
        self._sync_chambre_etat(maintenance.chambre)

    def destroy(self, request, *args, **kwargs):
        maintenance = self.get_object()
        if maintenance.statut not in [Maintenance.Statut.ANNULEE, Maintenance.Statut.PLANIFIEE]:
            return Response(
                {
                    'detail': (
                        f"Impossible de supprimer une maintenance avec le statut "
                        f"« {maintenance.get_statut_display()} ». "
                        "Seules les maintenances annulées ou planifiées peuvent être supprimées."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        chambre = maintenance.chambre
        self.perform_destroy(maintenance)
        self._sync_chambre_etat(chambre)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=MaintenanceStatutUpdateSerializer,
        responses={200: MaintenanceSerializer},
        summary="Changer rapidement le statut d'une maintenance",
    )
    @action(detail=True, methods=['patch', 'post'], url_path='changer-statut')
    def changer_statut(self, request, pk=None):
        """Change le statut d'une maintenance avec synchronisation de la chambre."""
        maintenance = self.get_object()
        serializer = MaintenanceStatutUpdateSerializer(
            maintenance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self._sync_chambre_etat(maintenance.chambre)
        return Response(MaintenanceSerializer(maintenance).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Historique des maintenances d'une chambre",
        parameters=[],
    )
    @action(detail=False, methods=['get'], url_path=r'chambre/(?P<chambre_id>\d+)/historique')
    def historique_chambre(self, request, chambre_id=None):
        """Retourne l'historique des maintenances pour une chambre donnée."""
        try:
            chambre = Chambre.objects.get(pk=chambre_id)
        except Chambre.DoesNotExist:
            return Response(
                {'detail': f"Chambre #{chambre_id} introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        maintenances = (
            Maintenance.objects
            .filter(chambre=chambre)
            .select_related('employe')
            .order_by('-debut')
        )
        serializer = MaintenanceSerializer(maintenances, many=True)
        return Response({
            'chambre': chambre.pk,
            'numero_chambre': chambre.numero_chambre,
            'count': maintenances.count(),
            'results': serializer.data,
        })
