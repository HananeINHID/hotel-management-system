-- =====================================================================
-- Module Clients + Avis (Safae) - Requêtes principales
-- Base : hotel_bdr (MySQL)
-- =====================================================================

-- ---------------------------------------------------------------------
-- R1. Sélection et filtrage
-- Clients de nationalité marocaine ayant une adresse email, triés par nom.
-- ---------------------------------------------------------------------
SELECT id_client, nom, prenom, telephone, email
FROM CLIENT
WHERE nationalite = 'Marocaine'
  AND email IS NOT NULL
ORDER BY nom, prenom;

-- ---------------------------------------------------------------------
-- R2. Jointure (4 tables)
-- Chaque avis avec le nom du client, la chambre et les dates du séjour.
-- ---------------------------------------------------------------------
SELECT a.id_avis,
       CONCAT(c.prenom, ' ', c.nom)  AS client,
       ch.numero_chambre             AS chambre,
       DATE(s.arrivee_reelle)        AS arrivee,
       DATE(s.depart_reel)           AS depart,
       a.note,
       a.commentaire
FROM AVIS a
JOIN CLIENT   c  ON c.id_client   = a.id_client
JOIN SEJOUR   s  ON s.id_sejour   = a.id_sejour
JOIN CHAMBRE ch ON ch.id_chambre = s.id_chambre
ORDER BY a.date_avis DESC;

-- ---------------------------------------------------------------------
-- R3. Agrégation avec GROUP BY
-- Nombre d'avis et note moyenne par nationalité.
-- ---------------------------------------------------------------------
SELECT c.nationalite,
       COUNT(a.id_avis)       AS nb_avis,
       ROUND(AVG(a.note), 2)  AS note_moyenne,
       MIN(a.note)            AS note_min,
       MAX(a.note)            AS note_max
FROM CLIENT c
JOIN AVIS a ON a.id_client = c.id_client
GROUP BY c.nationalite
ORDER BY note_moyenne DESC;

-- ---------------------------------------------------------------------
-- R4. Sous-requête
-- Clients n'ayant jamais laissé d'avis, avec leur nombre de réservations
-- (sous-requête NOT IN + sous-requête corrélée dans le SELECT).
-- ---------------------------------------------------------------------
SELECT c.id_client, c.nom, c.prenom,
       (SELECT COUNT(*) FROM RESERVATION r WHERE r.id_client = c.id_client) AS nb_reservations
FROM CLIENT c
WHERE c.id_client NOT IN (SELECT a.id_client FROM AVIS a)
ORDER BY nb_reservations DESC, c.nom;

-- ---------------------------------------------------------------------
-- R5. Requête élaborée : répartition des notes en pourcentage
-- (agrégation + fonction de fenêtre SUM() OVER ()).
-- ---------------------------------------------------------------------
SELECT note,
       COUNT(*) AS nb_avis,
       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pourcentage
FROM AVIS
GROUP BY note
ORDER BY note DESC;

-- ---------------------------------------------------------------------
-- R6. Requête élaborée : clients dont la note moyenne est supérieure
-- à la moyenne générale de l'hôtel (sous-requête dans HAVING).
-- ---------------------------------------------------------------------
SELECT CONCAT(c.prenom, ' ', c.nom) AS client,
       COUNT(a.id_avis)             AS nb_avis,
       ROUND(AVG(a.note), 2)        AS moyenne_client
FROM CLIENT c
JOIN AVIS a ON a.id_client = c.id_client
GROUP BY c.id_client, c.prenom, c.nom
HAVING AVG(a.note) > (SELECT AVG(note) FROM AVIS)
ORDER BY moyenne_client DESC, nb_avis DESC;
