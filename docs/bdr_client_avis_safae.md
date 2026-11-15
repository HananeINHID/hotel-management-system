# Partie Safae : Client + Avis (base hotel_bdr)

Partie base de données du module Client + Avis, écrite pour la base `hotel_bdr`
(noms de tables du MLD : CLIENT, AVIS, SEJOUR, RESERVATION, CHAMBRE).
Testée sur MySQL 8.0.46.

| Fichier | Contenu | Point de la consigne |
|---|---|---|
| 03_trigger_avis.sql | triggers `trg_avis_before_insert` et `trg_avis_before_update` | 7. Trigger |
| 04_requetes_client_avis.sql | 6 requêtes : filtre, jointure, GROUP BY, sous-requête, 2 requêtes élaborées | 8. Requêtes |
| 05_index_client_avis.sql | 2 index + EXPLAIN avant/après | 9. Indexation et optimisation |
| 06_acces_python_client_avis.py | connexion MySQL, requêtes, affichage, démonstration du trigger | 10. Accès via Python |

Les tables CLIENT et AVIS et leurs données sont dans les scripts communs de la base
(`01_create_tables.sql` et `02_insert_data.sql`), à lancer avant.

## Ordre d'exécution

1. `01_create_tables.sql` puis `02_insert_data.sql` (base hotel_bdr)
2. `03_trigger_avis.sql`, `04_requetes_client_avis.sql`, `05_index_client_avis.sql`
   (MySQL Workbench : File > Open SQL Script, puis l'éclair)
3. `pip install mysql-connector-python`
   `python 06_acces_python_client_avis.py --user root`  (le mot de passe est demandé)

`05_index_client_avis.sql` crée les index : pour le relancer, supprimer d'abord les deux
index (commandes DROP INDEX à la fin du fichier).

## Contraintes de CLIENT et AVIS (dans 01_create_tables.sql)

- `uq_client_piece_identite` : deux clients ne peuvent pas avoir la même CIN ou le même passeport.
- `chk_avis_note` : CHECK (note BETWEEN 1 AND 5).
- `uq_avis_sejour` : un seul avis par séjour (cardinalité (0,1) de EVALUER côté séjour).
- `fk_avis_client`, `fk_avis_sejour` : ON DELETE RESTRICT, on ne supprime pas un client ou un
  séjour qui a des avis.

## Trigger

Règle métier : un avis ne peut être déposé que sur un séjour **terminé**, et uniquement par
le **client de la réservation** de ce séjour (règle du MLD non garantie par les clés).

Un CHECK ne suffit pas : il ne voit qu'une ligne de la table AVIS, alors que la règle dépend
de SEJOUR (statut) et de RESERVATION (client). Le trigger `BEFORE INSERT` lit ces deux
informations et bloque l'insertion avec `SIGNAL SQLSTATE '45000'`. Le trigger `BEFORE UPDATE`
fait le même contrôle si on change le séjour ou le client d'un avis.

Tests (MySQL 8.0.46) :
- avis sur le séjour 7 (en cours) : refusé, « Avis refuse : le sejour n'est pas termine. »
- avis de Sara (client 1) sur le séjour 5, réservé par Imane : refusé,
  « Avis refuse : le client n'est pas celui de la reservation du sejour. »
- avis d'Imane (client 5) sur le séjour 5 : accepté

## Index

| Index | Requête testée | EXPLAIN avant | EXPLAIN après |
|---|---|---|---|
| `idx_client_nom_prenom` sur CLIENT (nom, prenom) | clients dont le nom commence par « Al », triés par nom, prénom | type ALL, Using where; Using filesort | type range, key idx_client_nom_prenom, Using index condition |
| `idx_avis_note_date` sur AVIS (note, date_avis) | avis 5 étoiles, les plus récents d'abord | type ALL, Using where; Using filesort | type ref, key idx_avis_note_date, Backward index scan; Using index |

Justification :
- `type ALL` : MySQL lit toute la table. `Using filesort` : il trie en plus le résultat.
  Ce coût grandit avec le nombre de clients et d'avis.
- Index (nom, prenom) : MySQL ne lit que les noms qui commencent par le texte cherché,
  déjà rangés par nom puis prénom. C'est la recherche et le tri de la liste des clients.
- Index (note, date_avis) : MySQL va directement aux avis de la note demandée, déjà rangés
  par date. Il lit l'index à l'envers (Backward index scan) pour avoir les plus récents
  d'abord, et l'index suffit à répondre (Using index) : ni lecture de la table, ni tri.
  C'est le filtre par note de la liste des avis.

## Requêtes (04_requetes_client_avis.sql)

- R1 sélection et filtrage : clients marocains ayant un email
- R2 jointure (AVIS, CLIENT, SEJOUR, CHAMBRE) : chaque avis avec client, chambre et dates
- R3 GROUP BY : nombre d'avis, moyenne, min et max par nationalité
- R4 sous-requête : clients sans aucun avis, avec leur nombre de réservations
- R5 élaborée : répartition des notes en pourcentage (fonction de fenêtre `SUM() OVER ()`)
- R6 élaborée : clients dont la moyenne dépasse la moyenne générale (sous-requête dans HAVING)

## Programme Python

`06_acces_python_client_avis.py` (bibliothèque mysql-connector-python) :
1. `mysql.connector.connect(...)` : connexion à hotel_bdr ;
2. `cursor.execute(sql, params)` : exécution, avec paramètres `%s` (protection contre
   l'injection SQL) ;
3. `cursor.fetchall()` : récupération et affichage en tableau ;
4. tentative d'avis sur un séjour en cours : l'erreur du trigger est interceptée et
   affichée, puis annulée (`rollback`).
