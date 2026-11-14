from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from apps.clients.models import Client
from apps.stubs.models import Sejour

from .models import Avis


def make_client(pi='AB1'):
    return Client.objects.create(nom='Alaoui', prenom='Sara', piece_identite=pi)


class AvisModelTest(TestCase):
    def setUp(self):
        self.client_obj = make_client()
        self.sejour = Sejour.objects.create(statut_sejour='TERMINE')

    def test_un_seul_avis_par_sejour(self):
        Avis.objects.create(client=self.client_obj, sejour=self.sejour, note=5)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Avis.objects.create(client=self.client_obj, sejour=self.sejour, note=3)

    def test_contrainte_note_en_base(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Avis.objects.create(client=self.client_obj, sejour=self.sejour, note=9)


class AvisAPITest(APITestCase):
    url = '/api/avis/'

    def setUp(self):
        self.c = make_client()
        self.s_fini = Sejour.objects.create(statut_sejour='TERMINE')
        self.s_cours = Sejour.objects.create(statut_sejour='EN_COURS')

    def payload(self, **kw):
        d = {'client': self.c.pk, 'sejour': self.s_fini.pk, 'note': 5, 'commentaire': 'Super séjour'}
        d.update(kw)
        return d

    def test_creation_ok(self):
        res = self.client.post(self.url, self.payload(), format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['client_nom'], 'Sara Alaoui')

    def test_refuse_si_sejour_non_termine(self):
        res = self.client.post(self.url, self.payload(sejour=self.s_cours.pk), format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refuse_note_hors_bornes(self):
        for n in (0, 6):
            res = self.client.post(self.url, self.payload(note=n), format='json')
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refuse_deuxieme_avis_meme_sejour(self):
        self.client.post(self.url, self.payload(), format='json')
        res = self.client.post(self.url, self.payload(note=2), format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filtres_et_statistiques(self):
        s2 = Sejour.objects.create(statut_sejour='TERMINE')
        Avis.objects.create(client=self.c, sejour=self.s_fini, note=5)
        Avis.objects.create(client=self.c, sejour=s2, note=3)
        res = self.client.get(self.url, {'note': 5})
        self.assertEqual(res.data['count'], 1)
        res = self.client.get(self.url, {'client': self.c.pk})
        self.assertEqual(res.data['count'], 2)
        stats = self.client.get(f'{self.url}statistiques/')
        self.assertEqual(stats.data['total'], 2)
        self.assertEqual(stats.data['note_moyenne'], 4.0)
        self.assertEqual(stats.data['repartition']['5'], 1)

    def test_modification_et_suppression(self):
        a = Avis.objects.create(client=self.c, sejour=self.s_fini, note=4)
        res = self.client.patch(f'{self.url}{a.pk}/', {'note': 2}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.delete(f'{self.url}{a.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
