-- Triggers du module Reservations (Salma) - MySQL
-- Installes automatiquement par apps/reservations/migrations/0002_triggers.py
-- Ce fichier sert de reference / installation manuelle :  mysql -u root -p hotel_management < triggers_reservations.sql

DELIMITER $$

DROP TRIGGER IF EXISTS trg_resch_bi$$
DROP TRIGGER IF EXISTS trg_resch_bu$$
DROP TRIGGER IF EXISTS trg_resch_ai$$
DROP TRIGGER IF EXISTS trg_resch_au$$
DROP TRIGGER IF EXISTS trg_resch_ad$$
DROP TRIGGER IF EXISTS trg_res_bu$$
DROP TRIGGER IF EXISTS trg_res_bd$$

CREATE TRIGGER trg_resch_bi BEFORE INSERT ON reservations_reservation_chambre FOR EACH ROW
BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_capacite INT;
    DECLARE v_etat VARCHAR(20);
    IF NEW.date_depart_prevue <= NEW.date_arrivee_prevue THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le depart doit etre posterieur a la date darrivee.';
    END IF;
    IF NEW.nb_occupants < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants doit etre superieur a zero.';
    END IF;
    SELECT statut_reservation INTO v_statut FROM reservations_reservation
        WHERE id_reservation = NEW.id_reservation;
    IF v_statut IN ('ANNULEE','TERMINEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Impossible de modifier les chambres dune reservation annulee ou terminee.';
    END IF;
    SELECT cat.capacite, c.etat_physique INTO v_capacite, v_etat
        FROM chambres_chambre c
        JOIN chambres_categoriechambre cat ON cat.id_categorie = c.categorie_id
        WHERE c.id_chambre = NEW.id_chambre;
    IF v_etat = 'hors_service' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est hors service.';
    END IF;
    IF NEW.nb_occupants > v_capacite THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants depasse la capacite de la chambre.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM reservations_reservation_chambre rc
        JOIN reservations_reservation r ON r.id_reservation = rc.id_reservation
        WHERE rc.id_chambre = NEW.id_chambre
          AND rc.id_reservation <> NEW.id_reservation
          AND r.statut_reservation IN ('EN_ATTENTE','CONFIRMEE')
          AND rc.date_arrivee_prevue < NEW.date_depart_prevue
          AND rc.date_depart_prevue > NEW.date_arrivee_prevue
    ) AND (SELECT statut_reservation FROM reservations_reservation
           WHERE id_reservation = NEW.id_reservation) IN ('EN_ATTENTE','CONFIRMEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est deja reservee sur tout ou partie de la periode.';
    END IF;
END$$

CREATE TRIGGER trg_resch_bu BEFORE UPDATE ON reservations_reservation_chambre FOR EACH ROW
BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_capacite INT;
    DECLARE v_etat VARCHAR(20);
    IF NEW.date_depart_prevue <= NEW.date_arrivee_prevue THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le depart doit etre posterieur a la date darrivee.';
    END IF;
    IF NEW.nb_occupants < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants doit etre superieur a zero.';
    END IF;
    SELECT cat.capacite, c.etat_physique INTO v_capacite, v_etat
        FROM chambres_chambre c
        JOIN chambres_categoriechambre cat ON cat.id_categorie = c.categorie_id
        WHERE c.id_chambre = NEW.id_chambre;
    IF v_etat = 'hors_service' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est hors service.';
    END IF;
    IF NEW.nb_occupants > v_capacite THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants depasse la capacite de la chambre.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM reservations_reservation_chambre rc
        JOIN reservations_reservation r ON r.id_reservation = rc.id_reservation
        WHERE rc.id_chambre = NEW.id_chambre
          AND rc.id <> OLD.id
          AND r.statut_reservation IN ('EN_ATTENTE','CONFIRMEE')
          AND rc.date_arrivee_prevue < NEW.date_depart_prevue
          AND rc.date_depart_prevue > NEW.date_arrivee_prevue
    ) AND (SELECT statut_reservation FROM reservations_reservation
           WHERE id_reservation = NEW.id_reservation) IN ('EN_ATTENTE','CONFIRMEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est deja reservee sur tout ou partie de la periode.';
    END IF;
END$$

CREATE TRIGGER trg_resch_ai AFTER INSERT ON reservations_reservation_chambre FOR EACH ROW
BEGIN
    UPDATE reservations_reservation SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation)
    WHERE id_reservation = NEW.id_reservation;
END$$

CREATE TRIGGER trg_resch_au AFTER UPDATE ON reservations_reservation_chambre FOR EACH ROW
BEGIN
    UPDATE reservations_reservation SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation)
    WHERE id_reservation = NEW.id_reservation;
END$$

CREATE TRIGGER trg_resch_ad AFTER DELETE ON reservations_reservation_chambre FOR EACH ROW
BEGIN
    UPDATE reservations_reservation SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM reservations_reservation_chambre WHERE id_reservation = OLD.id_reservation),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM reservations_reservation_chambre WHERE id_reservation = OLD.id_reservation)
    WHERE id_reservation = OLD.id_reservation;
END$$

CREATE TRIGGER trg_res_bu BEFORE UPDATE ON reservations_reservation FOR EACH ROW
BEGIN
    IF NEW.statut_reservation <> OLD.statut_reservation THEN
        IF OLD.statut_reservation IN ('ANNULEE','TERMINEE') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation annulee ou terminee ne peut plus changer de statut.';
        END IF;
        IF NEW.statut_reservation = 'CONFIRMEE' AND NOT EXISTS (
            SELECT 1 FROM reservations_reservation_chambre WHERE id_reservation = OLD.id_reservation) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation sans chambre ne peut pas etre confirmee.';
        END IF;
        IF NEW.statut_reservation = 'TERMINEE'
           AND OLD.statut_reservation <> 'CONFIRMEE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seule une reservation confirmee peut etre terminee.';
        END IF;
        IF NEW.statut_reservation = 'EN_ATTENTE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation confirmee ne peut pas revenir en attente.';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_res_bd BEFORE DELETE ON reservations_reservation FOR EACH ROW
BEGIN
    IF OLD.statut_reservation IN ('CONFIRMEE','TERMINEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation confirmee ou terminee ne peut pas etre supprimee.';
    END IF;
END$$

DELIMITER ;
