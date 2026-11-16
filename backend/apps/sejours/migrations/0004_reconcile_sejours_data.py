"""
Migration de données Phase B : Réconciliation des 15 séjours historiques avec
les réservations et chambres réelles.
"""
from datetime import timedelta
from decimal import Decimal
from django.db import migrations
from django.utils import timezone


RECONCILIATION_SPECS = {
    1: {
        'client': {'nom': 'Tazi', 'prenom': 'Amina', 'piece_identite': 'CIN-A10001', 'telephone': '+212661000001', 'email': 'amina.tazi@example.com'},
        'chambre_id': 1,  # 001, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 2,
    },
    2: {
        'client': {'nom': 'Benjelloun', 'prenom': 'Karim', 'piece_identite': 'CIN-B20002', 'telephone': '+212661000002', 'email': 'karim.benjelloun@example.com'},
        'chambre_id': 8,  # 103, Superieure (650 MAD)
        'tarif_nuit': Decimal('650.00'),
        'nb_occupants': 2,
    },
    3: {
        'client': {'nom': 'Alami', 'prenom': 'Omar', 'piece_identite': 'CIN-C30003', 'telephone': '+212661000003', 'email': 'omar.alami@example.com'},
        'chambre_id': 2,  # 002, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 1,
    },
    4: {
        'client': {'nom': 'Berrada', 'prenom': 'Mehdi', 'piece_identite': 'CIN-D40004', 'telephone': '+212661000004', 'email': 'mehdi.berrada@example.com'},
        'chambre_id': 26,  # 501, Suite Royale (1500 MAD)
        'tarif_nuit': Decimal('1500.00'),
        'nb_occupants': 3,
    },
    5: {
        'client': {'nom': 'Chaoui', 'prenom': 'Fatima Zahra', 'piece_identite': 'CIN-E50005', 'telephone': '+212661000005', 'email': 'fz.chaoui@example.com'},
        'chambre_id': 9,  # 104, Superieure (650 MAD)
        'tarif_nuit': Decimal('650.00'),
        'nb_occupants': 2,
    },
    6: {
        'client': {'nom': 'Kabbaj', 'prenom': 'Youssef', 'piece_identite': 'CIN-F60006', 'telephone': '+212661000006', 'email': 'youssef.kabbaj@example.com'},
        'chambre_id': 11,  # 201, Superieure (650 MAD)
        'tarif_nuit': Decimal('650.00'),
        'nb_occupants': 2,
    },
    7: {
        'client': {'nom': 'Mansouri', 'prenom': 'Leila', 'piece_identite': 'CIN-G70007', 'telephone': '+212661000007', 'email': 'leila.mansouri@example.com'},
        'chambre_id': 16,  # 301, Suite Junior (950 MAD)
        'tarif_nuit': Decimal('950.00'),
        'nb_occupants': 2,
    },
    8: {
        'client': {'nom': 'Bennani', 'prenom': 'Tariq', 'piece_identite': 'CIN-H80008', 'telephone': '+212661000008', 'email': 'tariq.bennani@example.com'},
        'chambre_id': 4,  # 004, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 1,
    },
    9: {
        'client': {'nom': 'Idrissi', 'prenom': 'Sarah', 'piece_identite': 'CIN-I90009', 'telephone': '+212661000009', 'email': 'sarah.idrissi@example.com'},
        'chambre_id': 27,  # 502, Suite Royale (1500 MAD)
        'tarif_nuit': Decimal('1500.00'),
        'nb_occupants': 2,
    },
    10: {
        'client': {'nom': 'Chraibi', 'prenom': 'Nadia', 'piece_identite': 'CIN-J10010', 'telephone': '+212661000010', 'email': 'nadia.chraibi@example.com'},
        'chambre_id': 6,  # 101, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 2,
    },
    11: {
        'client': {'nom': 'Dubois', 'prenom': 'Thomas', 'piece_identite': 'PAS-FRA11011', 'telephone': '+33612345678', 'email': 'thomas.dubois@example.fr'},
        'chambre_id': 12,  # 202, Superieure (650 MAD)
        'tarif_nuit': Decimal('650.00'),
        'nb_occupants': 2,
    },
    12: {
        'client': {'nom': 'Martin', 'prenom': 'Sophie', 'piece_identite': 'PAS-FRA12012', 'telephone': '+33687654321', 'email': 'sophie.martin@example.fr'},
        'chambre_id': 7,  # 102, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 1,
    },
    13: {
        'client': {'nom': 'Smith', 'prenom': 'John', 'piece_identite': 'PAS-GBR13013', 'telephone': '+447911123456', 'email': 'john.smith@example.co.uk'},
        'chambre_id': 28,  # 503, Suite Royale (1500 MAD)
        'tarif_nuit': Decimal('1500.00'),
        'nb_occupants': 2,
    },
    14: {
        'client': {'nom': 'El Fassi', 'prenom': 'Mohamed', 'piece_identite': 'CIN-K14014', 'telephone': '+212661000014', 'email': 'mohamed.elfassi@example.com'},
        'chambre_id': 1,  # 001, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 2,
    },
    15: {
        'client': {'nom': 'Filali', 'prenom': 'Zineb', 'piece_identite': 'CIN-L15015', 'telephone': '+212661000015', 'email': 'zineb.filali@example.com'},
        'chambre_id': 2,  # 002, Standard (450 MAD)
        'tarif_nuit': Decimal('450.00'),
        'nb_occupants': 1,
    },
}


def reconcile_sejours(apps, schema_editor):
    Sejour = apps.get_model('sejours', 'Sejour')
    Reservation = apps.get_model('reservations', 'Reservation')
    ReservationChambre = apps.get_model('reservations', 'ReservationChambre')
    Client = apps.get_model('clients', 'Client')
    Chambre = apps.get_model('chambres', 'Chambre')
    Employe = apps.get_model('employes', 'Employe')

    employe_defaut = Employe.objects.filter(statut='ACTIF').first()
    if not employe_defaut:
        employe_defaut = Employe.objects.first()

    for sejour in Sejour.objects.all().order_by('id_sejour'):
        # Si le séjour a déjà une réservation et une chambre valides, on ne le touche pas
        if sejour.reservation_id and sejour.chambre_id:
            continue

        spec = RECONCILIATION_SPECS.get(sejour.id_sejour)
        if not spec:
            raise ValueError(
                f"Séjour #{sejour.id_sejour} non répertorié dans les spécifications de réconciliation. "
                "Réconciliation manuelle requise."
            )

        # 1. Créer ou récupérer le client
        c_data = spec['client']
        client, _ = Client.objects.get_or_create(
            piece_identite=c_data['piece_identite'],
            defaults={
                'nom': c_data['nom'],
                'prenom': c_data['prenom'],
                'telephone': c_data['telephone'],
                'email': c_data['email'],
                'nationalite': 'Marocaine' if c_data['piece_identite'].startswith('CIN') else 'Étrangère',
            }
        )

        # 2. Déterminer les dates prévues et le statut cible de la réservation
        arr_date = sejour.arrivee_reelle.date() if sejour.arrivee_reelle else timezone.localdate()
        if sejour.depart_reel:
            dep_date = sejour.depart_reel.date()
        else:
            dep_date = arr_date + timedelta(days=3)

        if sejour.statut_sejour == 'TERMINE':
            statut_cible = 'TERMINEE'
        elif sejour.statut_sejour == 'ANNULE':
            statut_cible = 'ANNULEE'
        else:
            statut_cible = 'CONFIRMEE'

        nuits = max((dep_date - arr_date).days, 1)
        montant_estime = Decimal(nuits) * spec['tarif_nuit']

        # 3. Créer la réservation initialement au statut 'CONFIRMEE'
        # (Nécessaire pour satisfaire le trigger MySQL trg_resch_bi qui interdit l'ajout de chambre sur une résa annulée/terminée)
        reservation = Reservation.objects.create(
            client=client,
            employe=employe_defaut,
            statut_reservation='CONFIRMEE',
            nb_personnes_total=spec['nb_occupants'],
            montant_estime=montant_estime,
        )

        # 4. Créer la ligne ReservationChambre
        chambre = Chambre.objects.get(pk=spec['chambre_id'])
        ReservationChambre.objects.create(
            reservation=reservation,
            chambre=chambre,
            date_arrivee_prevue=arr_date,
            date_depart_prevue=dep_date,
            nb_occupants=spec['nb_occupants'],
            tarif_nuit_applique=spec['tarif_nuit'],
        )

        # 5. Si le statut cible est TERMINEE ou ANNULEE, faire évoluer le statut depuis CONFIRMEE
        if statut_cible != 'CONFIRMEE':
            reservation.statut_reservation = statut_cible
            reservation.save(update_fields=['statut_reservation'])

        # 6. Associer le séjour à la réservation et à la chambre
        sejour.reservation = reservation
        sejour.chambre = chambre
        if sejour.est_archive and not sejour.date_archivage:
            sejour.date_archivage = sejour.depart_reel
        sejour.save(update_fields=['reservation', 'chambre', 'date_archivage'])

    # Phase C : Validation post-réconciliation
    sejours_invalides = Sejour.objects.filter(reservation__isnull=True) | Sejour.objects.filter(chambre__isnull=True)
    if sejours_invalides.exists():
        raise ValueError(f"Échec de validation : {sejours_invalides.count()} séjours ont des clés étrangères nulles.")


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0002_alter_client_options_alter_client_email_and_more'),
        ('reservations', '0001_initial'),
        ('reservations', '0002_triggers'),
        ('chambres', '0001_initial'),
        ('employes', '0001_initial'),
        ('sejours', '0003_alter_sejour_options_and_more'),
    ]

    operations = [
        migrations.RunPython(reconcile_sejours, reverse_code=migrations.RunPython.noop),
    ]
