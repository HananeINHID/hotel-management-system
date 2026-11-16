# Module Karima : Paiements, Services, Consommations & Employés

Projet : **Système de Gestion Hôtelière (Hotel Management System)**  
Auteur : **Karima** (Développeur Full-Stack Django REST Framework + React)

---

## 1. Périmètre et Fonctionnalités du Module

Le module de Karima prend en charge l'ensemble de la gestion opérationnelle et financière liée aux prestations et au personnel :
1. **Catalogue des Services** (`/api/services/`) : CRUD, classification par type (Restauration, Spa, Blanchisserie, Transport, Minibar, Autre), tarification unitaire, interdiction de suppression si consommations existantes (code HTTP 409).
2. **Consommations de Services** (`/api/consommations/`) : imputation sur un séjour, recopie automatique du prix unitaire du service, calcul dynamique du montant total de ligne, interdiction formelle d'imputation sur séjour archivé ou terminé.
3. **Paiements** (`/api/paiements/`) : encaissement multi-moyens (espèces, carte, virement, chèque), génération automatique de référence unique (`PAY-AAAAMMJJ-XXXX`), contrôle d'éligibilité de l'employé (statut ACTIF obligatoire), contrôle de non-dépassement du solde dû, actions métier `POST /{id}/valider/` et `POST /{id}/rembourser/`, verrouillage strict des paiements validés contre modification/suppression.
4. **Employés** (`/api/employes/`) : suivi du personnel par poste et statut, validation d'email unique, modification rapide de statut d'activité, règle de traçabilité financière (la suppression d'un employé ayant encaissé des paiements bascule son statut à `INACTIF` au lieu d'une suppression physique).
5. **Résumé Financier du Séjour** (`/api/sejours/{id}/resume-financier/`) : consolidation en temps réel des consommations, total facturé, total encaissé validé, reste à régler et indicateur de solde.
6. **Tableau de Bord** (`/api/dashboard/stats/`) : indicateurs du jour (recettes encaissées, paiements en attente, services les plus consommés, dernières transactions).
7. **Documentation Interactive Swagger / OpenAPI 3.0** (`/api/docs/` et `/api/redoc/`).

---

## 2. Démarrage Rapide

### Backend (Django)
```powershell
cd backend

# 1. Activation de l'environnement virtuel existant
.\venv\Scripts\Activate.ps1

# 2. Installation des nouvelles dépendances (django-filter, drf-spectacular)
pip install -r requirements.txt

# 3. Application des migrations sur MySQL (hotel_management)
python manage.py migrate

# 4. Injection du jeu d'essai (8 services, 10 employés, séjours stubs, consommations, paiements)
python manage.py seed_data

# 5. Lancement des tests unitaires (17 tests validés)
python manage.py test apps.employes apps.services apps.paiements

# 6. Démarrage du serveur Django
python manage.py runserver
```
*Le backend tourne sur `http://127.0.0.1:8000`.*  
*Documentation Swagger disponible sur [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/).*

---

### Frontend (React + Vite + Tailwind CSS)
```powershell
cd frontend

# 1. Installation des dépendances (y compris react-hook-form et tailwindcss)
npm install

# 2. Lancement du serveur de développement
npm run dev
```
*L'application s'ouvre sur [http://localhost:5173](http://localhost:5173).*

---

## 3. Intégration avec les autres modules

- **Module Séjours (Hmza)** :
  - Clé étrangère déclarée par chaîne : `ForeignKey('sejours.Sejour', on_delete=models.PROTECT)`
  - App temporaire `apps.stubs` fournie avec un modèle minimal `Sejour` (`id_sejour`, `arrivee_reelle`, `depart_reel`, `statut_sejour`, `est_archive`).
  - Toutes les requêtes d'accès aux séjours sont isolées dans `backend/apps/paiements/selectors.py`.
  - Lors de l'intégration du vrai modèle de Hmza :
    1. Retirer `'apps.stubs'` de `INSTALLED_APPS` dans `settings.py`.
    2. Retirer l'import stub dans `backend/apps/sejours/models.py` et y coller le modèle complet de Hmza.
    3. Supprimer le dossier `backend/apps/stubs/`.
- **Module Maintenance (Hanane)** :
  - Le modèle `Maintenance` d'Hanane référence `employes.Employe`. Notre modèle `Employe` est immédiatement compatible et interconnecté sans aucune erreur.
