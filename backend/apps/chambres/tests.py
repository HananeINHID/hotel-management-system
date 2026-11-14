from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from apps.chambres.models import CategorieChambre, Chambre


class CategorieChambreModelTest(TestCase):
    """Tests du modèle CategorieChambre."""

    def setUp(self):
        self.categorie = CategorieChambre.objects.create(
            libelle='Suite Deluxe',
            capacite=2,
            tarif_nuit=Decimal('850.00'),
            description='Suite luxueuse avec vue mer',
        )

    def test_str(self):
        self.assertEqual(str(self.categorie), 'Suite Deluxe')

    def test_champs(self):
        self.assertEqual(self.categorie.capacite, 2)
        self.assertEqual(self.categorie.tarif_nuit, Decimal('850.00'))


class ChambreModelTest(TestCase):
    """Tests du modèle Chambre."""

    def setUp(self):
        self.categorie = CategorieChambre.objects.create(
            libelle='Standard', capacite=1, tarif_nuit=Decimal('400.00')
        )
        self.chambre = Chambre.objects.create(
            numero_chambre='101',
            etage=1,
            categorie=self.categorie,
        )

    def test_str(self):
        self.assertEqual(str(self.chambre), 'Chambre 101')

    def test_etat_par_defaut(self):
        self.assertEqual(self.chambre.etat_physique, Chambre.EtatPhysique.DISPONIBLE)

    def test_numero_unique(self):
        from django.db import IntegrityError
        with self.assertRaises(Exception):
            Chambre.objects.create(
                numero_chambre='101',
                etage=2,
                categorie=self.categorie,
            )


class CategorieChambreAPITest(APITestCase):
    """Tests de l'API CategorieChambre."""

    def setUp(self):
        self.categorie = CategorieChambre.objects.create(
            libelle='Standard', capacite=2, tarif_nuit=Decimal('500.00')
        )

    def test_list(self):
        response = self.client.get('/api/categories-chambres/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        data = {
            'libelle': 'Suite Junior',
            'capacite': 2,
            'tarif_nuit': '750.00',
            'description': 'Confortable',
        }
        response = self.client.post('/api/categories-chambres/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['libelle'], 'Suite Junior')

    def test_create_libelle_duplique(self):
        data = {'libelle': 'Standard', 'capacite': 1, 'tarif_nuit': '300.00'}
        response = self.client.post('/api/categories-chambres/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_capacite_invalide(self):
        data = {'libelle': 'Nouvelle', 'capacite': 0, 'tarif_nuit': '300.00'}
        response = self.client.post('/api/categories-chambres/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve(self):
        response = self.client.get(f'/api/categories-chambres/{self.categorie.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['libelle'], 'Standard')

    def test_update(self):
        data = {'libelle': 'Standard Modifié', 'capacite': 2, 'tarif_nuit': '550.00'}
        response = self.client.put(
            f'/api/categories-chambres/{self.categorie.pk}/', data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['libelle'], 'Standard Modifié')

    def test_delete_sans_chambre(self):
        response = self.client.delete(f'/api/categories-chambres/{self.categorie.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_avec_chambre_protege(self):
        Chambre.objects.create(
            numero_chambre='201', etage=2, categorie=self.categorie
        )
        response = self.client.delete(f'/api/categories-chambres/{self.categorie.pk}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)


class ChambreAPITest(APITestCase):
    """Tests de l'API Chambre."""

    def setUp(self):
        self.categorie = CategorieChambre.objects.create(
            libelle='Standard', capacite=2, tarif_nuit=Decimal('500.00')
        )
        self.chambre = Chambre.objects.create(
            numero_chambre='101',
            etage=1,
            categorie=self.categorie,
        )

    def test_list(self):
        response = self.client.get('/api/chambres/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        data = {
            'numero_chambre': '102',
            'etage': 1,
            'categorie': self.categorie.pk,
            'etat_physique': 'disponible',
        }
        response = self.client.post('/api/chambres/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_numero_duplique(self):
        data = {
            'numero_chambre': '101',
            'etage': 2,
            'categorie': self.categorie.pk,
        }
        response = self.client.post('/api/chambres/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve(self):
        response = self.client.get(f'/api/chambres/{self.chambre.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero_chambre'], '101')
        self.assertIn('categorie_detail', response.data)

    def test_filtre_etage(self):
        response = self.client.get('/api/chambres/?etage=1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data['results']:
            self.assertEqual(item['etage'], 1)

    def test_filtre_etat(self):
        response = self.client.get('/api/chambres/?etat_physique=disponible')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_recherche_numero(self):
        response = self.client.get('/api/chambres/?search=101')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)

    def test_changer_etat(self):
        response = self.client.patch(
            f'/api/chambres/{self.chambre.pk}/changer-etat/',
            {'etat_physique': 'hors_service'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.chambre.refresh_from_db()
        self.assertEqual(self.chambre.etat_physique, Chambre.EtatPhysique.HORS_SERVICE)

    def test_changer_etat_invalide(self):
        response = self.client.patch(
            f'/api/chambres/{self.chambre.pk}/changer-etat/',
            {'etat_physique': 'etat_inexistant'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_disponibilite_hors_service(self):
        self.chambre.etat_physique = Chambre.EtatPhysique.HORS_SERVICE
        self.chambre.save()
        response = self.client.get(
            f'/api/chambres/{self.chambre.pk}/disponibilite/',
            {'date_debut': '2027-01-10', 'date_fin': '2027-01-15'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['disponible'])

    def test_disponibilite_disponible(self):
        response = self.client.get(
            f'/api/chambres/{self.chambre.pk}/disponibilite/',
            {'date_debut': '2027-01-10', 'date_fin': '2027-01-15'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['disponible'])

    def test_disponibilite_dates_invalides(self):
        response = self.client.get(
            f'/api/chambres/{self.chambre.pk}/disponibilite/',
            {'date_debut': '2027-01-15', 'date_fin': '2027-01-10'},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_liste_disponibles(self):
        response = self.client.get(
            '/api/chambres/disponibles/',
            {'date_debut': '2027-01-10', 'date_fin': '2027-01-15'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
