from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Sejour


class SejourLifecycleTests(APITestCase):
    def setUp(self):
        self.sejour = Sejour.objects.create()

    def test_check_in_check_out_and_archive(self):
        check_in = self.client.post(
            reverse('sejour-check-in', kwargs={'pk': self.sejour.pk})
        )
        self.assertEqual(check_in.status_code, status.HTTP_200_OK)
        self.assertEqual(check_in.data['statut_sejour'], Sejour.Statut.EN_COURS)
        self.assertIsNotNone(check_in.data['arrivee_reelle'])

        check_out = self.client.post(
            reverse('sejour-check-out', kwargs={'pk': self.sejour.pk})
        )
        self.assertEqual(check_out.status_code, status.HTTP_200_OK)
        self.assertEqual(check_out.data['statut_sejour'], Sejour.Statut.TERMINE)
        self.assertIsNotNone(check_out.data['depart_reel'])

        archive = self.client.post(
            reverse('sejour-archiver', kwargs={'pk': self.sejour.pk})
        )
        self.assertEqual(archive.status_code, status.HTTP_200_OK)
        self.assertTrue(archive.data['est_archive'])

    def test_check_out_cannot_precede_check_in(self):
        response = self.client.post(
            reverse('sejour-check-out', kwargs={'pk': self.sejour.pk})
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.sejour.refresh_from_db()
        self.assertEqual(self.sejour.statut_sejour, Sejour.Statut.RESERVE)
        self.assertIsNone(self.sejour.depart_reel)

    def test_archive_requires_completed_stay(self):
        response = self.client.post(
            reverse('sejour-archiver', kwargs={'pk': self.sejour.pk})
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.sejour.refresh_from_db()
        self.assertFalse(self.sejour.est_archive)

    def test_planned_dates_must_be_in_order(self):
        response = self.client.post(
            reverse('sejour-list'),
            {
                'date_arrivee_prevue': '2026-11-15T12:00:00Z',
                'date_depart_prevue': '2026-11-14T12:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_depart_prevue', response.data['errors'])
