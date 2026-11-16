# -*- coding: utf-8 -*-
"""
Commande de peuplement : seed_hotel
=====================================
Charge les donnees de demonstration depuis Hotel_Donnees_Fictives.json
dans la base MySQL (hotel Riad Atlas, Maroc).

Usage :
    python manage.py seed_hotel              # Insertion reelle
    python manage.py seed_hotel --dry-run    # Apercu sans insertion

Comportement :
    - Idempotent : get_or_create() sur toutes les tables -- une 2e execution
      ne cree pas de doublons.
    - Preserve les donnees existantes (15 sejours originaux, 20 paiements, etc.)
    - Respecte les triggers MySQL (insertion dans l'ordre CONFIRMEE -> RC -> TERMINEE)
    - Transactionnel : rollback complet en cas d'erreur

Mapping statuts JSON -> Django choices :
    reservation : terminee -> TERMINEE, annulee -> ANNULEE,
                  confirmee -> CONFIRMEE, en_attente -> EN_ATTENTE
    sejour      : termine -> TERMINE, en_cours -> EN_COURS, annule -> ANNULE
    employe     : actif -> ACTIF, en_conge -> EN_CONGE, inactif -> INACTIF
    poste       : receptionniste -> RECEPTIONNISTE, responsable -> MANAGER,
                  technicien -> MAINTENANCE, comptable -> COMPTABLE
    type_service: restauration -> RESTAURATION, activite -> AUTRE,
                  bien_etre -> SPA, linge -> BLANCHISSERIE,
                  stationnement -> AUTRE, transport -> TRANSPORT
    mode_paie   : carte -> CARTE_BANCAIRE, especes -> ESPECES,
                  virement -> VIREMENT
"""

import json
import os
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

# ---------------------------------------------------------------------------
# Chemin vers le fichier JSON de donnees fictives
# Ce fichier est cherche dans plusieurs emplacements possibles.
# ---------------------------------------------------------------------------

_POSSIBLE_JSON_PATHS = [
    # A la racine du projet (database/donnees_fictives_hotel.json)
    os.path.join(
        os.path.dirname(__file__),  # commands/
        "..", "..", "..", "..",      # apps/ -> chambres/ -> management/ -> commands/
        "..", "..",                 # backend/ -> projet/
        "database", "donnees_fictives_hotel.json",
    ),
    # Dans le dossier database/sample_data/
    os.path.join(
        os.path.dirname(__file__),
        "..", "..", "..", "..", "..", "..",
        "database", "sample_data", "donnees_fictives_hotel.json",
    ),
]

# Mapping JSON -> Django choices
_STATUT_RES = {
    "terminee":   "TERMINEE",
    "annulee":    "ANNULEE",
    "confirmee":  "CONFIRMEE",
    "en_attente": "EN_ATTENTE",
}
_STATUT_SEJ = {
    "termine":  "TERMINE",
    "en_cours": "EN_COURS",
    "annule":   "ANNULE",
}
_STATUT_EMP = {
    "actif":     "ACTIF",
    "en_conge":  "EN_CONGE",
    "inactif":   "INACTIF",
}
_POSTE_EMP = {
    "receptionniste": "RECEPTIONNISTE",
    "responsable":    "MANAGER",
    "technicien":     "MAINTENANCE",
    "comptable":      "COMPTABLE",
    "manager":        "MANAGER",
    "maintenance":    "MAINTENANCE",
    "restauration":   "RESTAURATION",
    "femme_de_chambre": "FEMME_DE_CHAMBRE",
}
_TYPE_SVC = {
    "restauration":   "RESTAURATION",
    "activite":       "AUTRE",
    "bien_etre":      "SPA",
    "linge":          "BLANCHISSERIE",
    "blanchisserie":  "BLANCHISSERIE",
    "stationnement":  "AUTRE",
    "transport":      "TRANSPORT",
    "spa":            "SPA",
    "minibar":        "MINIBAR",
    "autre":          "AUTRE",
}
_MODE_PAI = {
    "carte":          "CARTE_BANCAIRE",
    "carte_bancaire": "CARTE_BANCAIRE",
    "especes":        "ESPECES",
    "virement":       "VIREMENT",
    "cheque":         "CHEQUE",
}
_STATUT_PAI = {
    "valide":     "VALIDE",
    "en_attente": "EN_ATTENTE",
    "refuse":     "REFUSE",
    "rembourse":  "REMBOURSE",
}


def _d(val):
    """Convertit une chaine en Decimal."""
    try:
        return Decimal(str(val))
    except InvalidOperation:
        return Decimal("0.00")


def _parse_date(val):
    """Convertit une chaine en date Python (None si absent)."""
    if not val:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(val, fmt).date()
        except ValueError:
            continue
    return None


def _parse_datetime(val):
    """Convertit une chaine en datetime aware (None si absent)."""
    if not val:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            naive = datetime.strptime(val, fmt)
            return timezone.make_aware(naive)
        except ValueError:
            continue
    return None


def _load_json(cmd):
    """Charge le fichier JSON depuis le chemin fourni ou les chemins par defaut."""
    # 1. Chercher dans les emplacements par defaut
    for p in _POSSIBLE_JSON_PATHS:
        p = os.path.normpath(p)
        if os.path.isfile(p):
            with open(p, encoding="utf-8") as f:
                return json.load(f)

    # 2. Chercher dans le dossier database/ relatif a manage.py
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for name in ("donnees_fictives_hotel.json", "Hotel_Donnees_Fictives.json"):
        candidates = [
            os.path.join(base_dir, "..", "..", "database", name),
            os.path.join(base_dir, "..", "..", "database", "sample_data", name),
            os.path.join(base_dir, "..", "..", name),
        ]
        for p in candidates:
            p = os.path.normpath(p)
            if os.path.isfile(p):
                with open(p, encoding="utf-8") as f:
                    return json.load(f)

    raise FileNotFoundError(
        "Fichier JSON de donnees fictives introuvable. "
        "Placez 'donnees_fictives_hotel.json' dans database/ ou database/sample_data/."
    )


# ---------------------------------------------------------------------------
# Commande principale
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = (
        "Peuplement idempotent de la base avec les donnees de demonstration "
        "du fichier Hotel_Donnees_Fictives.json (Riad Atlas, Maroc)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Affiche ce qui serait fait sans modifier la base.",
        )
        parser.add_argument(
            "--json-path",
            type=str,
            default=None,
            help="Chemin explicite vers le fichier JSON de donnees fictives.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        json_path = options.get("json_path")

        self.stdout.write(self.style.MIGRATE_HEADING(
            "\n=== seed_hotel : Peuplement Riad Atlas ==="
        ))
        if dry_run:
            self.stdout.write(self.style.WARNING("Mode DRY-RUN active -- aucune ecriture."))

        # Charger les donnees JSON
        if json_path:
            json_path = os.path.normpath(json_path)
            with open(json_path, encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = _load_json(self)

        tables = data.get("tables", {})
        self.stdout.write(f"Fichier charge : hotel={data.get('hotel','?')}, "
                          f"date={data.get('date_generation','?')}")

        stats = {}
        try:
            with transaction.atomic():
                # 1. Categories de chambres
                cats_map = self._seed_categories(tables, dry_run, stats)
                # 2. Chambres
                chambres_map = self._seed_chambres(tables, cats_map, dry_run, stats)
                # 3. Employes
                employes_map = self._seed_employes(tables, dry_run, stats)
                # 4. Clients
                clients_map = self._seed_clients(tables, dry_run, stats)
                # 5. Services
                services_map = self._seed_services(tables, dry_run, stats)
                # 6. Reservations + ReservationChambre + Sejours (ordre trigger-safe)
                sejours_map = self._seed_reservations_et_sejours(
                    tables, clients_map, chambres_map, employes_map, dry_run, stats
                )
                # 7. Consommations de services
                self._seed_consommations(tables, sejours_map, services_map, dry_run, stats)
                # 8. Paiements
                self._seed_paiements(tables, sejours_map, employes_map, dry_run, stats)
                # 9. Maintenances
                self._seed_maintenances(tables, chambres_map, employes_map, dry_run, stats)
                # 10. Avis
                self._seed_avis(tables, sejours_map, clients_map, dry_run, stats)

                if dry_run:
                    raise _DryRunAbort()

        except _DryRunAbort:
            self.stdout.write(self.style.WARNING(
                "\nTransaction annulee (dry-run) -- aucune modification."
            ))
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"\nErreur : {exc}"))
            raise

        self._print_summary(stats, dry_run)
        self.stdout.write(self.style.SUCCESS("seed_hotel termine avec succes.\n"))

    # ------------------------------------------------------------------
    # 1. Categories de chambres
    # ------------------------------------------------------------------

    def _seed_categories(self, tables, dry_run, stats):
        self.stdout.write("\n[1/10] Categories de chambres...")
        from apps.chambres.models import CategorieChambre

        cats_map = {}  # id_categorie (JSON) -> instance Django
        created = 0

        for row in tables.get("categorie_chambre", []):
            libelle = row["libelle"]
            defaults = {
                "capacite":    row["capacite"],
                "tarif_nuit":  _d(row["tarif_nuit"]),
                "description": row.get("description", ""),
            }
            if not dry_run:
                obj, is_new = CategorieChambre.objects.get_or_create(
                    libelle=libelle, defaults=defaults
                )
                cats_map[row["id_categorie"]] = obj
                if is_new:
                    created += 1
                    self.stdout.write(f"  + {libelle} ({defaults['tarif_nuit']} MAD/nuit)")
                else:
                    self.stdout.write(f"  ~ Existante : {libelle}")
            else:
                self.stdout.write(f"  [DRY] {libelle} -- {_d(row['tarif_nuit'])} MAD/nuit")
                created += 1

        stats["categories"] = {"created": created, "total": len(tables.get("categorie_chambre", []))}
        return cats_map

    # ------------------------------------------------------------------
    # 2. Chambres
    # ------------------------------------------------------------------

    def _seed_chambres(self, tables, cats_map, dry_run, stats):
        self.stdout.write("\n[2/10] Chambres...")
        from apps.chambres.models import Chambre

        chambres_map = {}  # id_chambre (JSON) -> instance Django
        created = 0

        for row in tables.get("chambre", []):
            numero = str(row["numero_chambre"])
            cat_id = row["id_categorie"]
            cat = cats_map.get(cat_id)

            defaults = {
                "etage":         row.get("etage", 0),
                "etat_physique": row.get("etat_physique", "disponible"),
                "description":   row.get("description", f"Chambre {numero}"),
            }
            if cat:
                defaults["categorie"] = cat

            if not dry_run:
                if cat is None:
                    self.stdout.write(f"  ! Chambre {numero} : categorie {cat_id} introuvable, ignoree.")
                    continue
                obj, is_new = Chambre.objects.get_or_create(
                    numero_chambre=numero, defaults=defaults
                )
                chambres_map[row["id_chambre"]] = obj
                if is_new:
                    created += 1
                    self.stdout.write(f"  + Chambre {numero} etage {row.get('etage',0)} [{row.get('etat_physique','?')}]")
                else:
                    self.stdout.write(f"  ~ Existante : Chambre {numero}")
                    chambres_map[row["id_chambre"]] = obj
            else:
                self.stdout.write(f"  [DRY] Chambre {numero} etage {row.get('etage',0)}")
                created += 1

        stats["chambres"] = {"created": created, "total": len(tables.get("chambre", []))}
        return chambres_map

    # ------------------------------------------------------------------
    # 3. Employes
    # ------------------------------------------------------------------

    def _seed_employes(self, tables, dry_run, stats):
        self.stdout.write("\n[3/10] Employes...")
        from apps.employes.models import Employe

        employes_map = {}  # id_employe (JSON) -> instance Django
        created = 0

        for row in tables.get("employe", []):
            email = row["email"]
            poste_raw = row.get("poste", "").lower()
            poste = _POSTE_EMP.get(poste_raw, "AUTRE")
            statut_raw = row.get("statut", "actif").lower()
            statut = _STATUT_EMP.get(statut_raw, "ACTIF")

            defaults = {
                "nom":          row["nom"],
                "prenom":       row["prenom"],
                "poste":        poste,
                "telephone":    row.get("telephone", ""),
                "date_embauche": _parse_date(row.get("date_embauche")) or date.today(),
                "statut":       statut,
            }

            if not dry_run:
                obj, is_new = Employe.objects.get_or_create(email=email, defaults=defaults)
                employes_map[row["id_employe"]] = obj
                if is_new:
                    created += 1
                    self.stdout.write(f"  + {obj.nom} {obj.prenom} ({poste})")
                else:
                    self.stdout.write(f"  ~ Existant : {obj.nom} {obj.prenom}")
                    employes_map[row["id_employe"]] = obj
            else:
                self.stdout.write(f"  [DRY] {row['nom']} {row['prenom']} ({poste})")
                created += 1

        stats["employes"] = {"created": created, "total": len(tables.get("employe", []))}
        return employes_map

    # ------------------------------------------------------------------
    # 4. Clients
    # ------------------------------------------------------------------

    def _seed_clients(self, tables, dry_run, stats):
        self.stdout.write("\n[4/10] Clients...")
        from apps.clients.models import Client

        clients_map = {}  # id_client (JSON) -> instance Django
        created = 0

        for row in tables.get("client", []):
            piece = row["piece_identite"]
            defaults = {
                "nom":        row["nom"],
                "prenom":     row["prenom"],
                "telephone":  row.get("telephone", ""),
                "email":      row.get("email") or None,
                "nationalite": row.get("nationalite") or None,
            }

            if not dry_run:
                obj, is_new = Client.objects.get_or_create(
                    piece_identite=piece, defaults=defaults
                )
                clients_map[row["id_client"]] = obj
                if is_new:
                    created += 1
                    self.stdout.write(f"  + {obj.nom} {obj.prenom} ({piece})")
                else:
                    self.stdout.write(f"  ~ Existant : {obj.nom} {obj.prenom}")
                    clients_map[row["id_client"]] = obj
            else:
                self.stdout.write(f"  [DRY] {row['nom']} {row['prenom']} ({piece})")
                created += 1

        stats["clients"] = {"created": created, "total": len(tables.get("client", []))}
        return clients_map

    # ------------------------------------------------------------------
    # 5. Services
    # ------------------------------------------------------------------

    def _seed_services(self, tables, dry_run, stats):
        self.stdout.write("\n[5/10] Services...")
        from apps.services.models import Service

        services_map = {}  # id_service (JSON) -> instance Django
        created = 0

        for row in tables.get("service", []):
            nom = row["nom"]
            type_raw = row.get("type_service", "").lower()
            type_svc = _TYPE_SVC.get(type_raw, "AUTRE")
            defaults = {
                "type_service":  type_svc,
                "prix_unitaire": _d(row["prix_unitaire"]),
                "description":   row.get("description", ""),
            }

            if not dry_run:
                obj, is_new = Service.objects.get_or_create(nom=nom, defaults=defaults)
                services_map[row["id_service"]] = obj
                if is_new:
                    created += 1
                    self.stdout.write(f"  + {nom} ({_d(row['prix_unitaire'])} MAD)")
                else:
                    self.stdout.write(f"  ~ Existant : {nom}")
                    services_map[row["id_service"]] = obj
            else:
                self.stdout.write(f"  [DRY] {nom} ({_d(row['prix_unitaire'])} MAD)")
                created += 1

        stats["services"] = {"created": created, "total": len(tables.get("service", []))}
        return services_map

    # ------------------------------------------------------------------
    # 6. Reservations + ReservationChambre + Sejours
    #    ORDRE TRIGGER-SAFE :
    #    a) Creer Reservation en CONFIRMEE
    #    b) Inserer ReservationChambre (trigger verifie != ANNULEE/TERMINEE)
    #    c) Mettre a jour statut -> TERMINEE/ANNULEE
    #    d) Creer Sejour (lie a Reservation + Chambre)
    # ------------------------------------------------------------------

    def _seed_reservations_et_sejours(
        self, tables, clients_map, chambres_map, employes_map, dry_run, stats
    ):
        self.stdout.write("\n[6/10] Reservations, ReservationChambre et Sejours...")
        from apps.reservations.models import Reservation, ReservationChambre
        from apps.sejours.models import Sejour

        reservations_rows = tables.get("reservation", [])
        rc_rows = tables.get("reservation_chambre", [])
        sejours_rows = tables.get("sejour", [])

        # Index RC par reservation
        rc_by_res = {}
        for rc in rc_rows:
            rc_by_res.setdefault(rc["id_reservation"], []).append(rc)

        # Index sejours par reservation+chambre
        sejour_by_res_ch = {}
        for s in sejours_rows:
            key = (s["id_reservation"], s["id_chambre"])
            sejour_by_res_ch[key] = s

        res_created = 0
        rc_created = 0
        sej_created = 0
        sejours_map = {}  # id_sejour (JSON) -> instance Django

        for row in reservations_rows:
            id_res_json = row["id_reservation"]
            statut_final_raw = row["statut_reservation"].lower()
            statut_final = _STATUT_RES.get(statut_final_raw, "EN_ATTENTE")

            client = clients_map.get(row["id_client"])
            employe = employes_map.get(row["id_employe"])

            if not dry_run:
                if client is None:
                    self.stdout.write(
                        f"  ! Reservation {id_res_json} : client {row['id_client']} introuvable, ignoree."
                    )
                    continue
                if employe is None:
                    # Prendre le premier employe disponible
                    if employes_map:
                        employe = next(iter(employes_map.values()))
                    else:
                        self.stdout.write(
                            f"  ! Reservation {id_res_json} : aucun employe disponible, ignoree."
                        )
                        continue

                # Verifier si la reservation existe deja (par client + date)
                date_res = _parse_datetime(row["date_reservation"])
                existing_res = Reservation.objects.filter(
                    client=client,
                    date_reservation__date=date_res.date() if date_res else None,
                    montant_estime=_d(row.get("montant_estime", 0)),
                ).first()

                if existing_res:
                    res_obj = existing_res
                    self.stdout.write(f"  ~ Reservation existante : #{res_obj.id_reservation}")
                else:
                    # Phase A : creer CONFIRMEE (trigger exige != ANNULEE/TERMINEE)
                    res_obj = Reservation.objects.create(
                        date_reservation=date_res or timezone.now(),
                        statut_reservation="CONFIRMEE",
                        nb_personnes_total=row.get("nb_personnes_total", 1),
                        montant_estime=_d(row.get("montant_estime", 0)),
                        client=client,
                        employe=employe,
                    )
                    res_created += 1
                    self.stdout.write(f"  + Reservation #{res_obj.id_reservation} -> client {client.nom}")

                # Phase B : inserer les ReservationChambre
                # IMPORTANT : verifier l'existence AVANT l'INSERT pour eviter
                # que le trigger trg_resch_bi ne leve une erreur de chevauchement
                # meme si la RC existe deja (get_or_create tente un INSERT sur UNIQUE).
                for rc_row in rc_by_res.get(id_res_json, []):
                    chambre = chambres_map.get(rc_row["id_chambre"])
                    if chambre is None:
                        self.stdout.write(
                            f"    ! RC : chambre {rc_row['id_chambre']} introuvable, ignoree."
                        )
                        continue

                    # Verification d'existence AVANT l'INSERT (evite le trigger)
                    existing_rc = ReservationChambre.objects.filter(
                        reservation=res_obj,
                        chambre=chambre,
                    ).first()

                    if existing_rc:
                        self.stdout.write(
                            f"    ~ RC existante : res #{res_obj.id_reservation} <-> chambre {chambre.numero_chambre}"
                        )
                        continue

                    # La RC n'existe pas : on peut inserer (trigger va verifier)
                    ReservationChambre.objects.create(
                        reservation=res_obj,
                        chambre=chambre,
                        date_arrivee_prevue=_parse_date(rc_row["date_arrivee_prevue"]),
                        date_depart_prevue=_parse_date(rc_row["date_depart_prevue"]),
                        nb_occupants=rc_row.get("nb_occupants", 1),
                        tarif_nuit_applique=_d(rc_row.get("tarif_nuit_applique", 0)),
                    )
                    rc_created += 1
                    self.stdout.write(
                        f"    + RC : res #{res_obj.id_reservation} <-> chambre {chambre.numero_chambre}"
                    )

                # Phase C : mettre a jour le statut final si necessaire
                if res_obj.statut_reservation != statut_final:
                    # Verifier la transition autorisee par le trigger trg_res_bu :
                    # EN_ATTENTE->CONFIRMEE, EN_ATTENTE->ANNULEE, CONFIRMEE->ANNULEE, CONFIRMEE->TERMINEE
                    allowed = {
                        "EN_ATTENTE": ["CONFIRMEE", "ANNULEE"],
                        "CONFIRMEE":  ["ANNULEE", "TERMINEE"],
                        "ANNULEE":    [],
                        "TERMINEE":   [],
                    }
                    cur = res_obj.statut_reservation
                    if statut_final in allowed.get(cur, []):
                        res_obj.statut_reservation = statut_final
                        res_obj.save(update_fields=["statut_reservation"])
                        self.stdout.write(f"    -> Statut mis a jour : {cur} -> {statut_final}")
                    elif cur == statut_final:
                        pass  # deja bon
                    else:
                        self.stdout.write(
                            f"    ! Transition {cur} -> {statut_final} non autorisee par trigger, statut conserve."
                        )

                # Phase D : creer les sejours associes
                for rc_row in rc_by_res.get(id_res_json, []):
                    chambre = chambres_map.get(rc_row["id_chambre"])
                    if chambre is None:
                        continue

                    s_data = sejour_by_res_ch.get((id_res_json, rc_row["id_chambre"]))
                    if s_data is None:
                        continue

                    # Verifier si ce sejour existe deja
                    existing_sej = Sejour.objects.filter(
                        reservation=res_obj,
                        chambre=chambre,
                    ).first()

                    if existing_sej:
                        sejours_map[s_data["id_sejour"]] = existing_sej
                        self.stdout.write(
                            f"    ~ Sejour existant : #{existing_sej.id_sejour}"
                        )
                    else:
                        statut_sej_raw = s_data.get("statut_sejour", "termine").lower()
                        statut_sej = _STATUT_SEJ.get(statut_sej_raw, "TERMINE")

                        sej_obj = Sejour.objects.create(
                            reservation=res_obj,
                            chambre=chambre,
                            arrivee_reelle=_parse_datetime(s_data.get("arrivee_reelle")),
                            depart_reel=_parse_datetime(s_data.get("depart_reel")),
                            statut_sejour=statut_sej,
                            observations=s_data.get("observations", ""),
                            est_archive=bool(s_data.get("est_archive", 0)),
                            date_archivage=_parse_datetime(s_data.get("date_archivage")),
                        )
                        sejours_map[s_data["id_sejour"]] = sej_obj
                        sej_created += 1
                        self.stdout.write(
                            f"    + Sejour #{sej_obj.id_sejour} [{statut_sej}] "
                            f"chambre {chambre.numero_chambre}"
                        )
            else:
                # Dry-run
                self.stdout.write(
                    f"  [DRY] Reservation {id_res_json} [{statut_final_raw}] "
                    f"client={row['id_client']} employe={row['id_employe']}"
                )
                res_created += 1
                for rc_row in rc_by_res.get(id_res_json, []):
                    self.stdout.write(
                        f"    [DRY] RC : chambre {rc_row['id_chambre']}"
                    )
                    rc_created += 1
                for rc_row in rc_by_res.get(id_res_json, []):
                    s_data = sejour_by_res_ch.get((id_res_json, rc_row["id_chambre"]))
                    if s_data:
                        self.stdout.write(
                            f"    [DRY] Sejour {s_data['id_sejour']} [{s_data.get('statut_sejour','?')}]"
                        )
                        sej_created += 1

        stats["reservations"]    = {"created": res_created,  "total": len(reservations_rows)}
        stats["reservation_ch"]  = {"created": rc_created,   "total": len(rc_rows)}
        stats["sejours"]         = {"created": sej_created,  "total": len(sejours_rows)}
        return sejours_map

    # ------------------------------------------------------------------
    # 7. Consommations de services
    # ------------------------------------------------------------------

    def _seed_consommations(self, tables, sejours_map, services_map, dry_run, stats):
        self.stdout.write("\n[7/10] Consommations de services...")
        from apps.services.models import ConsommationService

        rows = tables.get("consommation_service", [])
        created = 0

        for row in rows:
            sejour = sejours_map.get(row["id_sejour"])
            service = services_map.get(row["id_service"])

            if not dry_run:
                if sejour is None:
                    self.stdout.write(
                        f"  ! Consommation {row.get('id_consommation','?')} : "
                        f"sejour {row['id_sejour']} introuvable, ignoree."
                    )
                    continue
                if service is None:
                    self.stdout.write(
                        f"  ! Consommation {row.get('id_consommation','?')} : "
                        f"service {row['id_service']} introuvable, ignoree."
                    )
                    continue

                date_conso = _parse_datetime(row.get("date_consommation"))

                # Idempotence : verifier si cette consommation existe deja
                existing = ConsommationService.objects.filter(
                    sejour=sejour,
                    service=service,
                    date_consommation__date=date_conso.date() if date_conso else None,
                    quantite=row.get("quantite", 1),
                ).first()

                if existing:
                    self.stdout.write(
                        f"  ~ Existante : {service.nom} x{row.get('quantite',1)} -> Sejour #{sejour.id_sejour}"
                    )
                    continue

                ConsommationService.objects.create(
                    sejour=sejour,
                    service=service,
                    date_consommation=date_conso or timezone.now(),
                    quantite=row.get("quantite", 1),
                    prix_applique=_d(row.get("prix_applique", service.prix_unitaire)),
                )
                created += 1
                self.stdout.write(
                    f"  + {service.nom} x{row.get('quantite',1)} -> Sejour #{sejour.id_sejour} "
                    f"({_d(row.get('prix_applique',0))} MAD)"
                )
            else:
                self.stdout.write(
                    f"  [DRY] {row.get('id_consommation','?')} : service {row['id_service']} "
                    f"x{row.get('quantite',1)} -> sejour {row['id_sejour']}"
                )
                created += 1

        stats["consommations"] = {"created": created, "total": len(rows)}

    # ------------------------------------------------------------------
    # 8. Paiements
    # ------------------------------------------------------------------

    def _seed_paiements(self, tables, sejours_map, employes_map, dry_run, stats):
        self.stdout.write("\n[8/10] Paiements...")
        from apps.paiements.models import Paiement

        rows = tables.get("paiement", [])
        created = 0

        for row in rows:
            sejour = sejours_map.get(row["id_sejour"])
            employe = employes_map.get(row["id_employe"])

            if not dry_run:
                if sejour is None:
                    self.stdout.write(
                        f"  ! Paiement {row.get('id_paiement','?')} : "
                        f"sejour {row['id_sejour']} introuvable, ignore."
                    )
                    continue
                if employe is None and employes_map:
                    employe = next(iter(employes_map.values()))

                ref = row.get("reference_paiement", "")
                mode_raw = row.get("mode_paiement", "").lower()
                mode = _MODE_PAI.get(mode_raw, "ESPECES")
                statut_raw = row.get("statut", "valide").lower()
                statut = _STATUT_PAI.get(statut_raw, "VALIDE")
                montant = _d(row.get("montant", 0))

                # Idempotence : par reference si presente, sinon par sejour+montant+date
                if ref:
                    existing = Paiement.objects.filter(reference_paiement=ref).first()
                else:
                    date_pai = _parse_datetime(row.get("date_paiement"))
                    existing = Paiement.objects.filter(
                        sejour=sejour,
                        montant=montant,
                        date_paiement__date=date_pai.date() if date_pai else None,
                    ).first()

                if existing:
                    self.stdout.write(
                        f"  ~ Existant : {existing.reference_paiement} {montant} MAD"
                    )
                    continue

                date_pai = _parse_datetime(row.get("date_paiement"))
                p = Paiement.objects.create(
                    sejour=sejour,
                    employe=employe,
                    date_paiement=date_pai or timezone.now(),
                    montant=montant,
                    mode_paiement=mode,
                    statut=statut,
                    # reference_paiement generee par model.save()
                )
                created += 1
                self.stdout.write(
                    f"  + {p.reference_paiement} {montant} MAD [{statut}] ({mode}) "
                    f"-> Sejour #{sejour.id_sejour}"
                )
            else:
                self.stdout.write(
                    f"  [DRY] Paiement {row.get('id_paiement','?')} : "
                    f"{_d(row.get('montant',0))} MAD -> sejour {row['id_sejour']}"
                )
                created += 1

        stats["paiements"] = {"created": created, "total": len(rows)}

    # ------------------------------------------------------------------
    # 9. Maintenances
    # ------------------------------------------------------------------

    def _seed_maintenances(self, tables, chambres_map, employes_map, dry_run, stats):
        self.stdout.write("\n[9/10] Maintenances...")
        from apps.maintenances.models import Maintenance

        rows = tables.get("maintenance", [])
        created = 0

        for row in rows:
            chambre = chambres_map.get(row["id_chambre"])
            employe = employes_map.get(row["id_employe"])

            if not dry_run:
                if chambre is None:
                    self.stdout.write(
                        f"  ! Maintenance {row.get('id_maintenance','?')} : "
                        f"chambre {row['id_chambre']} introuvable, ignoree."
                    )
                    continue
                if employe is None and employes_map:
                    employe = next(iter(employes_map.values()))

                desc = row.get("description", "")
                debut = _parse_datetime(row.get("debut"))

                # Idempotence : par chambre + description + debut
                existing = Maintenance.objects.filter(
                    chambre=chambre,
                    description=desc,
                ).first()

                if existing:
                    self.stdout.write(
                        f"  ~ Existante : Maintenance chambre {chambre.numero_chambre}"
                    )
                    continue

                Maintenance.objects.create(
                    chambre=chambre,
                    employe=employe,
                    debut=debut or timezone.now(),
                    fin=_parse_datetime(row.get("fin")),
                    type=row.get("type", "preventive"),
                    description=desc,
                    cout=_d(row.get("cout", 0)),
                    statut=row.get("statut", "planifiee"),
                    bloquante=bool(row.get("bloquante", 0)),
                )
                created += 1
                self.stdout.write(
                    f"  + Maintenance chambre {chambre.numero_chambre} "
                    f"[{row.get('statut','?')}] bloquante={bool(row.get('bloquante',0))}"
                )
            else:
                self.stdout.write(
                    f"  [DRY] Maintenance {row.get('id_maintenance','?')} : "
                    f"chambre {row['id_chambre']} [{row.get('statut','?')}]"
                )
                created += 1

        stats["maintenances"] = {"created": created, "total": len(rows)}

    # ------------------------------------------------------------------
    # 10. Avis
    # ------------------------------------------------------------------

    def _seed_avis(self, tables, sejours_map, clients_map, dry_run, stats):
        self.stdout.write("\n[10/10] Avis clients...")
        from apps.avis.models import Avis

        rows = tables.get("avis", [])
        created = 0

        for row in rows:
            sejour = sejours_map.get(row["id_sejour"])
            client = clients_map.get(row["id_client"])

            if not dry_run:
                if sejour is None:
                    self.stdout.write(
                        f"  ! Avis {row.get('id_avis','?')} : "
                        f"sejour {row['id_sejour']} introuvable, ignore."
                    )
                    continue
                if client is None:
                    self.stdout.write(
                        f"  ! Avis {row.get('id_avis','?')} : "
                        f"client {row['id_client']} introuvable, ignore."
                    )
                    continue

                # Idempotence : OneToOne sur sejour
                existing = Avis.objects.filter(sejour=sejour).first()
                if existing:
                    self.stdout.write(
                        f"  ~ Existant : Avis sejour #{sejour.id_sejour} note={existing.note}"
                    )
                    continue

                date_avis = _parse_datetime(row.get("date_avis"))
                a = Avis.objects.create(
                    sejour=sejour,
                    client=client,
                    date_avis=date_avis or timezone.now(),
                    note=row.get("note", 3),
                    commentaire=row.get("commentaire", ""),
                )
                created += 1
                self.stdout.write(
                    f"  + Avis sejour #{sejour.id_sejour} note={a.note}/5 client={client.nom}"
                )
            else:
                self.stdout.write(
                    f"  [DRY] Avis {row.get('id_avis','?')} : "
                    f"note={row.get('note','?')} sejour={row['id_sejour']}"
                )
                created += 1

        stats["avis"] = {"created": created, "total": len(rows)}

    # ------------------------------------------------------------------
    # Resume
    # ------------------------------------------------------------------

    def _print_summary(self, stats, dry_run):
        mode = "[DRY-RUN] " if dry_run else ""
        self.stdout.write(f"\n{'=' * 60}")
        self.stdout.write(f"  {mode}RESUME DU PEUPLEMENT")
        self.stdout.write(f"{'=' * 60}")

        total = 0
        labels = {
            "categories":    "Categories de chambres",
            "chambres":      "Chambres",
            "employes":      "Employes",
            "clients":       "Clients",
            "services":      "Services",
            "reservations":  "Reservations",
            "reservation_ch":"ReservationChambre",
            "sejours":       "Sejours",
            "consommations": "Consommations",
            "paiements":     "Paiements",
            "maintenances":  "Maintenances",
            "avis":          "Avis",
        }
        for key, label in labels.items():
            if key in stats:
                c = stats[key].get("created", 0)
                t = stats[key].get("total", 0)
                total += c
                self.stdout.write(f"  {label:<25} : {c:>3} cree(s) / {t:>3} prevu(s)")

        self.stdout.write(f"{'=' * 60}")
        self.stdout.write(f"  Total cree : {total} enregistrement(s)")
        self.stdout.write(f"{'=' * 60}\n")


class _DryRunAbort(Exception):
    """Levee pour annuler la transaction en mode dry-run."""
    pass
