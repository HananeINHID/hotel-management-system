import datetime
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.chambres.models import CategorieChambre, Chambre
from apps.employes.models import Employe
from apps.maintenances.models import Maintenance


def make_employe(**kwargs):
    defaults = dict(
        nom='Alami',
        prenom='Youssef',
        poste='MAINTENANCE',
        email='youssef.alami@hotel.ma',
        date_embauche=datetime.date(2022, 1, 1),
        statut='ACTIF',
    )
    defaults.update(kwargs)
    return Employe.objects.create(**defaults)


def make_categorie(**kwargs):
    defaults = dict(libelle='Standard', capacite=2, tarif_nuit=Decimal('500.00'))
    defaults.update(kwargs)
    return CategorieChambre.objects.create(**defaults)


def make_chambre(categorie, **kwargs):
    defaults = dict(numero_chambre='101', etage=1, categorie=categorie)
    defaults.update(kwargs)
    return Chambre.objects.create(**defaults)


def make_maintenance(chambre, employe, **kwargs):
    defaults = dict(
        chambre=chambre,
        employe=employe,
        debut=datetime.datetime(2027, 1, 10, 8, 0),
        type='corrective',
        description='Fuite robinet',
        statut='planifiee',
        bloquante=True,
    )
    defaults.update(kwargs)
    return Maintenance.objects.create(**defaults)


class MaintenanceModelTest(TestCase):
    """Tests du modèle Maintenance."""

    def setUp(self):
        self.categorie = make_categorie()
        self.chambre = make_chambre(self.categorie)
        self.employe = make_employe()

    def test_str(self):
        m = make_maintenance(self.chambre, self.employe)
        self.assertIn('Maintenance', str(m))

    def test_clean_fin_avant_debut(self):
        from django.core.exceptions import ValidationError
        m = Maintenance(
            chambre=self.chambre,
            employe=self.employe,
            debut=datetime.datetime(2027, 1, 10, 10, 0),
            fin=datetime.datetime(2027, 1, 10, 8, 0),
            type='corrective',
            description='Test',
        )
        with self.assertRaises(ValidationError):
            m.clean()

    def test_creation_bloquante_met_chambre_en_maintenance(self):
        """La création d'une maintenance bloquante synchro l'état de la chambre."""
        # On passe par l'API pour déclencher perform_create
        pass  # Testé dans MaintenanceAPITest


class MaintenanceAPITest(APITestCase):
    """Tests de l'API Maintenance."""

    def setUp(self):
        self.categorie = make_categorie()
        self.chambre = make_chambre(self.categorie)
        self.employe = make_employe()

    def _post_maintenance(self, **kwargs):
        defaults = {
            'chambre': self.chambre.pk,
            'employe': self.employe.pk,
            'debut': '2027-01-10T08:00:00Z',
            'type': 'corrective',
            'description': 'Fuite robinet',
            'statut': 'planifiee',
            'bloquante': True,
            'cout': '0.00',
        }
        defaults.update(kwargs)
        return self.client.post('/api/maintenances/', defaults, format='json')

    def test_list(self):
        response = self.client.get('/api/maintenances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create(self):
        response = self._post_maintenance()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['statut'], 'planifiee')
        self.assertTrue(response.data['bloquante'])

    def test_create_synchro_chambre_en_maintenance(self):
        """Création maintenance bloquante → chambre passe en 'en_maintenance'."""
        self._post_maintenance(bloquante=True, statut='planifiee')
        self.chambre.refresh_from_db()
        self.assertEqual(self.chambre.etat_physique, Chambre.EtatPhysique.EN_MAINTENANCE)

    def test_create_non_bloquante_ne_change_pas_etat(self):
        """Maintenance non bloquante → état chambre inchangé."""
        self._post_maintenance(bloquante=False)
        self.chambre.refresh_from_db()
        self.assertEqual(self.chambre.etat_physique, Chambre.EtatPhysique.DISPONIBLE)

    def test_create_fin_avant_debut_rejete(self):
        response = self._post_maintenance(
            debut='2027-01-10T10:00:00Z',
            fin='2027-01-10T08:00:00Z',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve(self):
        m = make_maintenance(self.chambre, self.employe)
        response = self.client.get(f'/api/maintenances/{m.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('chambre_numero', response.data)
        self.assertIn('employe_nom_complet', response.data)

    def test_changer_statut_termine_synchro_chambre(self):
        """Fin de maintenance bloquante → chambre repasse en 'disponible'."""
        response = self._post_maintenance(bloquante=True, statut='planifiee')
        m_id = response.data['id_maintenance']
        self.chambre.refresh_from_db()
        self.assertEqual(self.chambre.etat_physique, Chambre.EtatPhysique.EN_MAINTENANCE)

        self.client.patch(
            f'/api/maintenances/{m_id}/changer-statut/',
            {'statut': 'terminee'},
            format='json',
        )
        self.chambre.refresh_from_db()
        self.assertEqual(self.chambre.etat_physique, Chambre.EtatPhysique.DISPONIBLE)

    def test_filtre_par_chambre(self):
        make_maintenance(self.chambre, self.employe)
        response = self.client.get(f'/api/maintenances/?chambre={self.chambre.pk}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data['results']:
            self.assertEqual(item['chambre'], self.chambre.pk)

    def test_filtre_par_statut(self):
        make_maintenance(self.chambre, self.employe, statut='planifiee')
        response = self.client.get('/api/maintenances/?statut=planifiee')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_planifiee_ok(self):
        m = make_maintenance(self.chambre, self.employe, statut='planifiee')
        response = self.client.delete(f'/api/maintenances/{m.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_en_cours_refuse(self):
        m = make_maintenance(self.chambre, self.employe, statut='en_cours')
        response = self.client.delete(f'/api/maintenances/{m.pk}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_historique_chambre(self):
        make_maintenance(self.chambre, self.employe)
        response = self.client.get(
            f'/api/maintenances/chambre/{self.chambre.pk}/historique/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['chambre'], self.chambre.pk)

    def test_disponibilite_chambre_bloquee_par_maintenance(self):
        """La maintenance bloquante doit rendre la chambre indisponible."""
        # Création maintenance bloquante via l'API (déclenche la synchro)
        self._post_maintenance(
            debut='2027-01-10T08:00:00Z',
            fin='2027-01-15T12:00:00Z',
            bloquante=True,
            statut='planifiee',
        )
        # Vérifier disponibilité sur la même période
        response = self.client.get(
            f'/api/chambres/{self.chambre.pk}/disponibilite/',
            {'date_debut': '2027-01-11', 'date_fin': '2027-01-13'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['disponible'])
