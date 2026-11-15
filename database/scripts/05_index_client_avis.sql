-- =====================================================================
-- Module Clients + Avis (Safae) - Indexation et optimisation
-- Base : hotel_bdr (MySQL)
--
-- Méthode : pour chaque index
--   1. EXPLAIN de la requête AVANT l'index
--   2. création de l'index
--   3. EXPLAIN de la même requête APRÈS l'index
-- =====================================================================

-- ---------------------------------------------------------------------
-- INDEX 1 : CLIENT (nom, prenom)
-- Justification : la page Clients liste les clients triés par nom puis
-- prénom, et la recherche se fait surtout par début de nom.
-- Sans index, MySQL lit toute la table puis la trie (filesort).
-- ---------------------------------------------------------------------

-- 1. Avant
EXPLAIN
SELECT id_client, nom, prenom, telephone
FROM CLIENT
WHERE nom LIKE 'Al%'
ORDER BY nom, prenom;
-- Résultat obtenu (MySQL 8.0) : type = ALL, key = NULL, Extra = Using where; Using filesort

-- 2. Création
CREATE INDEX idx_client_nom_prenom ON CLIENT (nom, prenom);

-- 3. Après
EXPLAIN
SELECT id_client, nom, prenom, telephone
FROM CLIENT
WHERE nom LIKE 'Al%'
ORDER BY nom, prenom;
-- Résultat obtenu (MySQL 8.0) : type = range, key = idx_client_nom_prenom,
-- Extra = Using index condition (plus de filesort : l'index est déjà trié)


-- ---------------------------------------------------------------------
-- INDEX 2 : AVIS (note, date_avis)
-- Justification : la page Avis filtre par note (ex. tous les avis 5 étoiles)
-- et affiche les plus récents d'abord (ORDER BY date_avis DESC).
-- L'index composé sert à la fois au filtre (note) et au tri (date_avis).
-- ---------------------------------------------------------------------

-- 1. Avant
EXPLAIN
SELECT id_avis, note, date_avis
FROM AVIS
WHERE note = 5
ORDER BY date_avis DESC;
-- Résultat obtenu (MySQL 8.0) : type = ALL, key = NULL, Extra = Using where; Using filesort

-- 2. Création
CREATE INDEX idx_avis_note_date ON AVIS (note, date_avis);

-- 3. Après
EXPLAIN
SELECT id_avis, note, date_avis
FROM AVIS
WHERE note = 5
ORDER BY date_avis DESC;
-- Résultat obtenu (MySQL 8.0) : type = ref, key = idx_avis_note_date, ref = const,
-- Extra = Backward index scan; Using index
-- (index couvrant : la requête est servie par l'index seul, sans lire la table ;
--  l'index est lu à l'envers pour obtenir directement l'ordre date décroissante,
--  donc plus de filesort)


-- ---------------------------------------------------------------------
-- Vérifier les index présents
-- ---------------------------------------------------------------------
SHOW INDEX FROM CLIENT;
SHOW INDEX FROM AVIS;

-- Pour rejouer la comparaison, supprimer les index puis relancer le script :
-- DROP INDEX idx_client_nom_prenom ON CLIENT;
-- DROP INDEX idx_avis_note_date ON AVIS;
