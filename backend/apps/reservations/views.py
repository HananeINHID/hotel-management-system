from django.db.models import Q
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.chambres.serializers import ChambreSerializer

from . import services
from .models import Reservation
from .serializers import (
    DisponibiliteParamsSerializer,
    ReservationSerializer,
    erreurs_metier,
)


class ReservationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ReservationViewSet(viewsets.ModelViewSet):
    """
    CRUD des réservations (multi-chambres) + actions métier.

    - POST   /reservations/                    création avec la liste des chambres (CONCERNER)
    - PUT/PATCH /reservations/{id}/            modification (client, employé, chambres)
    - POST   /reservations/{id}/confirmer|annuler|terminer/
    - GET    /reservations/disponibilites/?date_debut=&date_fin=
    """

    serializer_class = ReservationSerializer
    pagination_class = ReservationPagination
    ordering_fields = ["id_reservation", "date_reservation", "montant_estime"]
    ordering = ["-id_reservation"]
    search_fields = ["client__nom", "client__prenom", "client__piece_identite"]
    filterset_fields = ["statut_reservation", "client", "employe"]

    def get_queryset(self):
        qs = Reservation.objects.select_related("client", "employe").prefetch_related(
            "chambres_reservees__chambre__categorie"
        )
        p = self.request.query_params

        chambre = p.get("chambre")
        if chambre:
            qs = qs.filter(chambres_reservees__chambre_id=chambre).distinct()

        # Réservations dont au moins une chambre chevauche la période demandée
        date_from, date_to = p.get("date_from"), p.get("date_to")
        if date_from:
            qs = qs.filter(chambres_reservees__date_depart_prevue__gt=date_from)
        if date_to:
            qs = qs.filter(chambres_reservees__date_arrivee_prevue__lte=date_to)
        if date_from or date_to:
            qs = qs.distinct()

        q = p.get("q")
        if q:
            qs = qs.filter(
                Q(client__nom__icontains=q)
                | Q(client__prenom__icontains=q)
                | Q(chambres_reservees__chambre__numero_chambre__icontains=q)
            ).distinct()
        return qs

    # ---- actions de statut
    def _changer(self, request, nouveau):
        reservation = self.get_object()
        with erreurs_metier():
            reservation = services.changer_statut(reservation, nouveau)
        return Response(self.get_serializer(self.get_queryset().get(pk=reservation.pk)).data)

    @extend_schema(request=None, summary="Confirmer une réservation")
    @action(detail=True, methods=["post"])
    def confirmer(self, request, pk=None):
        return self._changer(request, Reservation.Statut.CONFIRMEE)

    @extend_schema(request=None, summary="Annuler une réservation")
    @action(detail=True, methods=["post"])
    def annuler(self, request, pk=None):
        return self._changer(request, Reservation.Statut.ANNULEE)

    @extend_schema(request=None, summary="Terminer une réservation (tous les séjours clos)")
    @action(detail=True, methods=["post"])
    def terminer(self, request, pk=None):
        return self._changer(request, Reservation.Statut.TERMINEE)

    # ---- disponibilité
    @extend_schema(
        parameters=[
            OpenApiParameter("date_debut", OpenApiTypes.DATE, required=True),
            OpenApiParameter("date_fin", OpenApiTypes.DATE, required=True),
            OpenApiParameter("nb_occupants", OpenApiTypes.INT),
            OpenApiParameter("categorie", OpenApiTypes.INT),
            OpenApiParameter("exclure_reservation", OpenApiTypes.INT,
                             description="Ignore les lignes de cette réservation (édition)."),
        ],
        summary="Chambres disponibles / indisponibles sur une période",
    )
    @action(detail=False, methods=["get"])
    def disponibilites(self, request):
        params = DisponibiliteParamsSerializer(data=request.query_params)
        params.is_valid(raise_exception=True)
        d = params.validated_data

        resultats = services.disponibilites(
            d["date_debut"], d["date_fin"],
            exclure_reservation_id=d.get("exclure_reservation"),
            nb_occupants=d.get("nb_occupants"),
            categorie_id=d.get("categorie"),
        )
        data = []
        for chambre, raison in resultats:
            ligne = dict(ChambreSerializer(chambre).data)
            ligne["disponible"] = raison is None
            ligne["raison"] = raison
            data.append(ligne)

        return Response({
            "date_debut": d["date_debut"],
            "date_fin": d["date_fin"],
            "nb_nuits": services.nb_nuits(d["date_debut"], d["date_fin"]),
            "nb_disponibles": sum(1 for l in data if l["disponible"]),
            "results": data,
        })

    # ---- suppression contrôlée
    def destroy(self, request, *args, **kwargs):
        reservation = self.get_object()
        with erreurs_metier():
            services.verifier_suppression(reservation)
            reservation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
