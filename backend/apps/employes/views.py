from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Employe
from .serializers import EmployeSerializer, EmployeStatutUpdateSerializer
from .filters import EmployeFilter


@extend_schema_view(
    list=extend_schema(summary="Lister les employés avec filtres (statut, poste) et recherche"),
    retrieve=extend_schema(summary="Détails d'un employé"),
    create=extend_schema(summary="Créer un nouvel employé"),
    update=extend_schema(summary="Modifier un employé"),
    partial_update=extend_schema(summary="Mise à jour partielle d'un employé"),
    destroy=extend_schema(
        summary="Supprimer un employé ou le passer à INACTIF s'il a des paiements enregistrés"
    ),
)
class EmployeViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des employés de l'hôtel.
    Règles métier :
    - Email unique et valide
    - Suppression sécurisée : si l'employé est lié à des paiements, il passe à INACTIF
    """
    queryset = Employe.objects.all().order_by('nom', 'prenom')
    serializer_class = EmployeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EmployeFilter
    search_fields = ['nom', 'prenom', 'email', 'telephone']
    ordering_fields = ['nom', 'prenom', 'date_embauche', 'statut', 'poste']
    ordering = ['nom', 'prenom']

    def destroy(self, request, *args, **kwargs):
        """
        Règle métier : Suppression d'un employé ayant des paiements
        -> passage à INACTIF au lieu de suppression physique.
        """
        instance = self.get_object()

        if instance.paiements.exists():
            instance.statut = Employe.Statut.INACTIF
            instance.save(update_fields=['statut'])
            return Response(
                {
                    'detail': "L'employé est rattaché à des paiements enregistrés. Son statut a été automatiquement basculé à INACTIF au lieu d'une suppression définitive.",
                    'statut': instance.statut,
                    'id_employe': instance.pk
                },
                status=status.HTTP_200_OK
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=EmployeStatutUpdateSerializer,
        responses={200: EmployeSerializer},
        summary="Changement rapide de statut d'un employé (ACTIF, EN_CONGE, INACTIF)"
    )
    @action(detail=True, methods=['patch', 'post'], url_path='changer-statut')
    def changer_statut(self, request, pk=None):
        """Action pour modifier rapidement le statut d'un employé depuis le tableau frontend."""
        employe = self.get_object()
        serializer = EmployeStatutUpdateSerializer(employe, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EmployeSerializer(employe).data, status=status.HTTP_200_OK)
