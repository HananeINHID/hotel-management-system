from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Employe


class EmployeTests(APITestCase):
    """
    Tests unitaires pour la ressource Employé.
    Minimum 3 tests exigés :
    1. Création avec validation email unique
    2. Règle métier : Suppression d'un employé avec paiements -> passage à INACTIF au lieu de suppression
    3. Suppression normale d'un employé sans paiements
    4. Filtres par statut et poste
    """

    def setUp(self):
        self.employe_actif = Employe.objects.create(
            nom="Alami",
            prenom="Rachid",
            poste=Employe.Poste.RECEPTIONNISTE,
            telephone="+212600000001",
            email="rachid.alami@hotel.ma",
            date_embauche=date(2023, 1, 10),
            statut=Employe.Statut.ACTIF
        )
        self.employe_conge = Employe.objects.create(
            nom="Tahiri",
            prenom="Sanaa",
            poste=Employe.Poste.MANAGER,
            telephone="+212600000002",
            email="sanaa.tahiri@hotel.ma",
            date_embauche=date(2022, 6, 1),
            statut=Employe.Statut.EN_CONGE
        )

    def test_1_creer_employe_succes(self):
        """Vérifie la création réussie d'un employé avec des données valides."""
        url = reverse('employe-list')
        data = {
            'nom': "Berrada",
            'prenom': "Salim",
            'poste': Employe.Poste.COMPTABLE,
            'telephone': "+212600000003",
            'email': "salim.berrada@hotel.ma",
            'date_embauche': "2024-01-15",
            'statut': Employe.Statut.ACTIF
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nom'], "Berrada")
        self.assertEqual(response.data['email'], "salim.berrada@hotel.ma")
        self.assertEqual(Employe.objects.count(), 3)

    def test_2_unicite_email_obligatoire(self):
        """Vérifie qu'un employé ne peut pas être créé avec un email déjà existant."""
        url = reverse('employe-list')
        data = {
            'nom': "Doublon",
            'prenom': "Test",
            'poste': Employe.Poste.AUTRE,
            'email': "rachid.alami@hotel.ma",  # Déjà pris dans setUp
            'date_embauche': "2024-02-01",
            'statut': Employe.Statut.ACTIF
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', str(response.data))

    def test_3_suppression_employe_avec_paiements_devient_inactif(self):
        """
        Règle métier : La suppression d'un employé ayant des paiements enregistrés
        doit passer son statut à INACTIF au lieu d'une suppression physique.
        """
        from apps.stubs.models import Sejour
        from apps.paiements.models import Paiement
        from decimal import Decimal

        sejour = Sejour.objects.create(statut_sejour="EN_COURS")
        Paiement.objects.create(
            sejour=sejour,
            employe=self.employe_actif,
            montant=Decimal('100.00'),
            mode_paiement=Paiement.ModePaiement.ESPECES,
            statut=Paiement.StatutPaiement.VALIDE
        )

        url = reverse('employe-detail', kwargs={'pk': self.employe_actif.pk})
        response = self.client.delete(url)

        # Doit retourner HTTP 200 avec message explicatif et statut INACTIF
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employe_actif.refresh_from_db()
        self.assertEqual(self.employe_actif.statut, Employe.Statut.INACTIF)
        # L'employé existe toujours en base de données
        self.assertTrue(Employe.objects.filter(pk=self.employe_actif.pk).exists())

    def test_4_suppression_employe_sans_paiement(self):
        """Un employé sans paiements est supprimé définitivement (204)."""
        url = reverse('employe-detail', kwargs={'pk': self.employe_conge.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Employe.objects.filter(pk=self.employe_conge.pk).exists())

    def test_5_filtres_employes(self):
        """Vérifie le filtrage par statut et poste."""
        url = reverse('employe-list')
        response = self.client.get(url, {'statut': 'ACTIF'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['email'], "rachid.alami@hotel.ma")
