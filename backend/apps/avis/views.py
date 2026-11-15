from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import AvisFilter
from .models import Avis
from .serializers import AvisSerializer


@extend_schema_view(
    list=extend_schema(summary="Lister les avis (filtres par client, séjour, note, dates)"),
    retrieve=extend_schema(summary="Détails d'un avis"),
    create=extend_schema(summary="Créer un avis (séjour terminé, un seul avis par séjour)"),
    update=extend_schema(summary="Modifier un avis"),
    partial_update=extend_schema(summary="Mise à jour partielle d'un avis"),
    destroy=extend_schema(summary="Supprimer un avis"),
)
class AvisViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des avis.
    Action personnalisée : GET /avis/statistiques/ (note moyenne + répartition par note)
    """

    queryset = Avis.objects.select_related('client', 'sejour').all()
    serializer_class = AvisSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AvisFilter
    search_fields = ['commentaire', 'client__nom', 'client__prenom']
    ordering_fields = ['date_avis', 'note', 'id_avis']
    ordering = ['-date_avis', '-id_avis']

    @extend_schema(summary="Statistiques des avis : moyenne et répartition par note")
    @action(detail=False, methods=['get'], url_path='statistiques')
    def statistiques(self, request):
        base = Avis.objects.all()
        agg = base.aggregate(total=Count('id_avis'), moyenne=Avg('note'))
        repartition = {str(n): 0 for n in range(1, 6)}
        for row in base.values('note').annotate(nb=Count('id_avis')):
            repartition[str(row['note'])] = row['nb']
        return Response({
            'total': agg['total'],
            'note_moyenne': round(agg['moyenne'], 2) if agg['moyenne'] is not None else None,
            'repartition': repartition,
        })
