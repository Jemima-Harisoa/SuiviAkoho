#!/bin/bash

# Attendre que SQL Server soit prêt
sleep 20s

echo "Exécution des scripts d'initialisation..."

for script in /scripts/init/*.sql; do
    echo "Running $script..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i "$script"
done

echo "Initialisation terminée."