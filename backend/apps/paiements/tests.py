from datetime import date
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Paiement
from apps.employes.models import Employe
from apps.services.models import Service, ConsommationService
from apps.stubs.models import Sejour


class PaiementEtFinanceTests(APITestCase):
    """
    Tests unitaires pour les ressources Paiement et Résumé Financier.
    Minimum 3 tests exigés :
    1. Validation des règles d'enregistrement (référence auto, employé actif, montant > 0)
    2. Règle métier : Un employé inactif ne peut pas enregistrer de paiement
    3. Règle métier : Un paiement ne peut pas dépasser le reste à payer du séjour
    4. Actions de transition : /valider/ et /rembourser/
    5. Règle métier : Paiement VALIDE non modifiable et non supprimable
    6. Endpoint dédié : /api/sejours/{id}/resume-financier/
    """

    def setUp(self):
        self.employe_actif = Employe.objects.create(
            nom="Karima",
            prenom="Bennani",
            poste=Employe.Poste.MANAGER,
            email="karima.manager@hotel.ma",
            date_embauche=date(2022, 1, 1),
            statut=Employe.Statut.ACTIF
        )
        self.employe_inactif = Employe.objects.create(
            nom="Inactif",
            prenom="Test",
            poste=Employe.Poste.RECEPTIONNISTE,
            email="inactif@hotel.ma",
            date_embauche=date(2022, 1, 1),
            statut=Employe.Statut.INACTIF
        )

        self.sejour = Sejour.objects.create(
            statut_sejour="EN_COURS",
            est_archive=False
        )

        self.service = Service.objects.create(
            nom="Massage Relaxant",
            type_service=Service.TypeService.SPA,
            prix_unitaire=Decimal('300.00')
        )

        # Ajout d'une prestation de 600 MAD (2 * 300 MAD)
        self.conso = ConsommationService.objects.create(
            service=self.service,
            sejour=self.sejour,
            quantite=2,
            prix_applique=self.service.prix_unitaire
        )

    def test_1_creer_paiement_avec_reference_auto(self):
        """Vérifie la création d'un paiement avec génération automatique de la référence PAY-AAAAMMJJ-XXXX."""
        url = reverse('paiement-list')
        data = {
            'sejour': self.sejour.pk,
            'employe': self.employe_actif.pk,
            'montant': "200.00",
            'mode_paiement': Paiement.ModePaiement.CARTE_BANCAIRE,
            'statut': Paiement.StatutPaiement.EN_ATTENTE
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['reference_paiement'].startswith("PAY-"))
        self.assertEqual(Decimal(response.data['montant']), Decimal('200.00'))

    def test_2_employe_inactif_rejet_paiement(self):
        """
        Règle métier : Un employé INACTIF ne peut pas enregistrer de paiement.
        """
        url = reverse('paiement-list')
        data = {
            'sejour': self.sejour.pk,
            'employe': self.employe_inactif.pk,
            'montant': "150.00",
            'mode_paiement': Paiement.ModePaiement.ESPECES
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("inactif", str(response.data).lower())

    def test_3_paiement_ne_peut_pas_depasser_reste_a_payer(self):
        """
        Règle métier : Un paiement ne peut pas dépasser le reste à payer du séjour.
        Total dû = 600 MAD. Un paiement de 700 MAD doit être rejeté.
        """
        url = reverse('paiement-list')
        data = {
            'sejour': self.sejour.pk,
            'employe': self.employe_actif.pk,
            'montant': "700.00",  # Dépasse 600.00
            'mode_paiement': Paiement.ModePaiement.CARTE_BANCAIRE
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("dépasse le reste à payer", str(response.data))

    def test_4_actions_valider_et_rembourser(self):
        """
        Vérifie les actions POST /{id}/valider/ et POST /{id}/rembourser/.
        """
        # Création d'un paiement en attente
        paiement = Paiement.objects.create(
            sejour=self.sejour,
            employe=self.employe_actif,
            montant=Decimal('250.00'),
            mode_paiement=Paiement.ModePaiement.CARTE_BANCAIRE,
            statut=Paiement.StatutPaiement.EN_ATTENTE
        )

        # 1. Validation
        url_valider = reverse('paiement-valider', kwargs={'pk': paiement.pk})
        res_valider = self.client.post(url_valider)
        self.assertEqual(res_valider.status_code, status.HTTP_200_OK)
        paiement.refresh_from_db()
        self.assertEqual(paiement.statut, Paiement.StatutPaiement.VALIDE)

        # 2. Remboursement
        url_rembourser = reverse('paiement-rembourser', kwargs={'pk': paiement.pk})
        res_rembourser = self.client.post(url_rembourser)
        self.assertEqual(res_rembourser.status_code, status.HTTP_200_OK)
        paiement.refresh_from_db()
        self.assertEqual(paiement.statut, Paiement.StatutPaiement.REMBOURSE)

    def test_5_paiement_valide_non_modifiable_non_supprimable(self):
        """
        Règle métier : Un paiement VALIDE n'est plus modifiable/supprimable (seulement remboursable).
        """
        paiement_valide = Paiement.objects.create(
            sejour=self.sejour,
            employe=self.employe_actif,
            montant=Decimal('100.00'),
            mode_paiement=Paiement.ModePaiement.ESPECES,
            statut=Paiement.StatutPaiement.VALIDE
        )

        url = reverse('paiement-detail', kwargs={'pk': paiement_valide.pk})

        # Tentative de modification
        res_put = self.client.patch(url, {'montant': '150.00'}, format='json')
        self.assertEqual(res_put.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("validé ne peut plus être modifié", str(res_put.data))

        # Tentative de suppression
        res_del = self.client.delete(url)
        self.assertEqual(res_del.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Paiement.objects.filter(pk=paiement_valide.pk).exists())

    def test_6_endpoint_resume_financier(self):
        """
        Vérifie le calcul correct du résumé financier :
        Total consommations = 600 MAD, Paiement validé = 250 MAD -> Reste = 350 MAD.
        """
        Paiement.objects.create(
            sejour=self.sejour,
            employe=self.employe_actif,
            montant=Decimal('250.00'),
            mode_paiement=Paiement.ModePaiement.VIREMENT,
            statut=Paiement.StatutPaiement.VALIDE
        )

        url = reverse('sejour-resume-financier', kwargs={'id': self.sejour.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_consommations'], "600.00")
        self.assertEqual(response.data['total_paye'], "250.00")
        self.assertEqual(response.data['reste_a_payer'], "350.00")
        self.assertEqual(len(response.data['consommations']), 1)
        self.assertEqual(len(response.data['paiements']), 1)
