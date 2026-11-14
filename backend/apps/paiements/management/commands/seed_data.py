from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.services.models import Service, ConsommationService
from apps.employes.models import Employe
from apps.paiements.models import Paiement
from apps.stubs.models import Sejour


class Command(BaseCommand):
    help = "Initialise le jeu de données de test (8 services, 10 employés, séjours, consommations et paiements)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Démarrage du peuplement des données (seed_data)..."))

        # 1. Services (8 services variés)
        services_data = [
            {
                'nom': "Petit-déjeuner Buffet Continental",
                'type_service': Service.TypeService.RESTAURATION,
                'prix_unitaire': Decimal('120.00'),
                'description': "Buffet complet à volonté avec viennoiseries fraîches, jus pressés et spécialités marocaines.",
            },
            {
                'nom': "Dîner Gastronomique Marocain",
                'type_service': Service.TypeService.RESTAURATION,
                'prix_unitaire': Decimal('350.00'),
                'description': "Menu dégustation 4 plats (pastilla, tajine d'agneau aux pruneaux, couscous royal, cornes de gazelle).",
            },
            {
                'nom': "Massage Relaxant aux Huiles d'Argan (50 min)",
                'type_service': Service.TypeService.SPA,
                'prix_unitaire': Decimal('500.00'),
                'description': "Soin corps relaxant complet aux huiles essentielles bio et argan du terroir.",
            },
            {
                'nom': "Hammam Traditionnel & Gommage au Savon Noir",
                'type_service': Service.TypeService.SPA,
                'prix_unitaire': Decimal('280.00'),
                'description': "Rituel de purification avec gommage au gant kessa et enveloppement au ghassoul.",
            },
            {
                'nom': "Blanchisserie & Repassage Express (1 pièce)",
                'type_service': Service.TypeService.BLANCHISSERIE,
                'prix_unitaire': Decimal('80.00'),
                'description': "Lavage et repassage professionnel sous 3 heures maximum.",
            },
            {
                'nom': "Transfert Navette VIP Aéroport",
                'type_service': Service.TypeService.TRANSPORT,
                'prix_unitaire': Decimal('300.00'),
                'description': "Véhicule climatisé avec chauffeur privé entre l'hôtel et l'aéroport.",
            },
            {
                'nom': "Pack Minibar Premium",
                'type_service': Service.TypeService.MINIBAR,
                'prix_unitaire': Decimal('150.00'),
                'description': "Sélection de sodas, eaux minérales de luxe, fruits secs et chocolats fins.",
            },
            {
                'nom': "Location Salle de Conférence / Réunion (2h)",
                'type_service': Service.TypeService.AUTRE,
                'prix_unitaire': Decimal('450.00'),
                'description': "Espace d'affaires équipé de vidéoprojecteur HD, paperboard et wifi haute vitesse.",
            },
        ]

        created_services = []
        for s_data in services_data:
            service, created = Service.objects.update_or_create(
                nom=s_data['nom'],
                defaults=s_data
            )
            created_services.append(service)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(created_services)} services initialisés avec succès."))

        # 2. Employés (10 employés couvrant les différents postes et statuts)
        employes_data = [
            {
                'nom': "Bennani",
                'prenom': "Karima",
                'poste': Employe.Poste.MANAGER,
                'telephone': "+212 661 112233",
                'email': "karima.bennani@hotel-maroc.ma",
                'date_embauche': date(2021, 5, 10),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "El Amrani",
                'prenom': "Yassine",
                'poste': Employe.Poste.RECEPTIONNISTE,
                'telephone': "+212 662 223344",
                'email': "yassine.amrani@hotel-maroc.ma",
                'date_embauche': date(2022, 9, 1),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "Chraibi",
                'prenom': "Amina",
                'poste': Employe.Poste.RECEPTIONNISTE,
                'telephone': "+212 663 334455",
                'email': "amina.chraibi@hotel-maroc.ma",
                'date_embauche': date(2023, 1, 15),
                'statut': Employe.Statut.EN_CONGE,
            },
            {
                'nom': "Idrissi",
                'prenom': "Fatima Zahra",
                'poste': Employe.Poste.FEMME_DE_CHAMBRE,
                'telephone': "+212 664 445566",
                'email': "fatima.idrissi@hotel-maroc.ma",
                'date_embauche': date(2022, 3, 20),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "Tazi",
                'prenom': "Khadija",
                'poste': Employe.Poste.FEMME_DE_CHAMBRE,
                'telephone': "+212 665 556677",
                'email': "khadija.tazi@hotel-maroc.ma",
                'date_embauche': date(2023, 6, 1),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "Benjelloun",
                'prenom': "Omar",
                'poste': Employe.Poste.MAINTENANCE,
                'telephone': "+212 666 667788",
                'email': "omar.benjelloun@hotel-maroc.ma",
                'date_embauche': date(2020, 11, 12),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "Alaoui",
                'prenom': "Mehdi",
                'poste': Employe.Poste.RESTAURATION,
                'telephone': "+212 667 778899",
                'email': "mehdi.alaoui@hotel-maroc.ma",
                'date_embauche': date(2022, 7, 10),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "Alami",
                'prenom': "Soukaina",
                'poste': Employe.Poste.RESTAURATION,
                'telephone': "+212 668 889900",
                'email': "soukaina.alami@hotel-maroc.ma",
                'date_embauche': date(2021, 2, 1),
                'statut': Employe.Statut.INACTIF,
            },
            {
                'nom': "Berrada",
                'prenom': "Tarik",
                'poste': Employe.Poste.COMPTABLE,
                'telephone': "+212 669 990011",
                'email': "tarik.berrada@hotel-maroc.ma",
                'date_embauche': date(2020, 4, 5),
                'statut': Employe.Statut.ACTIF,
            },
            {
                'nom': "Mansouri",
                'prenom': "Nabil",
                'poste': Employe.Poste.AUTRE,
                'telephone': "+212 660 001122",
                'email': "nabil.mansouri@hotel-maroc.ma",
                'date_embauche': date(2023, 10, 1),
                'statut': Employe.Statut.ACTIF,
            },
        ]

        created_employes = []
        for e_data in employes_data:
            employe, _ = Employe.objects.update_or_create(
                email=e_data['email'],
                defaults=e_data
            )
            created_employes.append(employe)

        self.stdout.write(self.style.SUCCESS(f"✓ {len(created_employes)} employés initialisés avec succès."))

        # 3. Séjours de test (Stubs)
        now = timezone.now()
        sejour1, _ = Sejour.objects.get_or_create(
            id_sejour=1,
            defaults={
                'arrivee_reelle': now - timedelta(days=2),
                'depart_reel': now + timedelta(days=3),
                'statut_sejour': 'EN_COURS',
                'est_archive': False,
            }
        )
        sejour2, _ = Sejour.objects.get_or_create(
            id_sejour=2,
            defaults={
                'arrivee_reelle': now - timedelta(days=1),
                'depart_reel': now + timedelta(days=4),
                'statut_sejour': 'EN_COURS',
                'est_archive': False,
            }
        )
        sejour3, _ = Sejour.objects.get_or_create(
            id_sejour=3,
            defaults={
                'arrivee_reelle': now - timedelta(days=10),
                'depart_reel': now - timedelta(days=5),
                'statut_sejour': 'TERMINE',
                'est_archive': False,
            }
        )
        sejour4, _ = Sejour.objects.get_or_create(
            id_sejour=4,
            defaults={
                'arrivee_reelle': now - timedelta(days=30),
                'depart_reel': now - timedelta(days=25),
                'statut_sejour': 'TERMINE',
                'est_archive': True,
            }
        )

        self.stdout.write(self.style.SUCCESS("✓ 4 séjours de test (stubs) créés."))

        # 4. Consommations sur séjours actifs (Sejour 1 et Sejour 2)
        # Nettoyer les consommations précédentes pour reproductibilité
        ConsommationService.objects.filter(sejour__in=[sejour1, sejour2]).delete()

        conso1 = ConsommationService.objects.create(
            service=created_services[0],  # Petit-déj 120.00
            sejour=sejour1,
            quantite=2,
            prix_applique=created_services[0].prix_unitaire,
            date_consommation=now - timedelta(days=1, hours=4)
        )
        conso2 = ConsommationService.objects.create(
            service=created_services[2],  # Massage Argan 500.00
            sejour=sejour1,
            quantite=1,
            prix_applique=created_services[2].prix_unitaire,
            date_consommation=now - timedelta(hours=6)
        )
        conso3 = ConsommationService.objects.create(
            service=created_services[6],  # Minibar 150.00
            sejour=sejour1,
            quantite=2,
            prix_applique=created_services[6].prix_unitaire,
            date_consommation=now - timedelta(hours=2)
        )
        # Total séjour 1 = (2*120) + (1*500) + (2*150) = 240 + 500 + 300 = 1040.00 MAD

        conso4 = ConsommationService.objects.create(
            service=created_services[1],  # Dîner marocain 350.00
            sejour=sejour2,
            quantite=2,
            prix_applique=created_services[1].prix_unitaire,
            date_consommation=now - timedelta(hours=18)
        )
        conso5 = ConsommationService.objects.create(
            service=created_services[5],  # Navette VIP 300.00
            sejour=sejour2,
            quantite=1,
            prix_applique=created_services[5].prix_unitaire,
            date_consommation=now - timedelta(days=1)
        )
        # Total séjour 2 = (2*350) + (1*300) = 1000.00 MAD

        self.stdout.write(self.style.SUCCESS("✓ 5 consommations de services enregistrées."))

        # 5. Paiements (sur Sejour 1 et Sejour 2)
        # Nettoyer les paiements précédents
        Paiement.objects.filter(sejour__in=[sejour1, sejour2]).delete()

        emp_actif = created_employes[0]  # Karima (Manager, ACTIF)
        emp_recep = created_employes[1]  # Yassine (Réceptionniste, ACTIF)

        # Paiement 1 sur Sejour 1 : Validé (carte bancaire, 500 MAD)
        p1 = Paiement.objects.create(
            sejour=sejour1,
            employe=emp_actif,
            montant=Decimal('500.00'),
            mode_paiement=Paiement.ModePaiement.CARTE_BANCAIRE,
            statut=Paiement.StatutPaiement.VALIDE,
            date_paiement=now - timedelta(hours=5),
            reference_paiement=f"PAY-{now.strftime('%Y%m%d')}-0001"
        )

        # Paiement 2 sur Sejour 1 : En attente (espèces, 200 MAD)
        p2 = Paiement.objects.create(
            sejour=sejour1,
            employe=emp_recep,
            montant=Decimal('200.00'),
            mode_paiement=Paiement.ModePaiement.ESPECES,
            statut=Paiement.StatutPaiement.EN_ATTENTE,
            date_paiement=now - timedelta(hours=1),
            reference_paiement=f"PAY-{now.strftime('%Y%m%d')}-0002"
        )

        # Paiement 3 sur Sejour 2 : Validé (virement, 600 MAD)
        p3 = Paiement.objects.create(
            sejour=sejour2,
            employe=emp_actif,
            montant=Decimal('600.00'),
            mode_paiement=Paiement.ModePaiement.VIREMENT,
            statut=Paiement.StatutPaiement.VALIDE,
            date_paiement=now - timedelta(hours=12),
            reference_paiement=f"PAY-{now.strftime('%Y%m%d')}-0003"
        )

        self.stdout.write(self.style.SUCCESS("✓ 3 paiements de démonstration enregistrés."))
        self.stdout.write(self.style.SUCCESS("==> Jeu de données de test complet injecté avec succès !"))
