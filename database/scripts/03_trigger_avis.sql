-- =====================================================================
-- Module Clients + Avis (Safae) - Trigger
-- Base : hotel_bdr (MySQL)
--
-- Règle métier :
--   Un client ne peut déposer un avis que
--     (1) sur un séjour TERMINÉ (on ne note pas un séjour en cours ou annulé),
--     (2) et seulement si c'est lui le client de la réservation de ce séjour.
--
-- Le trigger est vérifié par la base elle-même : la règle est respectée
-- même si l'avis est inséré sans passer par l'application (script SQL,
-- autre programme, phpMyAdmin...).
-- =====================================================================

DROP TRIGGER IF EXISTS trg_avis_before_insert;
DROP TRIGGER IF EXISTS trg_avis_before_update;

DELIMITER $$

CREATE TRIGGER trg_avis_before_insert
BEFORE INSERT ON AVIS
FOR EACH ROW
BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_client_resa INT;

    -- statut du séjour et client de sa réservation
    SELECT s.statut_sejour, r.id_client
      INTO v_statut, v_client_resa
      FROM SEJOUR s
      JOIN RESERVATION r ON r.id_reservation = s.id_reservation
     WHERE s.id_sejour = NEW.id_sejour;

    IF v_statut IS NULL OR v_statut <> 'TERMINE' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Avis refuse : le sejour n''est pas termine.';
    END IF;

    IF v_client_resa <> NEW.id_client THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Avis refuse : le client n''est pas celui de la reservation du sejour.';
    END IF;
END$$

-- Même contrôle si on modifie le séjour ou le client d'un avis existant
CREATE TRIGGER trg_avis_before_update
BEFORE UPDATE ON AVIS
FOR EACH ROW
BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_client_resa INT;

    IF NEW.id_sejour <> OLD.id_sejour OR NEW.id_client <> OLD.id_client THEN
        SELECT s.statut_sejour, r.id_client
          INTO v_statut, v_client_resa
          FROM SEJOUR s
          JOIN RESERVATION r ON r.id_reservation = s.id_reservation
         WHERE s.id_sejour = NEW.id_sejour;

        IF v_statut IS NULL OR v_statut <> 'TERMINE' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Avis refuse : le sejour n''est pas termine.';
        END IF;

        IF v_client_resa <> NEW.id_client THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Avis refuse : le client n''est pas celui de la reservation du sejour.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- Tests du trigger (à lancer après avoir créé le trigger)
-- ---------------------------------------------------------------------
-- 1) Avis sur un séjour EN COURS -> doit être refusé (ERROR 1644)
--    INSERT INTO AVIS (date_avis, note, commentaire, id_client, id_sejour)
--    SELECT CURDATE(), 5, 'test', r.id_client, s.id_sejour
--      FROM SEJOUR s JOIN RESERVATION r ON r.id_reservation = s.id_reservation
--     WHERE s.statut_sejour = 'EN_COURS' LIMIT 1;
--
-- 2) Avis par un AUTRE client que celui de la réservation -> doit être refusé
--    INSERT INTO AVIS (date_avis, note, commentaire, id_client, id_sejour)
--    SELECT CURDATE(), 5, 'test', (SELECT MIN(c.id_client) FROM CLIENT c
--                                  WHERE c.id_client <> r.id_client), s.id_sejour
--      FROM SEJOUR s JOIN RESERVATION r ON r.id_reservation = s.id_reservation
--      LEFT JOIN AVIS a ON a.id_sejour = s.id_sejour
--     WHERE s.statut_sejour = 'TERMINE' AND a.id_avis IS NULL LIMIT 1;
