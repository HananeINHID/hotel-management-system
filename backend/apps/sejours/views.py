
from django.apps import apps
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q, Exists, OuterRef, Subquery
from django.utils import timezone

from rest_framework import mixins, status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from . import services
from .models import Sejour
from .serializers import (
    ArriveeSerializer,
    CheckInSerializer,
    CheckOutSerializer,
    SejourSerializer,
)


def handle_business_error(function, *args):
    try:
        return function(*args)
    except DjangoValidationError as error:
        if hasattr(error, "message_dict"):
            raise ValidationError(error.message_dict)
        raise ValidationError(error.messages)


def get_date_param(request, name):
    value = request.query_params.get(name)

    if not value:
        return timezone.localdate()

    return serializers.DateField().run_validation(value)


class SejourViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):

    serializer_class = SejourSerializer

    def get_queryset(self):
        qs = Sejour.objects.select_related(
            "reservation",
            "reservation__client",
            "chambre",
        )

        params = self.request.query_params

        statut = params.get("statut")
        if statut:
            qs = qs.filter(statut_sejour=statut)

        archive = params.get("archive")
        if archive in ("true", "false"):
            qs = qs.filter(est_archive=(archive == "true"))

        date_from = params.get("date_from")
        date_to = params.get("date_to")

        if date_from:
            date_from = serializers.DateField().run_validation(date_from)
            qs = qs.filter(arrivee_reelle__date__gte=date_from)

        if date_to:
            date_to = serializers.DateField().run_validation(date_to)
            qs = qs.filter(arrivee_reelle__date__lte=date_to)

        if date_from and date_to and date_from > date_to:
            raise ValidationError({
                "date": "La date de début doit précéder la date de fin."
            })

        terme = params.get("q")
        if terme:
            qs = qs.filter(
                Q(reservation__client__nom__icontains=terme)
                | Q(reservation__client__prenom__icontains=terme)
                | Q(chambre__numero_chambre__icontains=terme)
            )

        return qs

    @action(detail=False, methods=["post"], url_path="check-in")
    def check_in(self, request):
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ReservationChambre = apps.get_model(
            "reservations",
            "ReservationChambre",
        )

        try:
            reservation_chambre = (
                ReservationChambre.objects.select_related(
                    "reservation",
                    "chambre",
                ).get(
                    pk=serializer.validated_data["reservation_chambre"]
                )
            )
        except ReservationChambre.DoesNotExist:
            raise ValidationError({
                "reservation_chambre": "Cette chambre réservée n'existe pas."
            })

        sejour = handle_business_error(
            services.check_in,
            reservation_chambre,
            serializer.validated_data.get("observations", ""),
            serializer.validated_data.get("arrivee_reelle"),
        )

        return Response(
            self.get_serializer(sejour).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="check-out")
    def check_out(self, request, pk=None):
        serializer = CheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sejour = handle_business_error(
            services.check_out,
            self.get_object(),
            serializer.validated_data.get("observations", ""),
            serializer.validated_data.get("depart_reel"),
        )

        return Response(self.get_serializer(sejour).data)

    @action(detail=True, methods=["post"])
    def archiver(self, request, pk=None):
        sejour = handle_business_error(
            services.archiver,
            self.get_object(),
        )

        return Response(self.get_serializer(sejour).data)

    @action(detail=True, methods=["post"])
    def desarchiver(self, request, pk=None):
        sejour = handle_business_error(
            services.desarchiver,
            self.get_object(),
        )

        return Response(self.get_serializer(sejour).data)

    @action(detail=False, methods=["get"])
    def arrivees(self, request):
        ReservationChambre = apps.get_model(
            "reservations",
            "ReservationChambre",
        )

        jour = get_date_param(request, "date")

        sejours_existants = Sejour.objects.filter(
            reservation_id=OuterRef("reservation_id"),
            chambre_id=OuterRef("chambre_id"),
        )

        qs = (
            ReservationChambre.objects
            .annotate(deja_en_sejour=Exists(sejours_existants))
            .filter(
                deja_en_sejour=False,
                date_arrivee_prevue__lte=jour,
                date_depart_prevue__gt=jour,
                reservation__statut_reservation="CONFIRMEE",
            )
            .select_related(
                "reservation",
                "reservation__client",
                "chambre",
            )
            .order_by("date_arrivee_prevue")
        )

        return Response(ArriveeSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def departs(self, request):
        ReservationChambre = apps.get_model(
            "reservations",
            "ReservationChambre",
        )

        jour = get_date_param(request, "date")

        date_prevue = ReservationChambre.objects.filter(
            reservation_id=OuterRef("reservation_id"),
            chambre_id=OuterRef("chambre_id"),
        ).values("date_depart_prevue")[:1]

        qs = (
            self.get_queryset()
            .annotate(date_depart_prevue=Subquery(date_prevue))
            .filter(
                statut_sejour=Sejour.Statut.EN_COURS,
                est_archive=False,
                date_depart_prevue__lte=jour,
            )
        )

        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def historique(self, request):
        qs = self.get_queryset().exclude(
            statut_sejour=Sejour.Statut.EN_COURS
        )

        return Response(self.get_serializer(qs, many=True).data)
