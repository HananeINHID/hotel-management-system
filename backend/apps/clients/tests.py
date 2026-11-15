from django.db import IntegrityError
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

# Create your tests here.
from apps.avis.models import Avis
from apps.clients.factories import creer_reservation_chambre, creer_sejour
from .models import Client


def make_client(**kw):
    data = dict(nom='Alaoui', prenom='Sara', piece_identite='AB123456',
                telephone='+212 600 000 000', email='sara@example.com', nationalite='Marocaine')
    data.update(kw)
    return Client.objects.create(**data)


class ClientModelTest(TestCase):
    def test_str(self):
        self.assertEqual(str(make_client()), 'Alaoui Sara')

    def test_piece_identite_unique(self):
        make_client()
        with self.assertRaises(IntegrityError):
            make_client(nom='Autre')


class ClientAPITest(APITestCase):
    url = '/api/clients/'

    def test_creation_normalise_piece_identite(self):
        res = self.client.post(self.url, {
            'nom': 'Benani', 'prenom': 'Youssef', 'piece_identite': ' cd987654 ',
            'telephone': '+212 661 23 45 67', 'email': 'y@example.com', 'nationalite': 'Marocaine',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['piece_identite'], 'CD987654')

    def test_telephone_obligatoire(self):
        res = self.client.post(self.url, {'nom': 'X', 'prenom': 'Y', 'piece_identite': 'ZZ2'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_piece_identite_en_double_refusee(self):
        make_client()
        res = self.client.post(self.url, {
            'nom': 'X', 'prenom': 'Y', 'piece_identite': 'ab123456', 'telephone': '0600000000',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_telephone_invalide(self):
        res = self.client.post(self.url, {'nom': 'X', 'prenom': 'Y', 'piece_identite': 'ZZ1', 'telephone': 'abc'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recherche_et_filtre(self):
        make_client()
        make_client(nom='Smith', prenom='John', piece_identite='P999', nationalite='Britannique')
        res = self.client.get(self.url, {'search': 'smith'})
        self.assertEqual(res.data['count'], 1)
        res = self.client.get(self.url, {'nationalite': 'marocaine'})
        self.assertEqual(res.data['count'], 1)

    def test_modification(self):
        c = make_client()
        res = self.client.patch(f'{self.url}{c.pk}/', {'telephone': '0600112233'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        c.refresh_from_db()
        self.assertEqual(c.telephone, '0600112233')

    def test_suppression_ok_sans_avis(self):
        c = make_client()
        res = self.client.delete(f'{self.url}{c.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_suppression_refusee_avec_avis(self):
        c = make_client()
        s = creer_sejour(statut_sejour='TERMINE', client=c)
        Avis.objects.create(client=c, sejour=s, note=5)
        res = self.client.delete(f'{self.url}{c.pk}/')
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

    def test_suppression_refusee_avec_reservation(self):
        c = make_client()
        creer_reservation_chambre(client=c)
        res = self.client.delete(f'{self.url}{c.pk}/')
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

    def test_historique(self):
        c = make_client()
        s = creer_sejour(statut_sejour='TERMINE', client=c)
        Avis.objects.create(client=c, sejour=s, note=4, commentaire='Très bien')
        res = self.client.get(f'{self.url}{c.pk}/historique/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['nb_avis'], 1)
        self.assertEqual(res.data['note_moyenne'], 4.0)
        self.assertEqual(len(res.data['reservations']), 1)
        self.assertEqual(res.data['reservations'][0]['id_reservation'], s.reservation_id)


class ClientPaginationTest(APITestCase):
    def test_page_size_personnalisee(self):
        for i in range(15):
            make_client(piece_identite=f'ID{i}', nom=f'Nom{i}')
        self.assertEqual(len(self.client.get('/api/clients/').data['results']), 10)
        self.assertEqual(len(self.client.get('/api/clients/', {'page_size': 100}).data['results']), 15)
