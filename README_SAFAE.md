# Module Clients + Avis (Safae)

## Backend Django (`backend/apps/clients`, `backend/apps/avis`)
- `Client` et `Avis` conformes au MLD (piece_identite UNIQUE, note 1..5 avec CHECK, un seul avis par séjour).
- API (Swagger : /api/docs/) :
  - `/api/clients/` (CRUD, recherche, filtres, `?page_size=100`), `/api/clients/{id}/historique/` (avis + réservations)
  - `/api/avis/` (CRUD, filtres `client, sejour, note, note_min, note_max, date_min, date_max`), `/api/avis/statistiques/`
- Règles métier :
  - un avis porte uniquement sur un séjour terminé ;
  - l'avis doit être rédigé par le client de la réservation du séjour ;
  - un seul avis par séjour ;
  - suppression d'un client refusée (409) s'il a des avis ou des réservations ;
  - téléphone obligatoire, pièce d'identité unique (normalisée en majuscules).

## Frontend React
- `pages/ClientsPage.jsx` : liste paginée, recherche, création/modification (react-hook-form), suppression, historique (modal).
- `pages/AvisPage.jsx` : liste, filtres (client, note, recherche), note moyenne + répartition, création/modification/suppression.
- `components/clients/StarRating.jsx`, `ClientHistoryModal.jsx`, `api/clientsAvis.js`.

## Tests (22)
- `python manage.py test apps.clients apps.avis --settings=config.settings_test`
- Les tests utilisent le vrai modèle Séjour de Hmza (réservation + chambre obligatoires),
  via les fonctions de `apps/clients/factories.py` (`creer_sejour`, `creer_reservation_chambre`).
- Ils nécessitent les migrations de `reservations` et de `sejours` (colonnes reservation, chambre,
  observations, date_archivage). Vérifié en local : 87 tests OK sur tout le projet avec ces migrations.

## Fichiers PARTAGÉS modifiés (ajouts uniquement)
1. `backend/config/urls.py` : +2 lignes `include('apps.clients.urls')` et `include('apps.avis.urls')`.
2. `frontend/src/api/index.js` : +1 export `clientsApi, avisApi` (à la fin du fichier).
