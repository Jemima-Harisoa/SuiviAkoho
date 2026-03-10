# Extrait code d'execution Sql Server dans Docker
docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Dev@12345 -C

# Iitialisation du backend 
## Installation des Dépendances de production (ce qui tourne en prod)
npm install -D typescript ts-node nodemon @types/express @types/node @types/cors

## Insatallation des Dépendances de développement (outils dev uniquement)
npm install -D typescript ts-node nodemon @types/express @types/node @types/cors

## Installation de typescript globalement
npx tsc --init