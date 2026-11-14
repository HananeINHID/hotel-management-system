# Module Clients + Avis (Safae)

## Backend Django (`backend/apps/clients`, `backend/apps/avis`)
- `Client` et `Avis` conformes au MLD (piece_identite UNIQUE, note 1..5 avec CHECK, un seul avis par séjour).
- API (Swagger : /api/docs/) :
  - `/api/clients/` (CRUD, recherche, filtres, `?page_size=100`), `/api/clients/{id}/historique/`
  - `/api/avis/` (CRUD, filtres `client, sejour, note, note_min, note_max, date_min, date_max`), `/api/avis/statistiques/`
- Règles métier : avis uniquement sur séjour terminé ; client = client de la réservation du séjour
  (vérifiée automatiquement dès que le vrai modèle Séjour de Hmza expose `reservation`) ; suppression d'un client avec avis -> 409.
- 18 tests : `python manage.py test apps.clients apps.avis --settings=config.settings_test`

## Frontend React
- `pages/ClientsPage.jsx` : liste paginée, recherche, création/modification (react-hook-form), suppression, historique (modal).
- `pages/AvisPage.jsx` : liste, filtres (client, note, recherche), note moyenne + répartition, création/modification/suppression.
- `components/clients/StarRating.jsx`, `ClientHistoryModal.jsx`, `api/clientsAvis.js`.

## Fichiers PARTAGÉS modifiés (2 seulement, ajouts uniquement)
1. `backend/config/urls.py` : +2 lignes `include('apps.clients.urls')` et `include('apps.avis.urls')`.
2. `frontend/src/api/index.js` : +1 export `clientsApi, avisApi` (à la fin du fichier).
Si ces fichiers ont changé sur `main` depuis, NE PAS écraser : ajouter seulement ces lignes à la main.

## À faire à l'intégration de Hmza (Séjours)
- Les champs utilisés sont `statut_sejour` (valeurs TERMINE...) et `reservation` (FK -> client). Ajuster `STATUTS_SEJOUR_TERMINE` dans `apps/avis/serializers.py` si ses valeurs diffèrent.
