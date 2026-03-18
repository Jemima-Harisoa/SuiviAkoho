#!/usr/bin/env pwsh
# Script pour ajouter les tables Unite et Parametre sans redémarrer Docker
# Utilisation: .\execute-config.ps1

param(
    [string]$SqlServerHost = "localhost",
    [string]$SqlServerPort = "1433",
    [string]$SqlUser = "sa",
    [string]$SqlPassword = "Dev@12345",
    [string]$Database = "SuiviAkoho"
)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Exécution du script de configuration (4-config.sql)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le container Docker est actif
Write-Host "Vérification du container SQL Server..." -ForegroundColor Yellow
$containerCheck = docker ps --filter "name=sqlserver" --format "{{.Names}}" 2>$null

if (-not $containerCheck) {
    Write-Host "❌ Erreur : Le container 'sqlserver' n'est pas en cours d'exécution." -ForegroundColor Red
    Write-Host "Démarrez-le avec : docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Container trouvé : $containerCheck" -ForegroundColor Green
Write-Host ""

# Lire le contenu du fichier 4-config.sql
$sqlFilePath = "database/init/4-config.sql"

if (-not (Test-Path $sqlFilePath)) {
    Write-Host "❌ Erreur : Fichier '$sqlFilePath' non trouvé." -ForegroundColor Red
    Write-Host "Vérifiez que vous êtes à la racine du projet SuiviAkoho" -ForegroundColor Yellow
    exit 1
}

Write-Host "Lecture du fichier : $sqlFilePath" -ForegroundColor Yellow
$sqlContent = Get-Content -Path $sqlFilePath -Raw

if (-not $sqlContent) {
    Write-Host "❌ Erreur : Le fichier SQL est vide." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier lu avec succès" -ForegroundColor Green
Write-Host ""

# Exécuter le script SQL dans le container
Write-Host "Exécution du script SQL dans le container..." -ForegroundColor Yellow
Write-Host ""

# Créer un fichier temporaire pour le script SQL
$tempFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempFile -Value $sqlContent -Encoding UTF8

$result = Get-Content -Path $tempFile -Raw | docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost `
    -U $SqlUser `
    -P $SqlPassword `
    -C `
    -d $Database 2>&1

# Nettoyer le fichier temporaire
Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "✅ SUCCÈS : Script SQL exécuté avec succès !" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tables créées/mises à jour :" -ForegroundColor Cyan
    Write-Host "  • Unite (unités de mesure)" -ForegroundColor Green
    Write-Host "  • Parametre (paramètres système)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Données insérées :" -ForegroundColor Cyan
    Write-Host "  • 4 unités de mesure (KG, G, PIECE, LITRE)" -ForegroundColor Green
    Write-Host "  • 4 paramètres système (prix, seuils)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "  1. Redémarrer le backend : npm start (dans ./backend)" -ForegroundColor Yellow
    Write-Host "  2. Tester les nouveaux endpoints avec Postman :" -ForegroundColor Yellow
    Write-Host "     GET  /api/unites/" -ForegroundColor White
    Write-Host "     POST /api/unites/create" -ForegroundColor White
    Write-Host "     GET  /api/parametres/" -ForegroundColor White
    Write-Host "     POST /api/parametres/create" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Red
    Write-Host "❌ ERREUR : L'exécution a échoué" -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Message d'erreur :" -ForegroundColor Yellow
    Write-Host $result
    Write-Host ""
    Write-Host "Dépannage :" -ForegroundColor Cyan
    Write-Host "  • Vérifiez que le container est sain : docker ps" -ForegroundColor Yellow
    Write-Host "  • Vérifiez les logs Docker : docker logs sqlserver" -ForegroundColor Yellow
    Write-Host "  • Essayez de redémarrer : docker-compose restart sqlserver" -ForegroundColor Yellow
    exit 1
}
