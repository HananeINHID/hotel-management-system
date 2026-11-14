from decimal import Decimal
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Service, ConsommationService
from apps.stubs.models import Sejour


class ServiceEtConsommationTests(APITestCase):
    """
    Tests unitaires pour les ressources Service et ConsommationService.
    Minimum 3 tests par ressource :
    Services :
    1. Création avec validation du prix unitaire (>= 0)
    2. Suppression interdite si consommations existantes (Erreur 409 claire)
    3. Suppression normale sans consommations (204) et filtre par type
    Consommations :
    4. Copie automatique de prix_unitaire vers prix_applique et calcul montant_total
    5. Interdiction d'enregistrer une consommation sur séjour archivé ou terminé
    6. Validation quantite >= 1 et filtre ?sejour=
    """

    def setUp(self):
        self.service_spa = Service.objects.create(
            nom="Hammam Royal",
            type_service=Service.TypeService.SPA,
            prix_unitaire=Decimal('250.00'),
            description="Séance complète de hammam et soins"
        )
        self.service_resto = Service.objects.create(
            nom="Petit déjeuner marocain",
            type_service=Service.TypeService.RESTAURATION,
            prix_unitaire=Decimal('90.00'),
            description="Thé, msemen, baghrir, œufs et fruits frais"
        )
        self.sejour_actif = Sejour.objects.create(
            statut_sejour="EN_COURS",
            est_archive=False
        )
        self.sejour_termine = Sejour.objects.create(
            statut_sejour="TERMINE",
            est_archive=False
        )
        self.sejour_archive = Sejour.objects.create(
            statut_sejour="EN_COURS",
            est_archive=True
        )

    # ==================== TESTS SERVICES ====================

    def test_1_creer_service_succes_et_prix_positif(self):
        """Vérifie la création d'un service et le rejet des prix négatifs."""
        url = reverse('service-list')

        # Cas 1 : Création valide
        data_valide = {
            'nom': "Transfert Gare",
            'type_service': Service.TypeService.TRANSPORT,
            'prix_unitaire': "120.00",
            'description': "Navette hôtel - gare"
        }
        res = self.client.post(url, data_valide, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['nom'], "Transfert Gare")
        self.assertEqual(Decimal(res.data['prix_unitaire']), Decimal('120.00'))

        # Cas 2 : Prix négatif rejeté
        data_invalide = {
            'nom': "Service Invalide",
            'type_service': Service.TypeService.AUTRE,
            'prix_unitaire': "-50.00"
        }
        res_err = self.client.post(url, data_invalide, format='json')
        self.assertEqual(res_err.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('prix_unitaire', str(res_err.data))

    def test_2_suppression_service_avec_consommations_interdite_erreur_409(self):
        """
        Règle métier : La suppression d'un service est strictement interdite
        s'il a déjà des consommations enregistrées -> doit retourner 409 Conflict.
        """
        # Création d'une consommation liée
        ConsommationService.objects.create(
            service=self.service_spa,
            sejour=self.sejour_actif,
            quantite=1,
            prix_applique=self.service_spa.prix_unitaire
        )

        url = reverse('service-detail', kwargs={'pk': self.service_spa.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("Impossible de supprimer le service", str(response.data))
        # Le service existe toujours
        self.assertTrue(Service.objects.filter(pk=self.service_spa.pk).exists())

    def test_3_suppression_service_sans_consommation_et_filtre(self):
        """Un service sans consommations peut être supprimé (204)."""
        url = reverse('service-detail', kwargs={'pk': self.service_resto.pk})
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(pk=self.service_resto.pk).exists())

    # ==================== TESTS CONSOMMATIONS ====================

    def test_4_creation_conso_copie_automatique_prix_unitaire(self):
        """
        Règle métier : prix_applique copié automatiquement depuis service.prix_unitaire
        à la création, et montant_total calculé = quantite * prix_applique.
        """
        url = reverse('consommation-list')
        data = {
            'service': self.service_spa.pk,
            'sejour': self.sejour_actif.pk,
            'quantite': 3
            # prix_applique omis volontairement
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Le prix doit correspondre au prix unitaire du service
        self.assertEqual(Decimal(response.data['prix_applique']), self.service_spa.prix_unitaire)
        # montant_total calculé = 3 * 250 = 750.00
        self.assertEqual(Decimal(response.data['montant_total']), Decimal('750.00'))

    def test_5_interdiction_conso_sejour_termine_ou_archive(self):
        """
        Règle métier : Interdit d'enregistrer une consommation sur un séjour terminé ou archivé.
        """
        url = reverse('consommation-list')

        # Test sur séjour terminé
        data_termine = {
            'service': self.service_spa.pk,
            'sejour': self.sejour_termine.pk,
            'quantite': 1
        }
        res_termine = self.client.post(url, data_termine, format='json')
        self.assertEqual(res_termine.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("archivé ou terminé", str(res_termine.data))

        # Test sur séjour archivé
        data_archive = {
            'service': self.service_spa.pk,
            'sejour': self.sejour_archive.pk,
            'quantite': 1
        }
        res_archive = self.client.post(url, data_archive, format='json')
        self.assertEqual(res_archive.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("archivé ou terminé", str(res_archive.data))

    def test_6_validation_quantite_et_filtre_sejour(self):
        """Vérifie quantite >= 1 et le filtre ?sejour="""
        url = reverse('consommation-list')

        # Quantité < 1
        res_err = self.client.post(url, {
            'service': self.service_spa.pk,
            'sejour': self.sejour_actif.pk,
            'quantite': 0
        }, format='json')
        self.assertEqual(res_err.status_code, status.HTTP_400_BAD_REQUEST)

        # Création valide
        self.client.post(url, {
            'service': self.service_spa.pk,
            'sejour': self.sejour_actif.pk,
            'quantite': 2
        }, format='json')

        # Filtre ?sejour=
        res_filtre = self.client.get(url, {'sejour': self.sejour_actif.pk})
        self.assertEqual(res_filtre.status_code, status.HTTP_200_OK)
        results = res_filtre.data.get('results', res_filtre.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['sejour'], self.sejour_actif.pk)
