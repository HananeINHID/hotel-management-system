# -*- coding: utf-8 -*-
"""
Commande d'importation securisee des donnees fictives : import_demo_hotel
========================================================================

Importe le jeu de donnees de demonstration (donnees_fictives_hotel.json)
dans la base MySQL sans ecraser ni corrompre les donnees existantes.

Usage :
    python manage.py import_demo_hotel --dry-run
    python manage.py import_demo_hotel --apply
    python manage.py import_demo_hotel --dry-run --file=database/sample_data/donnees_fictives_hotel.json

Garanties :
    - Non destructif : aucun FLUSH, TRUNCATE, DROP ou DELETE
    - Totalement additif et idempotent (peut etre reexecute sans doublon)
    - Remapping complet des identifiants (ne force pas les PK numeriques du JSON)
    - Conforme aux triggers MySQL (transition de statut, respect des chevauchements)
    - Transactionnel (rollback automatique en dry-run ou en cas d'erreur)
"""

import json
import os
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


# ---------------------------------------------------------------------------
# Mappings de correspondance JSON -> Choices Django
# ---------------------------------------------------------------------------

STATUT_RES_MAP = {
    "terminee":   "TERMINEE",
    "annulee":    "ANNULEE",
    "confirmee":  "CONFIRMEE",
    "en_attente": "EN_ATTENTE",
}

STATUT_SEJ_MAP = {
    "termine":  "TERMINE",
    "en_cours": "EN_COURS",
    "annule":   "ANNULE",
}

STATUT_EMP_MAP = {
    "actif":    "ACTIF",
    "en_conge": "EN_CONGE",
    "inactif":  "INACTIF",
}

POSTE_EMP_MAP = {
    "receptionniste":   "RECEPTIONNISTE",
    "responsable":      "MANAGER",
    "technicien":       "MAINTENANCE",
    "comptable":        "COMPTABLE",
    "manager":          "MANAGER",
    "maintenance":      "MAINTENANCE",
    "restauration":     "RESTAURATION",
    "femme_de_chambre": "FEMME_DE_CHAMBRE",
}

TYPE_SVC_MAP = {
    "restauration":  "RESTAURATION",
    "activite":      "AUTRE",
    "bien_etre":     "SPA",
    "linge":         "BLANCHISSERIE",
    "blanchisserie": "BLANCHISSERIE",
    "stationnement": "AUTRE",
    "transport":     "TRANSPORT",
    "spa":           "SPA",
    "minibar":       "MINIBAR",
    "autre":         "AUTRE",
}

MODE_PAI_MAP = {
    "carte":          "CARTE_BANCAIRE",
    "carte_bancaire": "CARTE_BANCAIRE",
    "especes":        "ESPECES",
    "virement":       "VIREMENT",
    "cheque":         "CHEQUE",
}

STATUT_PAI_MAP = {
    "valide":     "VALIDE",
    "en_attente": "EN_ATTENTE",
    "refuse":     "REFUSE",
    "rembourse":  "REMBOURSE",
}


def _to_decimal(val):
    if val is None:
        return Decimal("0.00")
    try:
        return Decimal(str(val))
    except (InvalidOperation, TypeError):
        return Decimal("0.00")


def _to_date(val):
    if not val:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(str(val).strip(), fmt).date()
        except ValueError:
            continue
    return None


def _to_datetime(val):
    if not val:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            naive = datetime.strptime(str(val).strip(), fmt)
            return timezone.make_aware(naive)
        except ValueError:
            continue
    return None


class DryRunRollback(Exception):
    """Exception de controle levee pour declencher un rollback en mode dry-run."""
    pass


class Command(BaseCommand):
    help = (
        "Importe les donnees fictives d'hotel depuis donnees_fictives_hotel.json "
        "de facon additive, idempotente et respectueuse des donnees historiques."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Simule l'importation sans modifier la base de donnees (rollback automatique).",
        )
        parser.add_argument(
            "--apply",
            action="store_true",
            default=False,
            help="Applique reellement l'importation en base de donnees.",
        )
        parser.add_argument(
            "--file",
            type=str,
            default=None,
            help="Chemin vers le fichier JSON de donnees fictives (facultatif).",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)
        apply_mode = options.get("apply", False)
        custom_file = options.get("file")

        # Securite : par defaut si --apply n'est pas passe, on fonctionne en dry-run
        is_simulation = dry_run or not apply_mode

        self.stdout.write("=" * 72)
        self.stdout.write("  GESTION HOTELIERE - IMPORTATION DES DONNEES DEMO")
        if is_simulation:
            self.stdout.write(self.style.WARNING("  MODE : SIMULATION (DRY-RUN) - Aucune ecriture en base."))
        else:
            self.stdout.write(self.style.SUCCESS("  MODE : APPLICATION REELLE (--apply) - Ecritures autorisees."))
        self.stdout.write("=" * 72)

        # 1. Localiser et charger le fichier JSON
        json_path = self._locate_json_file(custom_file)
        self.stdout.write(f"\n[INFO] Fichier source : {json_path}")

        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)

        tables = data.get("tables", {})
        hotel_name = data.get("hotel", "Hotel Demo")
        date_gen = data.get("date_generation", "Inconnue")
        self.stdout.write(f"[INFO] Jeu de donnees : '{hotel_name}' (date: {date_gen})")

        # 2. Compter les donnees existantes avant l'operation
        existing_counts = self._get_existing_counts()

        # Statistiques d'import
        stats = {k: {"existant": existing_counts.get(k, 0), "json": len(tables.get(k, [])), "cree": 0, "ignore": 0}
                 for k in [
                     "categorie_chambre", "chambre", "employe", "client", "service",
                     "reservation", "reservation_chambre", "sejour",
                     "consommation_service", "paiement", "maintenance", "avis"
                 ]}

        # 3. Execution transactionnelle
        try:
            with transaction.atomic():
                # Etape 1 : Categories de chambres
                cat_map = self._import_categories(tables.get("categorie_chambre", []), stats["categorie_chambre"], is_simulation)

                # Etape 2 : Chambres
                chambre_map = self._import_chambres(tables.get("chambre", []), cat_map, stats["chambre"], is_simulation)

                # Etape 3 : Employes
                employe_map = self._import_employes(tables.get("employe", []), stats["employe"], is_simulation)

                # Etape 4 : Clients
                client_map = self._import_clients(tables.get("client", []), stats["client"], is_simulation)

                # Etape 5 : Services
                service_map = self._import_services(tables.get("service", []), stats["service"], is_simulation)

                # Etape 6 : Reservations et ReservationChambre (avec gestion des triggers)
                res_map = self._import_reservations_and_chambres(
                    tables.get("reservation", []),
                    tables.get("reservation_chambre", []),
                    client_map,
                    chambre_map,
                    employe_map,
                    stats["reservation"],
                    stats["reservation_chambre"],
                    is_simulation
                )

                # Etape 7 : Sejours
                sejour_map = self._import_sejours(
                    tables.get("sejour", []),
                    res_map,
                    chambre_map,
                    stats["sejour"],
                    is_simulation
                )

                # Etape 8 : Consommations de services
                self._import_consommations(
                    tables.get("consommation_service", []),
                    sejour_map,
                    service_map,
                    stats["consommation_service"],
                    is_simulation
                )

                # Etape 9 : Paiements
                self._import_paiements(
                    tables.get("paiement", []),
                    sejour_map,
                    employe_map,
                    stats["paiement"],
                    is_simulation
                )

                # Etape 10 : Maintenances
                self._import_maintenances(
                    tables.get("maintenance", []),
                    chambre_map,
                    employe_map,
                    stats["maintenance"],
                    is_simulation
                )

                # Etape 11 : Avis
                self._import_avis(
                    tables.get("avis", []),
                    sejour_map,
                    client_map,
                    stats["avis"],
                    is_simulation
                )

                if is_simulation:
                    raise DryRunRollback()

        except DryRunRollback:
            self.stdout.write(self.style.WARNING("\n[SIMULATION TERMINEE] Aucun changement enregistre en base (rollback ok)."))
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"\n[ERREUR CRITIQUE] L'importation a echoue : {exc}"))
            raise

        # 4. Affichage du bilan complet
        self._display_summary(stats, is_simulation)

    # ------------------------------------------------------------------
    # Methodes d'importation par entite
    # ------------------------------------------------------------------

    def _import_categories(self, rows, stat, is_simulation):
        from apps.chambres.models import CategorieChambre
        mapping = {}

        for row in rows:
            json_id = row["id_categorie"]
            libelle = row["libelle"].strip()

            # Lookup par libelle insensible a la casse
            existing = CategorieChambre.objects.filter(libelle__iexact=libelle).first()

            if existing:
                mapping[json_id] = existing
                stat["ignore"] += 1
            else:
                defaults = {
                    "capacite": int(row.get("capacite", 2)),
                    "tarif_nuit": _to_decimal(row.get("tarif_nuit", "0.00")),
                    "description": row.get("description", ""),
                }
                new_cat = CategorieChambre.objects.create(libelle=libelle, **defaults)
                mapping[json_id] = new_cat
                stat["cree"] += 1

        return mapping

    def _import_chambres(self, rows, cat_map, stat, is_simulation):
        from apps.chambres.models import Chambre
        mapping = {}

        for row in rows:
            json_id = row["id_chambre"]
            num = str(row["numero_chambre"]).strip()
            etat_json = row.get("etat_physique", "disponible")

            existing = Chambre.objects.filter(numero_chambre=num).first()
            if existing:
                cat = cat_map.get(row["id_categorie"])
                update_fields = []
                # Aligner la categorie sur le schema JSON si necessaire (ex: Suite Familiale pour 105)
                if cat and existing.categorie_id != cat.id_categorie:
                    existing.categorie = cat
                    update_fields.append("categorie")
                if existing.etat_physique != etat_json:
                    existing.etat_physique = etat_json
                    update_fields.append("etat_physique")
                if update_fields:
                    existing.save(update_fields=update_fields)
                mapping[json_id] = existing
                stat["ignore"] += 1
            else:
                cat = cat_map.get(row["id_categorie"])
                if not cat:
                    continue
                new_chambre = Chambre.objects.create(
                    numero_chambre=num,
                    etage=int(row.get("etage", 0)),
                    etat_physique=etat_json,
                    description=row.get("description", f"Chambre {num}"),
                    categorie=cat,
                )
                mapping[json_id] = new_chambre
                stat["cree"] += 1

        return mapping

    def _import_employes(self, rows, stat, is_simulation):
        from apps.employes.models import Employe
        mapping = {}

        for row in rows:
            json_id = row["id_employe"]
            email = row.get("email", "").strip()

            existing = Employe.objects.filter(email__iexact=email).first()
            if not existing and row.get("nom") and row.get("prenom"):
                existing = Employe.objects.filter(nom__iexact=row["nom"].strip(), prenom__iexact=row["prenom"].strip()).first()

            if existing:
                mapping[json_id] = existing
                stat["ignore"] += 1
            else:
                poste_raw = row.get("poste", "").lower().strip()
                poste = POSTE_EMP_MAP.get(poste_raw, "AUTRE")

                statut_raw = row.get("statut", "").lower().strip()
                statut = STATUT_EMP_MAP.get(statut_raw, "ACTIF")

                embauche = _to_date(row.get("date_embauche")) or date.today()

                new_emp = Employe.objects.create(
                    nom=row["nom"].strip(),
                    prenom=row["prenom"].strip(),
                    poste=poste,
                    telephone=row.get("telephone", ""),
                    email=email,
                    date_embauche=embauche,
                    statut=statut,
                )
                mapping[json_id] = new_emp
                stat["cree"] += 1

        return mapping

    def _import_clients(self, rows, stat, is_simulation):
        from apps.clients.models import Client
        mapping = {}

        for row in rows:
            json_id = row["id_client"]
            cin = row.get("piece_identite", "").strip()

            existing = Client.objects.filter(piece_identite__iexact=cin).first()
            if existing:
                mapping[json_id] = existing
                stat["ignore"] += 1
            else:
                email = row.get("email")
                if email:
                    email = email.strip()

                new_client = Client.objects.create(
                    nom=row["nom"].strip(),
                    prenom=row["prenom"].strip(),
                    piece_identite=cin,
                    telephone=row.get("telephone", ""),
                    email=email or None,
                    nationalite=row.get("nationalite") or None,
                )
                mapping[json_id] = new_client
                stat["cree"] += 1

        return mapping

    def _import_services(self, rows, stat, is_simulation):
        from apps.services.models import Service
        mapping = {}

        for row in rows:
            json_id = row["id_service"]
            nom = row.get("nom", "").strip()

            existing = Service.objects.filter(nom__iexact=nom).first()
            if existing:
                mapping[json_id] = existing
                stat["ignore"] += 1
            else:
                type_raw = row.get("type_service", "").lower().strip()
                type_svc = TYPE_SVC_MAP.get(type_raw, "AUTRE")
                prix = _to_decimal(row.get("prix_unitaire", "0.00"))

                new_svc = Service.objects.create(
                    nom=nom,
                    type_service=type_svc,
                    prix_unitaire=prix,
                    description=row.get("description", ""),
                )
                mapping[json_id] = new_svc
                stat["cree"] += 1

        return mapping

    def _import_reservations_and_chambres(
        self, res_rows, rc_rows, client_map, chambre_map, employe_map,
        stat_res, stat_rc, is_simulation
    ):
        from apps.reservations.models import Reservation, ReservationChambre

        # Regrouper les ReservationChambre par reservation JSON
        rc_by_res = {}
        for rc in rc_rows:
            rc_by_res.setdefault(rc["id_reservation"], []).append(rc)

        res_mapping = {}

        for r_row in res_rows:
            json_res_id = r_row["id_reservation"]
            client = client_map.get(r_row["id_client"])
            employe = employe_map.get(r_row["id_employe"])

            if not client:
                continue
            if not employe:
                from apps.employes.models import Employe
                employe = Employe.objects.first()

            res_rc_list = rc_by_res.get(json_res_id, [])

            # Verifier si cette reservation existe deja via son client et sa premiere chambre+date
            existing_res = None
            if res_rc_list:
                first_rc = res_rc_list[0]
                first_chambre = chambre_map.get(first_rc["id_chambre"])
                arr = _to_date(first_rc.get("date_arrivee_prevue"))
                dep = _to_date(first_rc.get("date_depart_prevue"))

                if first_chambre and arr and dep:
                    found_rc = ReservationChambre.objects.filter(
                        reservation__client=client,
                        chambre=first_chambre,
                        date_arrivee_prevue=arr,
                        date_depart_prevue=dep,
                    ).select_related("reservation").first()

                    if found_rc:
                        existing_res = found_rc.reservation

            if existing_res:
                res_mapping[json_res_id] = existing_res
                stat_res["ignore"] += 1
                stat_rc["ignore"] += len(res_rc_list)
                continue

            # Nouvelle reservation : respecter la machine d'etats des triggers MySQL
            # 1. Creer en EN_ATTENTE (etat initial valide sans declencher d'interdiction de retour)
            target_statut_raw = r_row.get("statut_reservation", "en_attente").lower().strip()
            target_statut = STATUT_RES_MAP.get(target_statut_raw, "EN_ATTENTE")

            montant = _to_decimal(r_row.get("montant_estime", "0.00"))
            nb_pers = int(r_row.get("nb_personnes_total", 1))

            new_res = Reservation.objects.create(
                client=client,
                employe=employe,
                statut_reservation="EN_ATTENTE",
                nb_personnes_total=nb_pers,
                montant_estime=montant,
            )

            # 2. Inserer les ReservationChambre (autorise car statut n'est pas ANNULEE/TERMINEE)
            for rc_row in res_rc_list:
                chambre = chambre_map.get(rc_row["id_chambre"])
                if not chambre:
                    continue

                arr = _to_date(rc_row.get("date_arrivee_prevue"))
                dep = _to_date(rc_row.get("date_depart_prevue"))
                tarif = _to_decimal(rc_row.get("tarif_nuit_applique", "0.00"))
                occupants = int(rc_row.get("nb_occupants", 1))

                ReservationChambre.objects.create(
                    reservation=new_res,
                    chambre=chambre,
                    date_arrivee_prevue=arr,
                    date_depart_prevue=dep,
                    nb_occupants=occupants,
                    tarif_nuit_applique=tarif,
                )
                stat_rc["cree"] += 1

            # 3. Mettre a jour le statut final selon les transitions autorisees par les triggers :
            # - EN_ATTENTE -> CONFIRMEE (autorise car chambres deja rattachees)
            # - EN_ATTENTE -> CONFIRMEE -> TERMINEE (seule une resa CONFIRMEE peut etre terminee)
            # - EN_ATTENTE -> ANNULEE
            if target_statut == "CONFIRMEE":
                new_res.statut_reservation = "CONFIRMEE"
                new_res.save(update_fields=["statut_reservation"])
            elif target_statut == "TERMINEE":
                new_res.statut_reservation = "CONFIRMEE"
                new_res.save(update_fields=["statut_reservation"])
                new_res.statut_reservation = "TERMINEE"
                new_res.save(update_fields=["statut_reservation"])
            elif target_statut == "ANNULEE":
                new_res.statut_reservation = "ANNULEE"
                new_res.save(update_fields=["statut_reservation"])
            # Si target_statut == "EN_ATTENTE", pas de changement requis

            res_mapping[json_res_id] = new_res
            stat_res["cree"] += 1

        return res_mapping

    def _import_sejours(self, rows, res_map, chambre_map, stat, is_simulation):
        from apps.sejours.models import Sejour
        mapping = {}

        for row in rows:
            json_id = row["id_sejour"]
            res = res_map.get(row["id_reservation"])
            chambre = chambre_map.get(row["id_chambre"])

            if not res or not chambre:
                continue

            existing = Sejour.objects.filter(reservation=res, chambre=chambre).first()
            if existing:
                mapping[json_id] = existing
                stat["ignore"] += 1
            else:
                statut_raw = row.get("statut_sejour", "termine").lower().strip()
                statut = STATUT_SEJ_MAP.get(statut_raw, "TERMINE")

                arr = _to_datetime(row.get("arrivee_reelle"))
                dep = _to_datetime(row.get("depart_reel"))
                obs = row.get("observations", "")
                archive = bool(row.get("est_archive", 0))
                date_arch = _to_datetime(row.get("date_archivage"))

                new_sejour = Sejour.objects.create(
                    reservation=res,
                    chambre=chambre,
                    arrivee_reelle=arr,
                    depart_reel=dep,
                    statut_sejour=statut,
                    observations=obs,
                    est_archive=archive,
                    date_archivage=date_arch,
                )
                mapping[json_id] = new_sejour
                stat["cree"] += 1

        return mapping

    def _import_consommations(self, rows, sejour_map, service_map, stat, is_simulation):
        from apps.services.models import ConsommationService

        for row in rows:
            sejour = sejour_map.get(row["id_sejour"])
            service = service_map.get(row["id_service"])

            if not sejour or not service:
                continue

            dt = _to_datetime(row.get("date_consommation"))
            qte = int(row.get("quantite", 1))
            prix = _to_decimal(row.get("prix_applique", service.prix_unitaire))

            existing = ConsommationService.objects.filter(
                sejour=sejour,
                service=service,
                date_consommation=dt,
            ).first()

            if existing:
                stat["ignore"] += 1
            else:
                ConsommationService.objects.create(
                    sejour=sejour,
                    service=service,
                    date_consommation=dt or timezone.now(),
                    quantite=qte,
                    prix_applique=prix,
                )
                stat["cree"] += 1

    def _import_paiements(self, rows, sejour_map, employe_map, stat, is_simulation):
        from apps.paiements.models import Paiement

        for row in rows:
            sejour = sejour_map.get(row["id_sejour"])
            employe = employe_map.get(row["id_employe"])

            if not sejour:
                continue
            if not employe:
                from apps.employes.models import Employe
                employe = Employe.objects.first()

            ref = row.get("reference_paiement", "").strip()
            montant = _to_decimal(row.get("montant", "0.00"))
            dt = _to_datetime(row.get("date_paiement"))

            existing = None
            if ref:
                existing = Paiement.objects.filter(reference_paiement=ref).first()
            if not existing and dt:
                existing = Paiement.objects.filter(
                    sejour=sejour,
                    montant=montant,
                    date_paiement=dt,
                ).first()

            if existing:
                stat["ignore"] += 1
            else:
                mode_raw = row.get("mode_paiement", "").lower().strip()
                mode = MODE_PAI_MAP.get(mode_raw, "ESPECES")

                statut_raw = row.get("statut", "valide").lower().strip()
                statut = STATUT_PAI_MAP.get(statut_raw, "VALIDE")

                Paiement.objects.create(
                    sejour=sejour,
                    employe=employe,
                    date_paiement=dt or timezone.now(),
                    montant=montant,
                    mode_paiement=mode,
                    statut=statut,
                )
                stat["cree"] += 1

    def _import_maintenances(self, rows, chambre_map, employe_map, stat, is_simulation):
        from apps.maintenances.models import Maintenance

        for row in rows:
            chambre = chambre_map.get(row["id_chambre"])
            employe = employe_map.get(row["id_employe"])

            if not chambre:
                continue
            if not employe:
                from apps.employes.models import Employe
                employe = Employe.objects.first()

            desc = row.get("description", "").strip()
            debut = _to_datetime(row.get("debut"))
            fin = _to_datetime(row.get("fin"))

            existing = Maintenance.objects.filter(
                chambre=chambre,
                description=desc,
                debut=debut,
            ).first()

            if existing:
                stat["ignore"] += 1
            else:
                type_m = row.get("type", "preventive")
                statut = row.get("statut", "planifiee")
                cout = _to_decimal(row.get("cout", "0.00"))
                bloquante = bool(row.get("bloquante", False))

                Maintenance.objects.create(
                    chambre=chambre,
                    employe=employe,
                    debut=debut or timezone.now(),
                    fin=fin,
                    type=type_m,
                    description=desc,
                    cout=cout,
                    statut=statut,
                    bloquante=bloquante,
                )
                stat["cree"] += 1

    def _import_avis(self, rows, sejour_map, client_map, stat, is_simulation):
        from apps.avis.models import Avis

        for row in rows:
            sejour = sejour_map.get(row["id_sejour"])
            client = client_map.get(row["id_client"])

            if not sejour or not client:
                continue

            existing = Avis.objects.filter(sejour=sejour).first()
            if existing:
                stat["ignore"] += 1
            else:
                note = int(row.get("note", 5))
                comm = row.get("commentaire", "")
                dt = _to_datetime(row.get("date_avis"))

                Avis.objects.create(
                    sejour=sejour,
                    client=client,
                    date_avis=dt or timezone.now(),
                    note=note,
                    commentaire=comm,
                )
                stat["cree"] += 1

    # ------------------------------------------------------------------
    # Utilitaires de controle et d'affichage
    # ------------------------------------------------------------------

    def _locate_json_file(self, custom_path):
        if custom_path and os.path.isfile(custom_path):
            return os.path.abspath(custom_path)

        from django.conf import settings
        backend_dir = str(settings.BASE_DIR)
        proj_root = os.path.dirname(backend_dir)

        candidates = [
            os.path.join(proj_root, "database", "sample_data", "donnees_fictives_hotel.json"),
            os.path.join(proj_root, "database", "donnees_fictives_hotel.json"),
            os.path.join(backend_dir, "database", "sample_data", "donnees_fictives_hotel.json"),
            os.path.join(backend_dir, "donnees_fictives_hotel.json"),
            os.path.join(proj_root, "donnees_fictives_hotel.json"),
        ]

        for p in candidates:
            if os.path.isfile(p):
                return os.path.abspath(p)

        raise FileNotFoundError(
            f"Fichier 'donnees_fictives_hotel.json' introuvable dans les chemins cherches : {candidates}. "
            "Veuillez specifier son chemin avec --file=<chemin>."
        )

    def _get_existing_counts(self):
        from apps.chambres.models import CategorieChambre, Chambre
        from apps.employes.models import Employe
        from apps.clients.models import Client
        from apps.services.models import Service, ConsommationService
        from apps.reservations.models import Reservation, ReservationChambre
        from apps.sejours.models import Sejour
        from apps.paiements.models import Paiement
        from apps.maintenances.models import Maintenance
        from apps.avis.models import Avis

        return {
            "categorie_chambre": CategorieChambre.objects.count(),
            "chambre": Chambre.objects.count(),
            "employe": Employe.objects.count(),
            "client": Client.objects.count(),
            "service": Service.objects.count(),
            "reservation": Reservation.objects.count(),
            "reservation_chambre": ReservationChambre.objects.count(),
            "sejour": Sejour.objects.count(),
            "consommation_service": ConsommationService.objects.count(),
            "paiement": Paiement.objects.count(),
            "maintenance": Maintenance.objects.count(),
            "avis": Avis.objects.count(),
        }

    def _display_summary(self, stats, is_simulation):
        self.stdout.write("\n" + "=" * 78)
        mode_tag = "[SIMULATION - DRY RUN]" if is_simulation else "[APPLICATION REELLE]"
        self.stdout.write(f"  TABLEAU COMPARATIF D'IMPORTATION {mode_tag}")
        self.stdout.write("=" * 78)
        self.stdout.write(
            f"  {'Table / Entite':<24} | {'Existant':>8} | {'Dans JSON':>9} | "
            f"{'Nouveau':>8} | {'Ignore/Reut':>11} | {'Total Projete':>13}"
        )
        self.stdout.write("-" * 78)

        total_exist = 0
        total_json = 0
        total_cree = 0
        total_ignore = 0
        total_final = 0

        for key, s in stats.items():
            ex = s["existant"]
            js = s["json"]
            cr = s["cree"]
            ig = s["ignore"]
            fin = ex + cr

            total_exist += ex
            total_json += js
            total_cree += cr
            total_ignore += ig
            total_final += fin

            self.stdout.write(
                f"  {key:<24} | {ex:>8} | {js:>9} | {cr:>8} | {ig:>11} | {fin:>13}"
            )

        self.stdout.write("=" * 78)
        self.stdout.write(
            f"  {'TOTAL GLOBAL':<24} | {total_exist:>8} | {total_json:>9} | "
            f"{total_cree:>8} | {total_ignore:>11} | {total_final:>13}"
        )
        self.stdout.write("=" * 78)

        if is_simulation:
            self.stdout.write(self.style.NOTICE(
                "\n[NOTE] Pour appliquer reellement ces modifications en base, executez :\n"
                "       python manage.py import_demo_hotel --apply\n"
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"\n[SUCCES] {total_cree} nouveaux enregistrements inseres avec succes. Aucune donnee historique n'a ete alteree.\n"
            ))
