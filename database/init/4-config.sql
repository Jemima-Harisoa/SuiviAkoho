/*
  Configuration - Unités de mesure et Paramètres système
  Ce fichier contient les tables de configuration :
    - Unite : Unités de mesure (kg, g, pièce, litre, etc.)
    - Parametre : Paramètres système (prix, seuils, etc.) avec validité temporelle

  Déploiement : Script 4 (après 1-init.sql, 2-data.sql, 3-commercial.sql)
*/

USE SuiviAkoho;
GO

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

SET NOCOUNT ON;
GO

/* =========================
   TABLES DE CONFIGURATION
   ========================= */

-- Table : Unités de mesure (pour conversions, affichages)
IF OBJECT_ID(N'Unite', N'U') IS NULL
BEGIN
    CREATE TABLE Unite (
        UniteId TINYINT IDENTITY PRIMARY KEY,
        Code NVARCHAR(20) NOT NULL UNIQUE,
        Label NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_Unite_Code ON Unite(Code);
END
GO

-- Table : Paramètres système (prix, seuils, constants métier)
IF OBJECT_ID(N'Parametre', N'U') IS NULL
BEGIN
    CREATE TABLE Parametre (
        ParametreId INT IDENTITY PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Label NVARCHAR(200) NOT NULL,
        Value NVARCHAR(MAX) NOT NULL,
        DataType NVARCHAR(50) NULL, -- Optionnel : type de donnée (ex: 'INT', 'DECIMAL', 'STRING') pour validation côté application
        EffectiveDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        EndDate DATE NULL,
        CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
        
        CONSTRAINT CK_Parametre_DateRange CHECK (EndDate IS NULL OR EffectiveDate <= EndDate)
    );
    
    CREATE INDEX IX_Parametre_Code ON Parametre(Code);
    CREATE INDEX IX_Parametre_EffectiveDate ON Parametre(EffectiveDate, EndDate);
END
GO

/* =========================
   DONNÉES DE TEST CONFIGURATION
   ========================= */

-- Unités de mesure
IF NOT EXISTS (SELECT 1 FROM Unite WHERE Code = N'KG')
    INSERT INTO Unite (Code, Label) VALUES (N'KG', N'Kilogramme');

IF NOT EXISTS (SELECT 1 FROM Unite WHERE Code = N'G')
    INSERT INTO Unite (Code, Label) VALUES (N'G', N'Gramme');

IF NOT EXISTS (SELECT 1 FROM Unite WHERE Code = N'PIECE')
    INSERT INTO Unite (Code, Label) VALUES (N'PIECE', N'Pièce');

IF NOT EXISTS (SELECT 1 FROM Unite WHERE Code = N'LITRE')
    INSERT INTO Unite (Code, Label) VALUES (N'LITRE', N'Litre');

GO

-- Paramètres système
IF NOT EXISTS (SELECT 1 FROM Parametre WHERE Code = N'PRIX_POULET_BASE')
    INSERT INTO Parametre (Code, Label, Value, EffectiveDate, EndDate)
    VALUES (
        N'PRIX_POULET_BASE',
        N'Prix de base du poulet (Ar/kg)',
        N'18000',
        CAST(GETDATE() AS DATE),
        NULL
    );

IF NOT EXISTS (SELECT 1 FROM Parametre WHERE Code = N'PRIX_OEUF')
    INSERT INTO Parametre (Code, Label, Value, EffectiveDate, EndDate)
    VALUES (
        N'PRIX_OEUF',
        N'Prix unitaire de l''œuf (Ar)',
        N'750',
        CAST(GETDATE() AS DATE),
        NULL
    );

IF NOT EXISTS (SELECT 1 FROM Parametre WHERE Code = N'TAUX_MORTALITE_MAX')
    INSERT INTO Parametre (Code, Label, Value, EffectiveDate, EndDate)
    VALUES (
        N'TAUX_MORTALITE_MAX',
        N'Taux de mortalité maximum acceptable (%)',
        N'5',
        CAST(GETDATE() AS DATE),
        NULL
    );

IF NOT EXISTS (SELECT 1 FROM Parametre WHERE Code = N'COUT_ALIMENT_KG')
    INSERT INTO Parametre (Code, Label, Value, EffectiveDate, EndDate)
    VALUES (
        N'COUT_ALIMENT_KG',
        N'Coût de l''aliment par kg (Ar)',
        N'3000',
        CAST(GETDATE() AS DATE),
        NULL
    );

GO
