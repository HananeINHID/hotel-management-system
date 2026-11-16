#!/usr/bin/env bash
# =============================================================================
# Script sécurisé de restauration de la base MySQL Riad Atlas pour l'équipe (Linux/macOS)
# Restaure le schéma complet, les 351 enregistrements pédagogiques, les 9 triggers,
# les index et l'historique des migrations depuis database/dumps/hotel_management_complet.sql.
# Garantit qu'aucune base existante n'est écrasée sans confirmation explicite.
# =============================================================================

set -e

DB_NAME="${1:-}"
DB_USER="${DB_USER:-root}"
DB_PORT="${DB_PORT:-3306}"
DB_HOST="${DB_HOST:-127.0.0.1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DUMP_FILE="$PROJECT_ROOT/database/dumps/hotel_management_complet.sql"

echo "=========================================================="
echo "  Riad Atlas — Restauration sécurisée de la base MySQL   "
echo "=========================================================="

if [ ! -f "$DUMP_FILE" ]; then
    echo "ERREUR : Fichier de dump introuvable à : $DUMP_FILE" >&2
    exit 1
fi

if [ -z "$DB_NAME" ]; then
    echo "Entrez le nom de la base de données cible :"
    echo "  - Par défaut : 'hotel_management'"
    echo "  - Pour conserver votre base actuelle intacte, choisissez un autre nom (ex: 'hotel_management_nouvelle')"
    read -p "Nom de la base [hotel_management]: " DB_NAME
    DB_NAME="${DB_NAME:-hotel_management}"
fi

read -s -p "Mot de passe MySQL pour l'utilisateur '$DB_USER': " DB_PASSWORD
echo ""

# Vérifier si la base existe déjà
DB_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -N -s -e \
    "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$DB_NAME';" 2>/dev/null || true)

if [ "$DB_EXISTS" = "$DB_NAME" ]; then
    echo ""
    echo "⚠️ ATTENTION : La base de données '$DB_NAME' existe déjà sur votre serveur MySQL !"
    echo "Vos données existantes dans '$DB_NAME' risquent d'être modifiées."
    echo "Si vous souhaitez préserver vos données actuelles, répondez 'NON' et relancez avec un nom différent."
    echo ""
    read -p "Tapez exactement 'OUI' pour écraser/remplacer '$DB_NAME', ou autre chose pour annuler: " CONFIRM
    if [ "$CONFIRM" != "OUI" ]; then
        echo "Restauration annulée par sécurité. Vos données n'ont pas été modifiées."
        exit 0
    fi
fi

echo ""
echo "Création de la base '$DB_NAME' si nécessaire..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e \
    "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "Importation du schéma, des données (351 records), des 9 triggers et des index..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" --default-character-set=utf8mb4 "$DB_NAME" < "$DUMP_FILE"

echo ""
echo "✅ Restauration réussie avec succès dans '$DB_NAME' !"
echo ""
echo "Prochaines étapes :"
echo "1. Mettre à jour votre fichier 'backend/.env' :"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PORT=$DB_PORT"
echo "2. Vérifier les migrations Django :"
echo "   cd backend && source venv/bin/activate"
echo "   python manage.py showmigrations"
echo "   python manage.py migrate --plan"
