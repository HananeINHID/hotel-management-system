# 🏨 Riad Atlas — Système de Gestion Hôtelière

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.2-green?logo=django)
![DRF](https://img.shields.io/badge/DRF-3.18-red)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)

**Projet universitaire — Master Data & IA — INPT**  
Système de gestion hôtelière complet pour l'hôtel fictif *Riad Atlas*, développé par une équipe de 5 étudiants.

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Membres de l'équipe et modules](#2-membres-de-léquipe-et-modules)
3. [Technologies](#3-technologies)
4. [Architecture du projet](#4-architecture-du-projet)
5. [Prérequis](#5-prérequis)
6. [Installation — Windows](#6-installation--windows)
7. [Installation — Linux](#7-installation--linux)
8. [Configuration de la base de données](#8-configuration-de-la-base-de-données)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Démarrage rapide](#10-démarrage-rapide)
11. [Données fictives et peuplement](#11-données-fictives-et-peuplement)
12. [Modules et fonctionnalités](#12-modules-et-fonctionnalités)
13. [Base de données](#13-base-de-données)
14. [API REST — Endpoints](#14-api-rest--endpoints)
15. [Interface React](#15-interface-react)
16. [Tests](#16-tests)
17. [Git et branches](#17-git-et-branches)
18. [Résolution de problèmes](#18-résolution-de-problèmes)

---

## 1. Présentation du projet

Le *Riad Atlas* est un hôtel fictif servant de base pédagogique.  
L'application permet de gérer :

- Les **clients** et leurs avis après séjour
- Les **chambres** par catégorie et leurs maintenances
- Les **réservations** multichambre avec calcul automatique du montant
- Les **séjours** (check-in / check-out) et leur résumé financier
- Les **services** et **consommations** associés à un séjour
- Les **paiements** (validation, remboursement)
- Les **employés** de l'hôtel
- Un **tableau de bord** avec statistiques

La base de données MySQL contient **9 triggers** répartis sur les modules Réservations (Salma) et Clients/Avis (Safae), ainsi que **2 index** optimisés avec EXPLAIN avant/après.

---

## 2. Membres de l'équipe et modules

| Membre | Module(s) | Pages React | Fiche individuelle |
|--------|-----------|-------------|--------------------|
| **Karima** | Services, Consommations, Paiements, Employés, Dashboard | `ServicesPage`, `ConsommationsPage`, `PaiementsPage`, `EmployesPage`, `ResumeFinancierPage`, `Dashboard` | [`README_KARIMA.md`](docs/contributions/README_KARIMA.md) |
| **Hamza** | Séjours + Archivage (check-in/check-out) | `SejoursPage` | [`README_HAMZA.md`](docs/contributions/README_HAMZA.md) |
| **Safae** | Clients, Avis | `ClientsPage`, `AvisPage` | [`README_SAFAE.md`](docs/contributions/README_SAFAE.md) |
| **Salma** | Réservations (multichambre), 7 triggers MySQL | `ReservationsPage` | [`README_SALMA.md`](docs/contributions/README_SALMA.md) |
| **Hanane** | Chambres, Catégories, Maintenances | `ChambresPage`, `MaintenancesPage` | Intégrée au README principal |

---

## 3. Technologies

| Composant | Technologie | Version vérifiée |
|-----------|-------------|-----------------|
| Backend | Python | 3.13.12 |
| Framework backend | Django + DRF | 5.2.18 / 3.18.3 |
| Pilote MySQL | mysqlclient | 2.3.0 |
| Base de données | MySQL | 8.0 |
| Documentation API | drf-spectacular (Swagger) | ≥ 0.27.0 |
| CORS | django-cors-headers | 4.9.0 |
| Variables d'env | python-dotenv | 1.2.4 |
| Framework frontend | React | 19.2.0 |
| Bundler | Vite | 7.1.12 |
| CSS | Tailwind CSS | 3.4.19 |
| Routeur | react-router-dom | 7.18.5 |
| Client HTTP | axios | 1.21.0 |
| Icônes | lucide-react | 1.66.0 |

---

## 4. Architecture du projet

```
hotel-management-system/
├── backend/                        # Django REST Framework
│   ├── apps/
│   │   ├── avis/                   # Avis clients (Safae)
│   │   ├── chambres/               # Chambres + Catégories (Hanane)
│   │   ├── clients/                # Gestion clients (Safae)
│   │   ├── employes/               # Employés (Karima)
│   │   ├── maintenances/           # Maintenances chambres (Hanane)
│   │   ├── paiements/              # Paiements (Karima)
│   │   ├── reservations/           # Réservations multichambre (Salma)
│   │   ├── sejours/                # Séjours check-in/out (Hamza)
│   │   ├── services/               # Services + Consommations (Karima)
│   │   └── stubs/                  # Compatibilité inter-modules
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── views.py                # health check
│   ├── manage.py
│   ├── requirements.txt
│   └── venv/                       # Environnement virtuel (non commité)
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── api/                    # Clients API Axios
│   │   ├── components/             # Composants réutilisables (layout, common, reservations, clients)
│   │   ├── hooks/                  # useToast
│   │   ├── pages/                  # 12 pages (une par module)
│   │   ├── routes/AppRouter.jsx    # Routeur principal
│   │   ├── services/               # Couche service (api.js, chambresMaintenances.js)
│   │   └── utils/                  # Formateurs et helpers
│   └── package.json
├── database/
│   ├── dumps/                      # Dump complet portable (hotel_management_complet.sql)
│   ├── mcd/                        # Modèle Conceptuel de Données (fichiers à ajouter)
│   ├── mld/                        # Modèle Logique de Données (fichiers à ajouter)
│   ├── sample_data/
│   │   └── donnees_fictives_hotel.json   # 217 enregistrements Riad Atlas
│   └── scripts/
│       ├── create_database.sql
│       ├── triggers_reservations.sql     # 7 triggers (Salma)
│       ├── 03_trigger_avis.sql           # 2 triggers (Safae)
│       ├── 04_requetes_client_avis.sql   # Requêtes variées
│       ├── 05_index_client_avis.sql      # 2 index + EXPLAIN avant/après
│       ├── 06_acces_python_client_avis.py # Accès MySQL via Python
│       ├── restaurer_base.ps1            # Restauration automatisée Windows
│       └── restaurer_base.sh             # Restauration automatisée Linux
├── docs/
│   └── contributions/              # Fiches détaillées individuelles des membres
│       ├── README_HAMZA.md
│       ├── README_KARIMA.md
│       ├── README_SAFAE.md
│       └── README_SALMA.md
├── README.md                       # Documentation centrale unique
└── .gitignore
```

---

## 5. Prérequis

Installe les outils suivants avant de commencer.

| Outil | Version minimale | Lien |
|-------|-----------------|------|
| Git | 2.x | https://git-scm.com |
| Python | **3.13** | https://python.org |
| Node.js | **20+** | https://nodejs.org |
| MySQL | **8.0** | https://dev.mysql.com |

### Windows — dépendances pour `mysqlclient`

`mysqlclient` requiert les en-têtes MySQL. Installe **MySQL Connector/C** (inclus dans MySQL 8.0 Installer) ou **Visual C++ Build Tools** :

```
winget install Microsoft.VisualStudio.2022.BuildTools
```

Vérifie que `mysql_config` est accessible depuis PowerShell, ou que `mysqlclient` est installé via le wheel pré-compilé (ce qui est le cas si MySQL 8.0 est installé).

---

## 6. Installation — Windows

Toutes les commandes ci-dessous s'exécutent dans **PowerShell**.

### 6.1 Cloner le dépôt

```powershell
git clone https://github.com/HananeINHID/hotel-management-system.git
cd hotel-management-system
```

### 6.2 Backend Django

```powershell
cd backend

# Créer et activer l'environnement virtuel
python -m venv venv
.\venv\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt
```

### 6.3 Configurer les variables d'environnement

```powershell
# Depuis le dossier backend/
Copy-Item .env.example .env
notepad .env
```

Remplis les valeurs (voir [Section 9](#9-variables-denvironnement)) :

```env
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=TonMotDePasse
DB_HOST=127.0.0.1
DB_PORT=3307
DJANGO_SECRET_KEY=une-cle-secrete-longue-et-aleatoire
DJANGO_DEBUG=True
```

> **Port MySQL :** le projet utilise le port **3307** (non standard). Si ton MySQL écoute sur 3306, change `DB_PORT=3306`.

### 6.4 Créer la base de données MySQL

```powershell
# Ouvre une session MySQL (adapte le port et l'utilisateur)
mysql -u root -p --port=3307 -e "CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 6.5 Appliquer les migrations

```powershell
# Depuis backend/ avec le venv activé
python manage.py migrate
```

Vérifie que toutes les migrations sont appliquées :

```powershell
python manage.py showmigrations
```

Toutes les cases doivent afficher `[X]`. Si une migration est en `[ ]`, relis [Section 18](#18-résolution-de-problèmes).

### 6.6 Peupler la base de données

```powershell
# Aperçu sans modification (dry-run)
python manage.py import_demo_hotel --dry-run

# Importation réelle (additive, idempotente)
python manage.py import_demo_hotel --apply
```

Cette commande importe 217 enregistrements pédagogiques cohérents (Riad Atlas) sans écraser les données existantes.

### 6.7 Démarrer le backend

```powershell
# Depuis backend/ avec le venv activé
python manage.py runserver
```

Le backend est accessible sur : **http://127.0.0.1:8000**  
Swagger UI : **http://127.0.0.1:8000/api/docs/**

### 6.8 Frontend React

Ouvre un **second terminal PowerShell** :

```powershell
cd hotel-management-system\frontend

# Installer les dépendances npm
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend est accessible sur : **http://localhost:5173**

---

## 7. Installation — Linux

> ⚠️ **Non testée localement** (environnement de développement : Windows uniquement). Les commandes ci-dessous sont fournies à titre indicatif et doivent être adaptées à ta distribution.

### 7.1 Dépendances système

```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install python3.13 python3.13-venv python3.13-dev \
     libmysqlclient-dev pkg-config build-essential \
     mysql-server nodejs npm git

# Fedora/RHEL
sudo dnf install python3.13 python3.13-devel \
     mysql-devel gcc nodejs npm git
```

### 7.2 Backend

```bash
git clone https://github.com/HananeINHID/hotel-management-system.git
cd hotel-management-system/backend

python3.13 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
nano .env   # adapter les variables

# Démarrer MySQL si nécessaire
sudo systemctl start mysql

# Créer la base
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

python manage.py migrate
python manage.py import_demo_hotel --apply
python manage.py runserver
```

### 7.3 Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 8. Configuration de la base de données

### Scénario A — Base fraîche (recommandé pour une installation initiale)

1. Créer la base vide (voir [Section 6.4](#64-créer-la-base-de-données-mysql))
2. `python manage.py migrate` → applique le schéma complet
3. `python manage.py import_demo_hotel --apply` → peuple les 217 enregistrements pédagogiques

Les triggers du module réservations sont installés automatiquement par la migration `reservations/0002_triggers.py`.

---

### Scénario B — Restauration rapide et sécurisée pour l'équipe (Recommandé en cas de conflit de migration)

> 💡 **Cas d'usage :** Si un membre de l'équipe rencontre des erreurs de migration (notamment sur `sejours 0003`, `0004` ou `0005` dues à d'anciens séjours sans réservations/clients associés), **ne pas utiliser `--fake`**.  
> Utilisez plutôt le dump complet vérifié du projet : `database/dumps/hotel_management_complet.sql`.  
> Il contient le schéma complet, les 351 enregistrements, les 9 triggers, les 2 index optimisés et les 33 migrations Django enregistrées.

#### Option 1 : Script automatisé avec protection contre l'écrasement

Le script vérifie si la base existe et **demande une confirmation explicite** avant toute action. Il permet aussi d'importer dans une nouvelle base (ex: `hotel_management_work`) sans toucher à votre base locale existante.

**Sous Windows (PowerShell) :**
```powershell
.\database\scripts\restaurer_base.ps1
```

**Sous Linux / macOS (Bash) :**
```bash
chmod +x database/scripts/restaurer_base.sh
./database/scripts/restaurer_base.sh
```

#### Option 2 : Restauration manuelle pas-à-pas

**Windows (PowerShell) :**
```powershell
# 1. Créer la base si inexistante
mysql -u root -p --port=3307 -e "CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Importer le dump via MySQL source (évite les corruptions d'encodage PowerShell UTF-16)
$dump = (Resolve-Path "database\dumps\hotel_management_complet.sql").Path.Replace('\', '/')
mysql -u root -p --port=3307 --default-character-set=utf8mb4 -e "USE hotel_management; source $dump;"
```

**Linux (Bash) :**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p --default-character-set=utf8mb4 hotel_management < database/dumps/hotel_management_complet.sql
```

#### 3. Vérification immédiate avec Django :
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py showmigrations    # Toutes les migrations doivent afficher [X]
python manage.py migrate --plan     # Doit indiquer : No planned migration operations.
python manage.py check              # Doit afficher : System check identified no issues
```

Consulter le guide détaillé : [`database/RESTAURATION.md`](database/RESTAURATION.md).

### Schéma de référence

Le fichier `database/scripts/create_database.sql` contient le DDL complet de référence.

Les triggers se trouvent dans :
- `database/scripts/triggers_reservations.sql` — 7 triggers du module Réservations
- `database/scripts/03_trigger_avis.sql` — 2 triggers du module Avis

---

## 9. Variables d'environnement

### `backend/.env`

```env
# Django
DJANGO_SECRET_KEY=remplace-par-une-cle-longue-et-aleatoire
DJANGO_DEBUG=True

# Base de données MySQL
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=ton_mot_de_passe_mysql
DB_HOST=127.0.0.1
DB_PORT=3307
```

Générer une clé secrète :

```powershell
# Windows PowerShell
.\venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### `frontend/.env` (optionnel)

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Si absent, le frontend utilise `http://127.0.0.1:8000/api` par défaut (valeur codée dans `src/services/api.js`).

---

## 10. Démarrage rapide

### Terminal 1 — Backend

```powershell
cd hotel-management-system\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Terminal 2 — Frontend

```powershell
cd hotel-management-system\frontend
npm run dev
```

Ouvre **http://localhost:5173** dans ton navigateur.

---

## 11. Données fictives et peuplement

### Commande `import_demo_hotel`

```powershell
# Aperçu — ne modifie rien
python manage.py import_demo_hotel --dry-run

# Importation réelle
python manage.py import_demo_hotel --apply

# Fichier JSON personnalisé
python manage.py import_demo_hotel --apply --file chemin/vers/fichier.json
```

**Garanties :**
- **Additive** : n'écrase jamais les données existantes
- **Idempotente** : relancer la commande deux fois produit le même résultat
- **Transactionnelle** : en cas d'erreur, tout est annulé (rollback complet)
- **Respecte les triggers** : séquence d'insertion conforme aux règles métier
- **Préserve les séjours historiques** : les 15 séjours originaux restent intacts

### Source de données

Fichier : `database/sample_data/donnees_fictives_hotel.json`  
Contenu : 217 enregistrements pédagogiques — catégories, chambres, clients, employés, réservations, séjours, services, consommations, paiements, maintenances, avis.

### Commande `seed_data` (Karima)

```powershell
python manage.py seed_data
```

Peuple les services, employés et données de base. Peut être utilisée en complément de `import_demo_hotel`.

---

## 12. Modules et fonctionnalités

| Module | Statut | Fonctionnalités |
|--------|--------|-----------------|
| **Chambres** (Hanane) | ✅ Terminé | CRUD chambres et catégories, état physique, tarif nuit |
| **Maintenances** (Hanane) | ✅ Terminé | Suivi des interventions, statut, assignation employé |
| **Clients** (Safae) | ✅ Terminé | CRUD clients, historique des séjours, filtres avancés |
| **Avis** (Safae) | ✅ Terminé | Dépôt d'avis post-séjour, statistiques, trigger de validation |
| **Réservations** (Salma) | ✅ Terminé | Réservation multichambre, disponibilités, 7 triggers MySQL |
| **Séjours** (Hamza) | ✅ Terminé | Check-in/check-out, archivage, résumé financier |
| **Services** (Karima) | ✅ Terminé | Catalogue de services hôteliers |
| **Consommations** (Karima) | ✅ Terminé | Lien séjour ↔ service, quantité, montant |
| **Paiements** (Karima) | ✅ Terminé | Validation, remboursement, suivi statut |
| **Employés** (Karima) | ✅ Terminé | CRUD employés, poste, département |
| **Dashboard** (Karima) | ✅ Terminé | Statistiques générales de l'hôtel |

---

## 13. Base de données

### Entités principales

| Table Django | Table MySQL | Description |
|--------------|-------------|-------------|
| `chambres_categoriechambre` | `chambres_categoriechambre` | Catégories (Standard, Deluxe, Suite…) |
| `chambres_chambre` | `chambres_chambre` | Chambres (numéro, étage, état) |
| `clients_client` | `clients_client` | Clients de l'hôtel |
| `employes_employe` | `employes_employe` | Employés |
| `reservations_reservation` | `reservations_reservation` | Réservations |
| `reservations_reservation_chambre` | `reservations_reservation_chambre` | Association réservation ↔ chambre (multichambre) |
| `sejours_sejour` | `sejours_sejour` | Séjours (check-in/check-out réels) |
| `services_service` | `services_service` | Services hôteliers |
| `services_consommation` | `services_consommation` | Consommations (séjour ↔ service) |
| `paiements_paiement` | `paiements_paiement` | Paiements |
| `maintenances_maintenance` | `maintenances_maintenance` | Interventions de maintenance |
| `avis_avis` | `avis_avis` | Avis post-séjour |

### Triggers MySQL

#### Module Réservations (Salma) — 7 triggers

| Trigger | Événement | Règle métier |
|---------|-----------|--------------|
| `trg_resch_bi` | BEFORE INSERT sur `reservation_chambre` | Valide dates, occupants, état chambre, conflits de disponibilité |
| `trg_resch_bu` | BEFORE UPDATE sur `reservation_chambre` | Mêmes contrôles en mise à jour |
| `trg_resch_ai` | AFTER INSERT sur `reservation_chambre` | Recalcule `nb_personnes_total` et `montant_estime` |
| `trg_resch_au` | AFTER UPDATE sur `reservation_chambre` | Recalcule `nb_personnes_total` et `montant_estime` |
| `trg_resch_ad` | AFTER DELETE sur `reservation_chambre` | Recalcule `nb_personnes_total` et `montant_estime` |
| `trg_res_bu` | BEFORE UPDATE sur `reservation` | Interdit les transitions de statut illégales |
| `trg_res_bd` | BEFORE DELETE sur `reservation` | Interdit la suppression d'une réservation confirmée/terminée |

#### Module Clients & Avis (Safae) — 2 triggers

| Trigger | Événement | Règle métier |
|---------|-----------|--------------|
| `trg_avis_before_insert` | BEFORE INSERT sur `avis` | Avis uniquement sur séjour TERMINÉ, par le bon client |
| `trg_avis_before_update` | BEFORE UPDATE sur `avis` | Mêmes contrôles en mise à jour |

### Index d'optimisation (Safae)

| Index | Table | Colonnes | Justification |
|-------|-------|----------|---------------|
| `idx_client_nom_prenom` | CLIENT | (nom, prenom) | Tri/recherche par nom — élimine le filesort |
| `idx_avis_note_date` | AVIS | (note, date_avis) | Filtre par note + tri par date — index couvrant |

Résultats EXPLAIN (MySQL 8.0) :
- Avant `idx_client_nom_prenom` : `type=ALL, key=NULL, Extra=Using where; Using filesort`
- Après `idx_client_nom_prenom` : `type=range, key=idx_client_nom_prenom, Extra=Using index condition`
- Avant `idx_avis_note_date` : `type=ALL, key=NULL, Extra=Using where; Using filesort`
- Après `idx_avis_note_date` : `type=ref, key=idx_avis_note_date, Extra=Backward index scan; Using index`

Scripts complets : [`database/scripts/05_index_client_avis.sql`](database/scripts/05_index_client_avis.sql)

### Accès Python direct à MySQL

Le fichier [`database/scripts/06_acces_python_client_avis.py`](database/scripts/06_acces_python_client_avis.py) démontre l'accès direct à MySQL via `mysql-connector-python` (hors Django ORM) : requêtes variées, trigger en action.

```bash
pip install mysql-connector-python
python database/scripts/06_acces_python_client_avis.py --user root --password monmotdepasse
```

### Requêtes SQL variées

Le fichier [`database/scripts/04_requetes_client_avis.sql`](database/scripts/04_requetes_client_avis.sql) contient 6 requêtes de démonstration :
- R1 : Sélection + filtrage (clients marocains)
- R2 : Jointure sur 4 tables (avis + client + séjour + chambre)
- R3 : Agrégation GROUP BY (note moyenne par nationalité)
- R4 : Sous-requête NOT IN (clients sans avis)
- R5 : Fonction de fenêtre `SUM() OVER ()` (répartition notes en %)
- R6 : HAVING avec sous-requête (clients au-dessus de la moyenne)

### Migrations Django

| Application | Migrations | Description |
|-------------|-----------|-------------|
| `avis` | 0001 | Modèle initial |
| `chambres` | 0001 | Chambres + catégories |
| `clients` | 0001, 0002 | Modèle client + ajustements |
| `employes` | 0001 | Modèle employé |
| `maintenances` | 0001 | Modèle maintenance |
| `paiements` | 0001 | Modèle paiement |
| `reservations` | 0001, 0002 | Modèle réservation + triggers MySQL |
| `sejours` | 0001–0005 | Modèle séjour (migration FK réparée en 0003–0005) |
| `services` | 0001 | Services + consommations |

---

## 14. API REST — Endpoints

Swagger interactif : **http://127.0.0.1:8000/api/docs/**  
ReDoc : **http://127.0.0.1:8000/api/redoc/**

### Santé

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health/` | Vérification état du backend |

### Chambres (Hanane)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/chambres/` | Liste / création |
| GET/PUT/DELETE | `/api/chambres/{id}/` | Détail / modification / suppression |
| GET/POST | `/api/categories/` | Catégories de chambres |

### Clients (Safae)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/clients/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/clients/{id}/` | Détail client |
| GET | `/api/clients/{id}/historique/` | Historique des séjours |

### Avis (Safae)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/avis/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/avis/{id}/` | Détail avis |
| GET | `/api/avis/statistiques/` | Statistiques (moyenne, répartition) |

### Réservations (Salma)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/reservations/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/reservations/{id}/` | Détail |
| POST | `/api/reservations/{id}/confirmer/` | Confirmer la réservation |
| POST | `/api/reservations/{id}/annuler/` | Annuler |
| POST | `/api/reservations/{id}/terminer/` | Terminer |
| GET | `/api/reservations/disponibilites/` | Vérifier disponibilité chambre |

### Séjours (Hamza)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/sejours/` | Liste / check-in |
| GET/PUT/PATCH/DELETE | `/api/sejours/{id}/` | Détail séjour |
| GET | `/api/sejours/{id}/resume-financier/` | Résumé financier complet |

### Services (Karima)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/services/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/services/{id}/` | Détail |

### Consommations (Karima)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/consommations/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/consommations/{id}/` | Détail |

### Paiements (Karima)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/paiements/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/paiements/{id}/` | Détail |
| POST | `/api/paiements/{id}/valider/` | Valider le paiement |
| POST | `/api/paiements/{id}/rembourser/` | Rembourser |

### Employés (Karima)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/employes/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/employes/{id}/` | Détail |

### Maintenances (Hanane)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/api/maintenances/` | Liste / création |
| GET/PUT/PATCH/DELETE | `/api/maintenances/{id}/` | Détail |

### Dashboard (Karima)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/dashboard/stats/` | Statistiques générales |

---

## 15. Interface React

L'interface est construite avec React 19, Vite 7 et Tailwind CSS 3.

### Pages disponibles

| URL React | Composant | Module |
|-----------|-----------|--------|
| `/` | `Dashboard` | Vue d'ensemble |
| `/chambres` | `ChambresPage` | Chambres (Hanane) |
| `/maintenances` | `MaintenancesPage` | Maintenances (Hanane) |
| `/clients` | `ClientsPage` | Clients (Safae) |
| `/avis` | `AvisPage` | Avis (Safae) |
| `/reservations` | `ReservationsPage` | Réservations (Salma) |
| `/sejours` | `SejoursPage` | Séjours (Hamza) |
| `/services` | `ServicesPage` | Services (Karima) |
| `/consommations` | `ConsommationsPage` | Consommations (Karima) |
| `/paiements` | `PaiementsPage` | Paiements (Karima) |
| `/employes` | `EmployesPage` | Employés (Karima) |
| `/resume-financier` | `ResumeFinancierPage` | Résumé financier (Karima) |

### Configuration de l'URL de l'API

Par défaut : `http://127.0.0.1:8000/api` (défini dans `src/services/api.js`).  
Pour changer, créer `frontend/.env` avec `VITE_API_URL=http://...`.

---

## 16. Tests

### Backend Django

```powershell
cd backend
.\venv\Scripts\Activate.ps1

# Tous les tests
python manage.py test

# Tests d'une application spécifique
python manage.py test apps.clients
python manage.py test apps.avis
python manage.py test apps.reservations
python manage.py test apps.sejours

# Avec verbosité
python manage.py test --verbosity=2
```

### Couverture de tests par module

| Module | Auteur | Nombre de tests |
|--------|--------|----------------|
| Clients | Safae | ~22 |
| Avis | Safae | Inclus |
| Paiements, Services, Consommations | Karima | ~17 |
| Réservations | Salma | Inclus |
| Séjours | Hamza | Inclus |

> Les tests utilisent une base de test Django séparée créée automatiquement.

---

## 17. Git et branches

| Branche | Usage |
|---------|-------|
| `main` | Branche principale, stable |
| `test` | Branche de travail courante |
| `salma` | Module Réservations (mergé) |
| `safae/bdr-client-avis` | Modules Clients + Avis (mergé) |

### Derniers commits significatifs

```
a793cc0  feat(database): add safe fictional data importer
79c8463  fix(sejours): repair reservation foreign key migrations
256cc6b  Merge pull request #8 from HananeINHID/safae/fix-main-migrations
3c1968c  fix: routes clients/avis, migration sejours 0003, atomic=False sur les triggers MySQL
f4bd384  Merge pull request #7 from HananeINHID/salma
```

> Ne pas pousser sur `main` sans validation collective du groupe.

---

## 18. Résolution de problèmes

### ❌ `MySQLdb.OperationalError: (2002, "Can't connect to server")`

**Cause :** MySQL n'est pas démarré ou utilise un port différent.

```powershell
# Vérifier que MySQL tourne
Get-Service -Name "MySQL*"

# Si arrêté
Start-Service MySQL80

# Vérifier le port dans .env
Get-Content backend\.env | Select-String "DB_PORT"
```

---

### ❌ `Unknown command: 'import_demo_hotel'`

**Cause :** le venv n'est pas activé ou la commande n'est pas dans une app installée.

```powershell
# S'assurer que le venv est actif
.\venv\Scripts\Activate.ps1

# Vérifier que la commande existe
Test-Path backend\apps\sejours\management\commands\import_demo_hotel.py

# Vérifier les apps installées
python manage.py help | Select-String "import"
```

---

### ❌ Erreur de migration `sejours` — Foreign Key vers Reservation inexistante

Ce problème a été résolu dans le commit `79c8463`. Les migrations `0003`, `0004` et `0005` de `sejours` gèrent la transition proprement :
- `0003` : champs FK rendus nullable
- `0004` : migration de données (réconciliation)
- `0005` : finalisation NOT NULL

Si tu rencontres encore ce problème sur une base existante, **ne jamais utiliser `--fake`**. Contacte le groupe.

---

### ❌ `Trigger 'trg_resch_bi': Cette chambre est hors service`

Ce trigger est déclenché lors d'une tentative de réservation d'une chambre `hors_service`. La commande `import_demo_hotel` gère ce cas automatiquement en mettant à jour l'état des chambres avant l'insertion.

---

### ❌ `Une reservation confirmee ne peut pas revenir en attente`

**Cause :** `trg_res_bu` bloque les transitions de statut illégales. L'ordre légal est :
`EN_ATTENTE` → `CONFIRMEE` → `TERMINEE` (ou `ANNULEE`)

---

### ❌ `pip install mysqlclient` échoue sous Windows

```powershell
# S'assurer que les build tools sont installés
winget install Microsoft.VisualStudio.2022.BuildTools

# Ou utiliser le wheel pré-compilé
pip install mysqlclient --only-binary=:all:
```

---

### ❌ `CORS` — le frontend ne peut pas appeler l'API

Vérifie que le backend tourne sur `http://127.0.0.1:8000` (pas `localhost:8000`).  
Le `settings.py` autorise : `http://localhost:5173` et `http://127.0.0.1:5173`.

---

### ❌ `npm run dev` — `Error: Cannot find module`

```powershell
cd frontend
Remove-Item node_modules -Recurse -Force
npm install
```

---

### ❌ `python manage.py migrate` — `Table already exists`

```powershell
# Vérifier l'état des migrations
python manage.py showmigrations

# Ne JAMAIS utiliser --fake sur une base de travail avec des données
# Contacter le groupe si une migration est bloquée
```

---

### ❌ Port 5173 déjà utilisé

```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :5173
# Changer le port dans frontend/vite.config.js ou tuer le processus
```

---

### ℹ️ Note sur `apps.stubs`

L'application `stubs` reste dans `INSTALLED_APPS` pour des raisons de compatibilité inter-modules (ré-export du modèle `Sejour`). Ne pas la supprimer sans tester l'ensemble des applications.

---

## Documentation complémentaire

| Fichier | Contenu |
|---------|---------|
| [`database/RESTAURATION.md`](database/RESTAURATION.md) | Guide pas-à-pas de restauration sécurisée de la base |
| [`docs/contributions/README_KARIMA.md`](docs/contributions/README_KARIMA.md) | Modules Services, Paiements, Employés — API et tests détaillés |
| [`docs/contributions/README_HAMZA.md`](docs/contributions/README_HAMZA.md) | Module Séjours — check-in/check-out, archivage |
| [`docs/contributions/README_SAFAE.md`](docs/contributions/README_SAFAE.md) | Modules Clients et Avis — 22 tests, factories |
| [`docs/contributions/README_SALMA.md`](docs/contributions/README_SALMA.md) | Module Réservations — triggers, API multichambre |

---

*Projet réalisé dans le cadre du cours de Bases de Données Relationnelles — INPT, Master Data & IA*
