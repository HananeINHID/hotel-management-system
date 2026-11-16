# Module Séjours et Archivage

## Présentation

Ce module fait partie du projet Hotel Management System. Il est consacré à la gestion des séjours des clients ainsi qu'à l'archivage des séjours terminés.

## Responsabilité

Développement du module **Séjours + Archivage**, comprenant le frontend React et le backend Django.

## Fonctionnalités développées

- **Gestion des séjours :** consultation et affichage des séjours.
- **Check-in :** enregistrement de l'arrivée réelle d'un client à partir d'une réservation confirmée.
- **Check-out :** enregistrement du départ réel du client.
- **Historique :** consultation des séjours effectués.
- **Archivage :** archivage des séjours terminés.
- **Désarchivage :** possibilité de restaurer un séjour archivé.
- **Informations financières :** accès au résumé financier d'un séjour.

## Technologies utilisées

### Frontend
- React
- JavaScript
- Axios
- Vite

### Backend
- Python
- Django
- Django REST Framework

## Structure du module

### Backend

```text
backend/apps/sejours/
├── models.py
├── views.py
├── serializers.py
├── urls.py
├── admin.py
└── migrations/
```

### Frontend

```text
frontend/src/
├── api/
│   └── index.js
└── pages/
    └── SejoursPage.jsx
```

## Lancement du module

Le module utilise le backend et le frontend du projet principal.

### Backend

```bash
cd backend
python manage.py runserver
```

### Frontend

Dans un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

## Règles de gestion

- Un check-in est effectué à partir d'une réservation confirmée.
- Les dates d'arrivée et de départ prévues proviennent de la réservation.
- Les dates réelles sont enregistrées dans le séjour.
- Un séjour ne peut être archivé que lorsqu'il est terminé.

## Auteur

Responsable du développement du module : **Séjours et Archivage**.