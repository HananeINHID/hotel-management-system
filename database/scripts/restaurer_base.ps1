<#
.SYNOPSIS
    Script sécurisé de restauration de la base MySQL Riad Atlas pour l'équipe (Windows PowerShell).
.DESCRIPTION
    Restaure le schéma complet, les 351 enregistrements pédagogiques, les 9 triggers,
    les index et l'historique des migrations depuis database/dumps/hotel_management_complet.sql.
    Garantit qu'aucune base existante n'est écrasée sans confirmation explicite.
#>

param (
    [string]$DbName = "",
    [string]$DbUser = "root",
    [string]$DbPort = "3307",
    [string]$DbHost = "127.0.0.1"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Riad Atlas — Restauration sécurisée de la base MySQL   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$DumpFile = Join-Path $ProjectRoot "database\dumps\hotel_management_complet.sql"

if (-not (Test-Path $DumpFile)) {
    Write-Host "ERREUR : Fichier de dump introuvable à : $DumpFile" -ForegroundColor Red
    exit 1
}

# 1. Choix du nom de la base cible
if (-not $DbName) {
    Write-Host "Entrez le nom de la base de données cible :" -ForegroundColor Yellow
    Write-Host "  - Par défaut : 'hotel_management'"
    Write-Host "  - Pour conserver votre base actuelle intacte, choisissez un autre nom (ex: 'hotel_management_nouvelle')"
    $InputName = Read-Host "Nom de la base [hotel_management]"
    if ($InputName.Trim()) {
        $DbName = $InputName.Trim()
    } else {
        $DbName = "hotel_management"
    }
}

# 2. Localiser l'exécutable mysql
$MysqlExe = "mysql"
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    $CommonPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 26.7\bin\mysql.exe"
    )
    foreach ($p in $CommonPaths) {
        if (Test-Path $p) {
            $MysqlExe = $p
            break
        }
    }
}

# 3. Demander le mot de passe
$DbPassword = Read-Host "Mot de passe MySQL pour l'utilisateur '$DbUser'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# 4. Vérifier si la base existe déjà
$CheckCmd = "& '$MysqlExe' --host=$DbHost --port=$DbPort --user=$DbUser --password='$PlainPassword' -N -s -e `"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$DbName';`""
$Exists = Invoke-Expression $CheckCmd 2>$null

if ($Exists -eq $DbName) {
    Write-Host ""
    Write-Host "⚠️ ATTENTION : La base de données '$DbName' existe déjà sur votre serveur MySQL !" -ForegroundColor Red
    Write-Host "Vos données existantes dans '$DbName' risquent d'être modifiées." -ForegroundColor Yellow
    Write-Host "Si vous souhaitez préserver vos données actuelles, répondez 'NON' et relancez avec un nom différent." -ForegroundColor Yellow
    Write-Host ""
    $Confirm = Read-Host "Tapez exactement 'OUI' pour écraser/remplacer '$DbName', ou n'importe quelle autre touche pour annuler"
    if ($Confirm -ne "OUI") {
        Write-Host "Restauration annulée par sécurité. Vos données n'ont pas été modifiées." -ForegroundColor Green
        exit 0
    }
}

# 5. Création et importation
Write-Host ""
Write-Host "Création / Initialisation de la base '$DbName'..." -ForegroundColor Cyan
$CreateQuery = "CREATE DATABASE IF NOT EXISTS \`$DbName\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
& $MysqlExe --host=$DbHost --port=$DbPort --user=$DbUser "--password=$PlainPassword" -e "$CreateQuery"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de la création de la base." -ForegroundColor Red
    exit 1
}

Write-Host "Importation du schéma, des données (351 records), des 9 triggers et des index..." -ForegroundColor Cyan
$DumpNormalized = $DumpFile.Replace('\', '/')
$ImportQuery = "USE \`$DbName\`; source $DumpNormalized;"
& $MysqlExe --host=$DbHost --port=$DbPort --user=$DbUser "--password=$PlainPassword" --default-character-set=utf8mb4 -e "$ImportQuery"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Restauration réussie avec succès dans '$DbName' !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "1. Mettre à jour votre fichier 'backend/.env' avec :"
    Write-Host "   DB_NAME=$DbName"
    Write-Host "   DB_USER=$DbUser"
    Write-Host "   DB_PORT=$DbPort"
    Write-Host "2. Vérifier les migrations Django :"
    Write-Host "   cd backend"
    Write-Host "   .\venv\Scripts\Activate.ps1"
    Write-Host "   python manage.py showmigrations"
    Write-Host "   python manage.py migrate --plan   # doit indiquer: No planned migration operations"
} else {
    Write-Host "❌ Une erreur est survenue lors de l'importation." -ForegroundColor Red
}
