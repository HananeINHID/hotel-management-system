from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Service, ConsommationService
from .serializers import ServiceSerializer, ConsommationServiceSerializer
from .filters import ServiceFilter, ConsommationServiceFilter


@extend_schema_view(
    list=extend_schema(summary="Lister les services (filtre par type_service, recherche)"),
    retrieve=extend_schema(summary="Détails d'un service"),
    create=extend_schema(summary="Créer un nouveau service"),
    update=extend_schema(summary="Modifier un service"),
    partial_update=extend_schema(summary="Mise à jour partielle d'un service"),
    destroy=extend_schema(
        summary="Supprimer un service (interdit avec 409 si consommations existantes)"
    ),
)
class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour le catalogue des services.
    Règles métier :
    - prix_unitaire >= 0
    - type_service parmi les choix autorisés
    - Suppression interdite si le service a déjà des consommations (retourne 409 Conflict)
    """
    queryset = Service.objects.all().order_by('nom')
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServiceFilter
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'prix_unitaire', 'type_service']
    ordering = ['nom']

    def destroy(self, request, *args, **kwargs):
        """
        Règle métier : Suppression interdite si le service a déjà des consommations (erreur 409 claire).
        """
        instance = self.get_object()
        if instance.consommations.exists():
            return Response(
                {
                    'status_code': status.HTTP_409_CONFLICT,
                    'error': 'Conflict',
                    'detail': f"Impossible de supprimer le service '{instance.nom}' car {instance.consommations.count()} consommation(s) lui sont associées."
                },
                status=status.HTTP_409_CONFLICT
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(summary="Lister les consommations de services (filtre ?sejour=, ?service=)"),
    retrieve=extend_schema(summary="Détails d'une consommation de service"),
    create=extend_schema(summary="Enregistrer une consommation de service sur un séjour"),
    update=extend_schema(summary="Modifier une consommation"),
    partial_update=extend_schema(summary="Mise à jour partielle d'une consommation"),
    destroy=extend_schema(summary="Supprimer une consommation"),
)
class ConsommationServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les consommations de services rattachées aux séjours.
    Règles métier :
    - Copie automatique du prix unitaire du service
    - Quantité >= 1
    - Interdit sur un séjour archivé ou terminé
    - Calcul du montant_total = quantite * prix_applique
    """
    queryset = ConsommationService.objects.select_related('service', 'sejour').all().order_by('-date_consommation')
    serializer_class = ConsommationServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ConsommationServiceFilter
    ordering_fields = ['date_consommation', 'quantite', 'prix_applique']
    ordering = ['-date_consommation']
