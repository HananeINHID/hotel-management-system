# Hotel Management System

Systeme de gestion hoteliere developpe dans le cadre d'un projet universitaire Master Data & IA. Cette phase initialise l'architecture collaborative (React, Django REST Framework, MySQL, Git). Les fonctionnalites metier CRUD seront ajoutees apres validation du MLD.

## Objectif

Fournir une base fonctionnelle pour gerer :

- les clients et les avis
- les chambres et leurs categories
- les reservations multichambres
- les sejours (arrivees, departs, archivage)
- les services et consommations
- les paiements
- les employes
- les maintenances

Contrainte metier a respecter ulterieurement : une reservation peut concerner plusieurs chambres, chacune avec ses propres dates, via `ReservationChambre` (`date_arrivee_prevue`, `date_depart_prevue`, `nb_occupants`, `tarif_nuit_applique`). Un sejour doit correspondre a une chambre figurant dans sa reservation.

## Technologies

- Frontend : React, Vite, JavaScript, React Router, Axios, Lucide React
- Backend : Django, Django REST Framework, django-cors-headers
- Base de donnees : MySQL
- Versionnement : Git et GitHub

## Architecture generale

```text
Navigateur (React)
        |
        | Axios / REST
        v
Django REST Framework
        |
        v
       MySQL
```

Le frontend tourne sur `http://localhost:5173`.
L'API Django tourne sur `http://127.0.0.1:8000`.
L'endpoint de sante est `GET /api/health/`.

## Structure des repertoires

```text
hotel-management-system/
├── backend/          # Projet Django (config + applications)
├── frontend/         # Application React (Vite)
├── database/         # MCD, MLD, scripts SQL, jeux d'essai
├── docs/             # Documentation du projet
├── .gitignore
└── README.md
```

Applications Django : `clients`, `chambres`, `reservations`, `sejours`, `services`, `paiements`, `employes`, `maintenances`, `avis`.

Les modeles metier ne sont pas encore implementes. Ils seront ajoutes apres validation du MLD.

## Configuration du backend Django

Pre-requis : Python 3.13, pip.

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Editez `backend/.env` avec vos identifiants locaux (ne jamais committer ce fichier).

Commandes utiles :

```powershell
python manage.py check
python manage.py migrate
python manage.py runserver
```

Verification : [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

## Configuration du frontend React

Pre-requis : Node.js 20+ et npm.

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173).

Build de production :

```powershell
npm run build
```

Le client Axios (`src/services/api.js`) utilise `VITE_API_URL` (defaut : `http://127.0.0.1:8000/api`).

## Configuration MySQL

Variables attendues dans `backend/.env` :

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Creation de la base :

```powershell
mysql -u root -p < database/scripts/create_database.sql
```

Sur Windows, si `mysql` n'est pas dans le PATH :

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database\scripts\create_database.sql
```

Ne jamais enregistrer les identifiants reels dans Git.

## Demarrage de l'application

Terminal 1 - backend :

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Terminal 2 - frontend :

```powershell
cd frontend
npm run dev
```

## Conventions de commits

Chaque tache validee produit un commit distinct. Messages attendus :

- `chore:` configuration, initialisation, outillage
- `feat:` fonctionnalite ou brique applicative
- `docs:` documentation
- `fix:` correction

Exemples :

- `chore: initialize Django backend`
- `feat: configure REST API`
- `docs: add project setup instructions`

## Contribution via GitHub

1. Cloner le depot.
2. Travailler sur `main` ou une branche fonctionnelle courte si necessaire.
3. Ne pas creer de branches personnelles par membre.
4. Ne pas committer `.env`, `venv/`, `node_modules/` ni de secrets.
5. Tester localement (`python manage.py check`, `npm run build`).
6. Pousser uniquement apres accord de l'equipe.
7. Ouvrir une pull request descriptive si le depot distant est utilise en revue.

Les modeles MCD/MLD ne doivent pas etre modifies sans validation d'equipe.
