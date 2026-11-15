"""
Tests du module Réservations (Salma).
    python manage.py test apps.reservations --settings=config.settings_test

Nécessite la migration des séjours alignée sur le modèle de Hamza
(colonnes reservation / chambre) : l'API lit la relation `reservation.sejours`.
"""
from datetime import timedelta
from decimal import Decimal

from django.db import DatabaseError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.chambres.models import CategorieChambre, Chambre
from apps.clients.factories import creer_chambre, creer_client, creer_employe

from .models import Reservation, ReservationChambre


def jour(n):
    return timezone.localdate() + timedelta(days=n)


class ReservationBase(APITestCase):
    def setUp(self):
        self.client_hotel = creer_client()
        self.employe = creer_employe()
        cat = CategorieChambre.objects.create(
            libelle="Double", capacite=2, tarif_nuit=Decimal("500.00")
        )
        self.ch1 = creer_chambre(categorie=cat)
        self.ch2 = creer_chambre(categorie=cat)

    def payload(self, lignes=None, **extra):
        lignes = lignes or [
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(10)),
             "date_depart_prevue": str(jour(13)), "nb_occupants": 2},
        ]
        data = {"client": self.client_hotel.pk, "employe": self.employe.pk, "chambres": lignes}
        data.update(extra)
        return data

    def creer(self, **kwargs):
        r = self.client.post("/api/reservations/", self.payload(**kwargs), format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)
        return r.data


class CreationTests(ReservationBase):
    def test_reservation_multichambre_avec_dates_differentes(self):
        data = self.creer(lignes=[
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(10)),
             "date_depart_prevue": str(jour(13)), "nb_occupants": 2},
            {"chambre": self.ch2.pk, "date_arrivee_prevue": str(jour(11)),
             "date_depart_prevue": str(jour(15)), "nb_occupants": 1},
        ])
        self.assertEqual(data["statut_reservation"], "EN_ATTENTE")
        self.assertEqual(data["nb_chambres"], 2)
        self.assertEqual(data["nb_personnes_total"], 3)
        # 3 nuits x 500 + 4 nuits x 500
        self.assertEqual(Decimal(data["montant_estime"]), Decimal("3500.00"))
        self.assertEqual(data["date_arrivee"], str(jour(10)))
        self.assertEqual(data["date_depart"], str(jour(15)))

    def test_tarif_applique_par_defaut_depuis_la_categorie(self):
        data = self.creer()
        self.assertEqual(Decimal(data["chambres"][0]["tarif_nuit_applique"]), Decimal("500.00"))

    def test_creation_avec_confirmation_directe(self):
        data = self.creer(confirmer=True)
        self.assertEqual(data["statut_reservation"], "CONFIRMEE")

    def test_chevauchement_refuse(self):
        self.creer()
        r = self.client.post("/api/reservations/", self.payload(lignes=[
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(12)),
             "date_depart_prevue": str(jour(14)), "nb_occupants": 1},
        ]), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("déjà réservée", str(r.data).lower())
        self.assertEqual(Reservation.objects.count(), 1)

    def test_depart_le_jour_de_larrivee_suivante_autorise(self):
        self.creer()
        r = self.client.post("/api/reservations/", self.payload(lignes=[
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(13)),
             "date_depart_prevue": str(jour(15)), "nb_occupants": 1},
        ]), format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

    def test_capacite_depassee(self):
        r = self.client.post("/api/reservations/", self.payload(lignes=[
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(10)),
             "date_depart_prevue": str(jour(12)), "nb_occupants": 3},
        ]), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_date_dans_le_passe(self):
        r = self.client.post("/api/reservations/", self.payload(lignes=[
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(-2)),
             "date_depart_prevue": str(jour(1)), "nb_occupants": 1},
        ]), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_depart_avant_arrivee(self):
        r = self.client.post("/api/reservations/", self.payload(lignes=[
            {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(12)),
             "date_depart_prevue": str(jour(10)), "nb_occupants": 1},
        ]), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_chambre_hors_service(self):
        self.ch1.etat_physique = Chambre.EtatPhysique.HORS_SERVICE
        self.ch1.save()
        r = self.client.post("/api/reservations/", self.payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_meme_chambre_deux_fois(self):
        ligne = {"chambre": self.ch1.pk, "date_arrivee_prevue": str(jour(10)),
                 "date_depart_prevue": str(jour(12)), "nb_occupants": 1}
        r = self.client.post("/api/reservations/", self.payload(lignes=[ligne, ligne]), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_au_moins_une_chambre(self):
        r = self.client.post("/api/reservations/", self.payload(lignes=[]), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_employe_inactif(self):
        self.employe.statut = "INACTIF"
        self.employe.save()
        r = self.client.post("/api/reservations/", self.payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class StatutsEtModificationTests(ReservationBase):
    def test_confirmer_puis_annuler(self):
        rid = self.creer()["id_reservation"]
        r = self.client.post(f"/api/reservations/{rid}/confirmer/")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data["statut_reservation"], "CONFIRMEE")
        r = self.client.post(f"/api/reservations/{rid}/annuler/")
        self.assertEqual(r.data["statut_reservation"], "ANNULEE")

    def test_annulee_est_definitive(self):
        rid = self.creer()["id_reservation"]
        self.client.post(f"/api/reservations/{rid}/annuler/")
        r = self.client.post(f"/api/reservations/{rid}/confirmer/")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_annulation_libere_la_chambre(self):
        rid = self.creer()["id_reservation"]
        self.client.post(f"/api/reservations/{rid}/annuler/")
        self.creer()  # même chambre, mêmes dates : possible

    def test_terminer_sans_sejour_refuse(self):
        rid = self.creer(confirmer=True)["id_reservation"]
        r = self.client.post(f"/api/reservations/{rid}/terminer/")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_modifier_remplace_les_chambres_et_recalcule(self):
        rid = self.creer()["id_reservation"]
        r = self.client.patch(f"/api/reservations/{rid}/", {"chambres": [
            {"chambre": self.ch2.pk, "date_arrivee_prevue": str(jour(20)),
             "date_depart_prevue": str(jour(22)), "nb_occupants": 1},
        ]}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data["nb_chambres"], 1)
        self.assertEqual(Decimal(r.data["montant_estime"]), Decimal("1000.00"))
        self.assertEqual(r.data["nb_personnes_total"], 1)

    def test_modifier_sa_propre_reservation_sans_conflit_avec_elle_meme(self):
        data = self.creer()
        rid = data["id_reservation"]
        ligne = data["chambres"][0]
        r = self.client.patch(f"/api/reservations/{rid}/", {"chambres": [
            {"chambre": ligne["chambre"], "date_arrivee_prevue": ligne["date_arrivee_prevue"],
             "date_depart_prevue": str(jour(14)), "nb_occupants": 2},
        ]}, format="json")
        self.assertEqual(r.status_code, 200, r.data)

    def test_modification_refusee_si_annulee(self):
        rid = self.creer()["id_reservation"]
        self.client.post(f"/api/reservations/{rid}/annuler/")
        r = self.client.patch(f"/api/reservations/{rid}/", {"employe": self.employe.pk}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_suppression_confirmee_refusee_en_attente_autorisee(self):
        rid = self.creer(confirmer=True)["id_reservation"]
        self.assertEqual(self.client.delete(f"/api/reservations/{rid}/").status_code, 400)
        rid2 = self.creer(lignes=[
            {"chambre": self.ch2.pk, "date_arrivee_prevue": str(jour(30)),
             "date_depart_prevue": str(jour(31)), "nb_occupants": 1}])["id_reservation"]
        self.assertEqual(self.client.delete(f"/api/reservations/{rid2}/").status_code, 204)
        self.assertFalse(ReservationChambre.objects.filter(reservation_id=rid2).exists())


class DisponibiliteTests(ReservationBase):
    def get(self, **params):
        base = {"date_debut": str(jour(10)), "date_fin": str(jour(13))}
        base.update(params)
        r = self.client.get("/api/reservations/disponibilites/", base)
        self.assertEqual(r.status_code, 200, r.data)
        return {c["id_chambre"]: c for c in r.data["results"]}

    def test_chambre_reservee_indisponible(self):
        self.creer()
        res = self.get()
        self.assertFalse(res[self.ch1.pk]["disponible"])
        self.assertIn("réservée", res[self.ch1.pk]["raison"])
        self.assertTrue(res[self.ch2.pk]["disponible"])

    def test_exclure_reservation_en_edition(self):
        rid = self.creer()["id_reservation"]
        self.assertTrue(self.get(exclure_reservation=rid)[self.ch1.pk]["disponible"])

    def test_capacite_prise_en_compte(self):
        self.assertFalse(self.get(nb_occupants=5)[self.ch1.pk]["disponible"])

    def test_periode_invalide(self):
        r = self.client.get("/api/reservations/disponibilites/",
                            {"date_debut": str(jour(5)), "date_fin": str(jour(5))})
        self.assertEqual(r.status_code, 400)


class TriggerTests(ReservationBase):
    """Les triggers protègent aussi les écritures qui contournent l'API."""

    def nouvelle_reservation(self):
        return Reservation.objects.create(client=self.client_hotel, employe=self.employe)

    def ligne(self, res, chambre, a, d, occ=1):
        return ReservationChambre.objects.create(
            reservation=res, chambre=chambre, date_arrivee_prevue=jour(a),
            date_depart_prevue=jour(d), nb_occupants=occ, tarif_nuit_applique=Decimal("500"),
        )

    def test_trigger_chevauchement(self):
        self.ligne(self.nouvelle_reservation(), self.ch1, 10, 13)
        with self.assertRaises(DatabaseError), transaction.atomic():
            self.ligne(self.nouvelle_reservation(), self.ch1, 12, 14)

    def test_trigger_capacite(self):
        with self.assertRaises(DatabaseError), transaction.atomic():
            self.ligne(self.nouvelle_reservation(), self.ch1, 10, 12, occ=3)

    def test_trigger_totaux_automatiques(self):
        res = self.nouvelle_reservation()
        self.ligne(res, self.ch1, 10, 13, occ=2)
        self.ligne(res, self.ch2, 10, 12, occ=1)
        res.refresh_from_db()
        self.assertEqual(res.nb_personnes_total, 3)
        self.assertEqual(res.montant_estime, Decimal("2500.00"))
        ReservationChambre.objects.filter(reservation=res, chambre=self.ch2).delete()
        res.refresh_from_db()
        self.assertEqual(res.montant_estime, Decimal("1500.00"))

    def test_trigger_statut_final(self):
        res = self.nouvelle_reservation()
        self.ligne(res, self.ch1, 10, 12)
        res.statut_reservation = Reservation.Statut.ANNULEE
        res.save()
        res.statut_reservation = Reservation.Statut.CONFIRMEE
        with self.assertRaises(DatabaseError), transaction.atomic():
            res.save()

    def test_trigger_confirmation_sans_chambre(self):
        res = self.nouvelle_reservation()
        res.statut_reservation = Reservation.Statut.CONFIRMEE
        with self.assertRaises(DatabaseError), transaction.atomic():
            res.save()
