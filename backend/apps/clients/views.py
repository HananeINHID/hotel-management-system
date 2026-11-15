from django.apps import apps
from django.db.models import ProtectedError
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ClientFilter
from .models import Client
from .serializers import ClientSerializer


class ClientPagination(PageNumberPagination):
    """Pagination par défaut (10) ; ?page_size=100 autorisé pour alimenter les listes déroulantes."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@extend_schema_view(
    list=extend_schema(summary="Lister les clients (recherche, filtres, pagination)"),
    retrieve=extend_schema(summary="Détails d'un client"),
    create=extend_schema(summary="Créer un client"),
    update=extend_schema(summary="Modifier un client"),
    partial_update=extend_schema(summary="Mise à jour partielle d'un client"),
    destroy=extend_schema(summary="Supprimer un client (refusé s'il a des avis ou réservations)"),
)
class ClientViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des clients.
    Action personnalisée : GET /clients/{id}/historique/
    Règle métier : un client ayant des avis ou des réservations ne peut pas être supprimé (409).
    """

    queryset = Client.objects.all().order_by('nom', 'prenom')
    serializer_class = ClientSerializer
    pagination_class = ClientPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ClientFilter
    search_fields = ['nom', 'prenom', 'piece_identite', 'email', 'telephone']
    ordering_fields = ['nom', 'prenom', 'nationalite', 'id_client']
    ordering = ['nom', 'prenom']

    def destroy(self, request, *args, **kwargs):
        client = self.get_object()

        nb_avis = client.avis.count() if hasattr(client, 'avis') else 0
        if nb_avis > 0:
            return Response(
                {
                    'detail': (
                        f"Impossible de supprimer {client} : "
                        f"il a déposé {nb_avis} avis. Supprimez d'abord ses avis."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        try:
            self.perform_destroy(client)
        except ProtectedError:
            # Ex. : réservations rattachées (module Salma) avec on_delete=PROTECT
            return Response(
                {
                    'detail': (
                        f"Impossible de supprimer {client} : "
                        "il est rattaché à des réservations."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(summary="Historique d'un client : avis et réservations")
    @action(detail=True, methods=['get'], url_path='historique')
    def historique(self, request, pk=None):
        """
        Retourne l'historique du client : ses avis et (si le module Réservations
        est disponible) ses réservations. Lecture défensive pour ne pas casser
        si le modèle de Salma évolue.
        """
        from apps.avis.serializers import AvisSerializer

        client = self.get_object()
        avis = client.avis.select_related('client', 'sejour').order_by('-date_avis', '-id_avis')

        reservations = []
        try:
            Reservation = apps.get_model('reservations', 'Reservation')
            qs = Reservation.objects.filter(client=client).order_by('-pk')
            for r in qs:
                reservations.append({
                    'id_reservation': r.pk,
                    'date_reservation': getattr(r, 'date_reservation', None),
                    'statut_reservation': getattr(r, 'statut_reservation', None),
                    'montant_estime': getattr(r, 'montant_estime', None),
                })
        except Exception:
            # Modèle Réservation pas encore implémenté : liste vide
            reservations = []

        notes = [a.note for a in avis]
        return Response({
            'client': ClientSerializer(client).data,
            'nb_avis': len(notes),
            'note_moyenne': round(sum(notes) / len(notes), 2) if notes else None,
            'avis': AvisSerializer(avis, many=True).data,
            'reservations': reservations,
        })
