# 🗄️ Guide de Restauration Sécurisée de la Base de Données

Ce guide fournit la procédure complète et vérifiée pour restaurer une base de données MySQL opérationnelle pour le projet **Riad Atlas**.

---

## 1. Audit technique : Pourquoi les migrations échouent sur une base existante

### Le problème constaté
Une collaboratrice possède **4 séjours historiques**, mais **aucune réservation** et **aucun client**.  
Lorsqu'elle exécute `python manage.py migrate`, les migrations `sejours 0003`, `0004` et `0005` échouent.

### Analyse des causes
1. **Migration `sejours 0003`** : supprime les anciens champs `date_arrivee_prevue` et `date_depart_prevue`, puis ajoute deux clés étrangères `reservation` et `chambre` (nullables au départ).
2. **Migration `sejours 0004` (`RunPython reconcile_sejours`)** : cette migration applique un dictionnaire de réconciliation codé en dur (`RECONCILIATION_SPECS`) pour les séjours 1 à 15 de la base de référence.
   - Si les 4 séjours de la base locale ont des identifiants non répertoriés, la fonction lève :
     `ValueError: Séjour #X non répertorié dans les spécifications de réconciliation. Réconciliation manuelle requise.`
   - Si la table `employes_employe` est vide, la création de la réservation échoue (`employe_defaut is None`).
   - Si les chambres spécifiées n'existent pas ou ont un état incompatible, les triggers MySQL (`trg_resch_bi`) bloquent l'insertion.
3. **Migration `sejours 0005`** : tente d'appliquer `NOT NULL` sur `reservation` et `chambre` et d'ajouter une contrainte d'unicité. Si les séjours n'ont pas pu être réconciliés (champs encore `NULL`), MySQL refuse l'opération (`IntegrityError`).

### Solution retenue
Plutôt que d'altérer les migrations existantes ou d'utiliser `--fake` (ce qui laisserait le schéma MySQL dans un état incohérent avec le code Django), la solution recommandée consiste à **fournir un export SQL complet et portable** contenant :
- Le schéma relationnel finalisé
- Les 351 enregistrements pédagogiques cohérents
- Les 9 triggers métier actifs
- Les index composites optimisés
- L'historique complet des 33 migrations appliquées dans `django_migrations`

> **Note importante :** Cette procédure ne prétend pas réparer automatiquement les 4 séjours historiques incomplets. Elle permet à la collaboratrice d'initialiser une copie de travail fonctionnelle dans une base isolée (par exemple `hotel_management_work`), tout en conservant son ancienne base si elle le souhaite.

---

## 2. Le fichier d'export portable

Le fichier d'export est situé dans le dépôt :
```
database/dumps/hotel_management_complet.sql
```

Caractéristiques de l'export :
- **Taille :** ~150 Ko
- **Encodage :** UTF-8 natif (`--default-character-set=utf8mb4`)
- **Portabilité :** `--set-gtid-purged=OFF` pour compatibilité entre différentes configurations MySQL 8.0
- **Sécurité :** Ne contient aucune directive `DROP DATABASE` ni `USE` en dur ; s'applique uniquement à la base cible sélectionnée.

---

## 3. Restauration sous Windows (PowerShell)

### Option A — Script automatisé sécurisé (recommandé)

Le script demande le nom de la base cible. Si la base existe déjà, il **alerte et demande confirmation avant toute modification** :

```powershell
# Depuis la racine du projet
.\database\scripts\restaurer_base.ps1
```

Vous pouvez aussi spécifier les paramètres directement :
```powershell
.\database\scripts\restaurer_base.ps1 -DbName "hotel_management" -DbUser "root" -DbPort "3307"
```

### Option B — Restauration manuelle pas-à-pas

#### 1. Créer la base cible dans MySQL
```powershell
# Adaptez le port (3307 ou 3306) et l'utilisateur
mysql -u root -p --port=3307 -e "CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 2. Importer le dump (attention à l'encodage !)
> ⚠️ **Attention sous PowerShell :** Ne faites PAS `Get-Content dump.sql | mysql` ni `mysql < dump.sql` dans certaines consoles PowerShell car la redirection risque de convertir le flux en UTF-16 et générer l'erreur `ASCII '\0' appeared in the statement`.
> 
> Utilisez impérativement la commande MySQL `source` :

```powershell
$dump = (Resolve-Path "database\dumps\hotel_management_complet.sql").Path.Replace('\', '/')
mysql -u root -p --port=3307 --default-character-set=utf8mb4 -e "USE hotel_management; source $dump;"
```

---

## 4. Restauration sous Linux / macOS (Bash)

> *Non testé sur environnement Linux physique.*

### Option A — Script automatisé sécurisé

```bash
chmod +x database/scripts/restaurer_base.sh
./database/scripts/restaurer_base.sh [nom_de_base]
```

### Option B — Restauration manuelle

```bash
# 1. Créer la base
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Importer
mysql -u root -p --default-character-set=utf8mb4 hotel_management < database/dumps/hotel_management_complet.sql
```

---

## 5. Configuration de Django (`backend/.env`)

Après restauration, adaptez votre fichier `backend/.env` avec le nom de la base restaurée :

```env
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_HOST=127.0.0.1
DB_PORT=3307
```

---

## 6. Vérifications obligatoires post-restauration

Exécutez les commandes suivantes dans `backend/` avec l'environnement virtuel activé :

### 1. Vérifier l'état des migrations
```powershell
python manage.py showmigrations
```
*Toutes les migrations de toutes les applications doivent afficher `[X]`.*

### 2. Vérifier le plan de migration
```powershell
python manage.py migrate --plan
```
*Doit afficher : `No planned migration operations.`*

### 3. Vérifier le démarrage de Django
```powershell
python manage.py check
```
*Doit afficher : `System check identified no issues (0 silenced).`*

### 4. Vérifier les données et l'intégrité relationnelle
```powershell
python -c "
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.sejours.models import Sejour
from apps.reservations.models import Reservation
from apps.clients.models import Client

print('Séjours :', Sejour.objects.count())
print('Réservations :', Reservation.objects.count())
print('Clients :', Client.objects.count())

s = Sejour.objects.first()
print(f'Séjour test #{s.id_sejour} -> Réservation #{s.reservation_id}, Chambre #{s.chambre_id}')
assert s.reservation is not None and s.chambre is not None
print('Validation réussie !')
"
```

---

## 7. Résumé des protections de données

| Risque | Mesure préventive implémentée |
|--------|-------------------------------|
| Écrasement accidentel d'une base existante | Les scripts vérifient l'existence et exigent la saisie explicite de `OUI` |
| Perte des 4 séjours de la collègue | La collègue peut choisir un autre nom de base (ex: `hotel_management_work`) sans toucher à sa base d'origine |
| Erreur d'encodage `ASCII \0` sous Windows | Utilisation de `source` avec chemins normalisés et encodage `utf8mb4` |
| Conflit de version GTID | Export réalisé avec `--set-gtid-purged=OFF` |
| Incohérence schema / triggers | Le dump contient à la fois les tables, les données, les 9 triggers, les index et la table `django_migrations` |
