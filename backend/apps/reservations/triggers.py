"""
Triggers de la base de données pour le module Réservations (Salma).

Ils sont la dernière ligne de défense : même si on modifie les données hors de
l'API (admin Django, script SQL, console MySQL), les règles restent respectées.
L'API fait les mêmes vérifications (services.py) pour renvoyer des messages
propres au frontend.

Deux dialectes : MySQL (production) et SQLite (tests Django).

Tables concernées :
    reservations_reservation          (RESERVATION)
    reservations_reservation_chambre  (CONCERNER)
Tables lues : chambres_chambre, chambres_categoriechambre.
"""

T_RC = "reservations_reservation_chambre"
T_RES = "reservations_reservation"

TRIGGER_NAMES = [
    "trg_resch_bi", "trg_resch_bu",
    "trg_resch_ai", "trg_resch_au", "trg_resch_ad",
    "trg_res_bu", "trg_res_bd",
]

ACTIFS = "('EN_ATTENTE','CONFIRMEE')"

MSG_DATES = "Le depart doit etre posterieur a la date darrivee."
MSG_OCC = "Le nombre doccupants doit etre superieur a zero."
MSG_ETAT = "Cette chambre est hors service."
MSG_CAP = "Le nombre doccupants depasse la capacite de la chambre."
MSG_CHEVAUCHE = "Cette chambre est deja reservee sur tout ou partie de la periode."
MSG_PARENT = "Impossible de modifier les chambres dune reservation annulee ou terminee."
MSG_FINAL = "Une reservation annulee ou terminee ne peut plus changer de statut."
MSG_CONF = "Une reservation sans chambre ne peut pas etre confirmee."
MSG_TERM = "Seule une reservation confirmee peut etre terminee."
MSG_RETOUR = "Une reservation confirmee ne peut pas revenir en attente."
MSG_SUPPR = "Une reservation confirmee ou terminee ne peut pas etre supprimee."


# ---------------------------------------------------------------- MySQL
def _mysql_signal(msg):
    return f"SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '{msg}'"


def _mysql_verifs_chambre(excl, controle_parent):
    """Corps commun BEFORE INSERT / BEFORE UPDATE sur CONCERNER."""
    parent = ""
    if controle_parent:
        parent = f"""
    SELECT statut_reservation INTO v_statut FROM {T_RES}
        WHERE id_reservation = NEW.id_reservation;
    IF v_statut IN ('ANNULEE','TERMINEE') THEN
        {_mysql_signal(MSG_PARENT)};
    END IF;"""
    return f"""
BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_capacite INT;
    DECLARE v_etat VARCHAR(20);
    IF NEW.date_depart_prevue <= NEW.date_arrivee_prevue THEN
        {_mysql_signal(MSG_DATES)};
    END IF;
    IF NEW.nb_occupants < 1 THEN
        {_mysql_signal(MSG_OCC)};
    END IF;{parent}
    SELECT cat.capacite, c.etat_physique INTO v_capacite, v_etat
        FROM chambres_chambre c
        JOIN chambres_categoriechambre cat ON cat.id_categorie = c.categorie_id
        WHERE c.id_chambre = NEW.id_chambre;
    IF v_etat = 'hors_service' THEN
        {_mysql_signal(MSG_ETAT)};
    END IF;
    IF NEW.nb_occupants > v_capacite THEN
        {_mysql_signal(MSG_CAP)};
    END IF;
    IF EXISTS (
        SELECT 1 FROM {T_RC} rc
        JOIN {T_RES} r ON r.id_reservation = rc.id_reservation
        WHERE rc.id_chambre = NEW.id_chambre
          AND {excl}
          AND r.statut_reservation IN {ACTIFS}
          AND rc.date_arrivee_prevue < NEW.date_depart_prevue
          AND rc.date_depart_prevue > NEW.date_arrivee_prevue
    ) AND (SELECT statut_reservation FROM {T_RES}
           WHERE id_reservation = NEW.id_reservation) IN {ACTIFS} THEN
        {_mysql_signal(MSG_CHEVAUCHE)};
    END IF;
END"""


def _mysql_recalcul(ref):
    return f"""
BEGIN
    UPDATE {T_RES} SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM {T_RC} WHERE id_reservation = {ref}),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM {T_RC} WHERE id_reservation = {ref})
    WHERE id_reservation = {ref};
END"""


def mysql_statements():
    s = []
    s.append(f"CREATE TRIGGER trg_resch_bi BEFORE INSERT ON {T_RC} FOR EACH ROW"
             + _mysql_verifs_chambre("rc.id_reservation <> NEW.id_reservation", True))
    s.append(f"CREATE TRIGGER trg_resch_bu BEFORE UPDATE ON {T_RC} FOR EACH ROW"
             + _mysql_verifs_chambre("rc.id <> OLD.id", False))
    s.append(f"CREATE TRIGGER trg_resch_ai AFTER INSERT ON {T_RC} FOR EACH ROW"
             + _mysql_recalcul("NEW.id_reservation"))
    s.append(f"CREATE TRIGGER trg_resch_au AFTER UPDATE ON {T_RC} FOR EACH ROW"
             + _mysql_recalcul("NEW.id_reservation"))
    s.append(f"CREATE TRIGGER trg_resch_ad AFTER DELETE ON {T_RC} FOR EACH ROW"
             + _mysql_recalcul("OLD.id_reservation"))
    s.append(f"""CREATE TRIGGER trg_res_bu BEFORE UPDATE ON {T_RES} FOR EACH ROW
BEGIN
    IF NEW.statut_reservation <> OLD.statut_reservation THEN
        IF OLD.statut_reservation IN ('ANNULEE','TERMINEE') THEN
            {_mysql_signal(MSG_FINAL)};
        END IF;
        IF NEW.statut_reservation = 'CONFIRMEE' AND NOT EXISTS (
            SELECT 1 FROM {T_RC} WHERE id_reservation = OLD.id_reservation) THEN
            {_mysql_signal(MSG_CONF)};
        END IF;
        IF NEW.statut_reservation = 'TERMINEE'
           AND OLD.statut_reservation <> 'CONFIRMEE' THEN
            {_mysql_signal(MSG_TERM)};
        END IF;
        IF NEW.statut_reservation = 'EN_ATTENTE' THEN
            {_mysql_signal(MSG_RETOUR)};
        END IF;
    END IF;
END""")
    s.append(f"""CREATE TRIGGER trg_res_bd BEFORE DELETE ON {T_RES} FOR EACH ROW
BEGIN
    IF OLD.statut_reservation IN ('CONFIRMEE','TERMINEE') THEN
        {_mysql_signal(MSG_SUPPR)};
    END IF;
END""")
    return s


# --------------------------------------------------------------- SQLite
def _sq(cond, msg):
    return f"    SELECT RAISE(ABORT, '{msg}') WHERE {cond};"


def _sqlite_verifs_chambre(excl, controle_parent):
    lignes = [
        _sq("NEW.date_depart_prevue <= NEW.date_arrivee_prevue", MSG_DATES),
        _sq("NEW.nb_occupants < 1", MSG_OCC),
    ]
    if controle_parent:
        lignes.append(_sq(
            f"(SELECT statut_reservation FROM {T_RES} "
            f"WHERE id_reservation = NEW.id_reservation) IN ('ANNULEE','TERMINEE')",
            MSG_PARENT))
    lignes += [
        _sq("(SELECT c.etat_physique FROM chambres_chambre c "
            "WHERE c.id_chambre = NEW.id_chambre) = 'hors_service'", MSG_ETAT),
        _sq("NEW.nb_occupants > (SELECT cat.capacite FROM chambres_chambre c "
            "JOIN chambres_categoriechambre cat ON cat.id_categorie = c.categorie_id "
            "WHERE c.id_chambre = NEW.id_chambre)", MSG_CAP),
        _sq(f"(SELECT statut_reservation FROM {T_RES} "
            f"WHERE id_reservation = NEW.id_reservation) IN {ACTIFS} AND EXISTS ("
            f"SELECT 1 FROM {T_RC} rc JOIN {T_RES} r ON r.id_reservation = rc.id_reservation "
            f"WHERE rc.id_chambre = NEW.id_chambre AND {excl} "
            f"AND r.statut_reservation IN {ACTIFS} "
            f"AND rc.date_arrivee_prevue < NEW.date_depart_prevue "
            f"AND rc.date_depart_prevue > NEW.date_arrivee_prevue)", MSG_CHEVAUCHE),
    ]
    return "BEGIN\n" + "\n".join(lignes) + "\nEND"


def _sqlite_recalcul(ref):
    return f"""BEGIN
    UPDATE {T_RES} SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM {T_RC} WHERE id_reservation = {ref}),
        montant_estime = (SELECT COALESCE(SUM(
                              CAST(julianday(date_depart_prevue)
                                   - julianday(date_arrivee_prevue) AS INTEGER)
                              * tarif_nuit_applique), 0)
                          FROM {T_RC} WHERE id_reservation = {ref})
    WHERE id_reservation = {ref};
END"""


def sqlite_statements():
    ch = "NEW.statut_reservation <> OLD.statut_reservation"
    return [
        f"CREATE TRIGGER trg_resch_bi BEFORE INSERT ON {T_RC}\n"
        + _sqlite_verifs_chambre("rc.id_reservation <> NEW.id_reservation", True),
        f"CREATE TRIGGER trg_resch_bu BEFORE UPDATE ON {T_RC}\n"
        + _sqlite_verifs_chambre("rc.id <> OLD.id", False),
        f"CREATE TRIGGER trg_resch_ai AFTER INSERT ON {T_RC}\n"
        + _sqlite_recalcul("NEW.id_reservation"),
        f"CREATE TRIGGER trg_resch_au AFTER UPDATE ON {T_RC}\n"
        + _sqlite_recalcul("NEW.id_reservation"),
        f"CREATE TRIGGER trg_resch_ad AFTER DELETE ON {T_RC}\n"
        + _sqlite_recalcul("OLD.id_reservation"),
        f"CREATE TRIGGER trg_res_bu BEFORE UPDATE ON {T_RES}\nBEGIN\n"
        + "\n".join([
            _sq(f"{ch} AND OLD.statut_reservation IN ('ANNULEE','TERMINEE')", MSG_FINAL),
            _sq(f"{ch} AND NEW.statut_reservation = 'CONFIRMEE' AND NOT EXISTS ("
                f"SELECT 1 FROM {T_RC} WHERE id_reservation = OLD.id_reservation)", MSG_CONF),
            _sq(f"{ch} AND NEW.statut_reservation = 'TERMINEE' "
                f"AND OLD.statut_reservation <> 'CONFIRMEE'", MSG_TERM),
            _sq(f"{ch} AND NEW.statut_reservation = 'EN_ATTENTE'", MSG_RETOUR),
        ]) + "\nEND",
        f"CREATE TRIGGER trg_res_bd BEFORE DELETE ON {T_RES}\nBEGIN\n"
        + _sq("OLD.statut_reservation IN ('CONFIRMEE','TERMINEE')", MSG_SUPPR) + "\nEND",
    ]


# ------------------------------------------------------------ installation
def installer(schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == "mysql":
        stmts = mysql_statements()
    elif vendor == "sqlite":
        stmts = sqlite_statements()
    else:
        return
    desinstaller(schema_editor)
    for sql in stmts:
        schema_editor.execute(sql, params=None)


def desinstaller(schema_editor):
    if schema_editor.connection.vendor not in ("mysql", "sqlite"):
        return
    for nom in TRIGGER_NAMES:
        schema_editor.execute(f"DROP TRIGGER IF EXISTS {nom}", params=None)
