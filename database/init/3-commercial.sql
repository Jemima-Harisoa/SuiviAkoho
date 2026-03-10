/*
  Extension commerciale - Suivi d'elevage de poulets (AkoFre)
  Tables ajoutees:
	- Production
	- HistoriqueVente
	- Prevision
	- HistoriqueAchat

  Note:
	- Aucune table n'utilise de prefixe de schema (pas de elevage.)
	- Ce fichier contient aussi des donnees de test commerciales.
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
   TABLES DE GESTION COMMERCIALE
   ========================= */

-- Table : Stock destine a la vente immediate (oeufs et poulets disponibles)
IF OBJECT_ID(N'Production', N'U') IS NULL
BEGIN
	CREATE TABLE Production (
		ProductionId BIGINT IDENTITY PRIMARY KEY,
		LotId INT NULL,
		ProductType NVARCHAR(20) NOT NULL,
		AvailableQuantity INT NOT NULL,
		Unit NVARCHAR(20) NOT NULL DEFAULT N'PIECE',
		UnitPriceAr DECIMAL(18,2) NULL,
		IsActive BIT NOT NULL DEFAULT 1,
		LastUpdateAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
		CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

		CONSTRAINT CK_Production_ProductType_NotEmpty CHECK (LEN(LTRIM(RTRIM(ProductType))) > 0),
		CONSTRAINT CK_Production_AvailableQty CHECK (AvailableQuantity >= 0),
		CONSTRAINT CK_Production_UnitPrice CHECK (UnitPriceAr IS NULL OR UnitPriceAr >= 0)
	);
END
GO

-- Table : Historique des ventes realisees (CA, cout estime, benefice)
IF OBJECT_ID(N'HistoriqueVente', N'U') IS NULL
BEGIN
	CREATE TABLE HistoriqueVente (
		HistoriqueVenteId BIGINT IDENTITY PRIMARY KEY,
		ProductionId BIGINT NOT NULL,
		LotId INT NULL,
		SaleDate DATE NOT NULL,
		ProductType NVARCHAR(20) NOT NULL,
		Quantity INT NOT NULL,
		UnitPriceAr DECIMAL(18,2) NOT NULL,
		TotalAmountAr AS (Quantity * UnitPriceAr) PERSISTED,
		EstimatedCostAr DECIMAL(18,2) NULL,
		ProfitAr AS (
			CASE
				WHEN EstimatedCostAr IS NULL THEN NULL
				ELSE (Quantity * UnitPriceAr) - EstimatedCostAr
			END
		) PERSISTED,
		CustomerName NVARCHAR(150) NULL,
		Notes NVARCHAR(300) NULL,
		CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

		CONSTRAINT CK_HistoriqueVente_ProductType_NotEmpty CHECK (LEN(LTRIM(RTRIM(ProductType))) > 0),
		CONSTRAINT CK_HistoriqueVente_Qty CHECK (Quantity > 0),
		CONSTRAINT CK_HistoriqueVente_UnitPrice CHECK (UnitPriceAr >= 0),
		CONSTRAINT CK_HistoriqueVente_EstimatedCost CHECK (EstimatedCostAr IS NULL OR EstimatedCostAr >= 0)
	);
END
GO

-- Table : Planification des depenses (budget previsionnel)
IF OBJECT_ID(N'Prevision', N'U') IS NULL
BEGIN
	CREATE TABLE Prevision (
		PrevisionId BIGINT IDENTITY PRIMARY KEY,
		LotId INT NULL,
		Category NVARCHAR(30) NOT NULL,
		Description NVARCHAR(250) NOT NULL,
		PlannedDate DATE NOT NULL,
		PlannedAmountAr DECIMAL(18,2) NOT NULL,
		Status NVARCHAR(20) NOT NULL DEFAULT N'EN_ATTENTE',
		RealizedDate DATE NULL,
		RealizedAmountAr DECIMAL(18,2) NULL,
		VarianceAr AS (
			CASE
				WHEN RealizedAmountAr IS NULL THEN NULL
				ELSE RealizedAmountAr - PlannedAmountAr
			END
		) PERSISTED,
		Notes NVARCHAR(300) NULL,
		CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

		CONSTRAINT CK_Prevision_Category_NotEmpty CHECK (LEN(LTRIM(RTRIM(Category))) > 0),
		CONSTRAINT CK_Prevision_PlannedAmount CHECK (PlannedAmountAr > 0),
		CONSTRAINT CK_Prevision_Status_NotEmpty CHECK (LEN(LTRIM(RTRIM(Status))) > 0),
		CONSTRAINT CK_Prevision_RealizedAmount CHECK (RealizedAmountAr IS NULL OR RealizedAmountAr >= 0)
	);
END
GO

-- Table : Historique des achats et depenses (aliment, medicament, poussins, etc.)
IF OBJECT_ID(N'HistoriqueAchat', N'U') IS NULL
BEGIN
	CREATE TABLE HistoriqueAchat (
		HistoriqueAchatId BIGINT IDENTITY PRIMARY KEY,
		LotId INT NULL,
		PrevisionId BIGINT NULL,
		PurchaseDate DATE NOT NULL,
		Category NVARCHAR(30) NOT NULL,
		ItemName NVARCHAR(120) NOT NULL,
		Quantity DECIMAL(12,3) NULL,
		Unit NVARCHAR(20) NULL,
		UnitPriceAr DECIMAL(18,2) NULL,
		TotalAmountAr AS (
			CASE
				WHEN Quantity IS NULL OR UnitPriceAr IS NULL THEN NULL
				ELSE Quantity * UnitPriceAr
			END
		) PERSISTED,
		SupplierName NVARCHAR(150) NULL,
		Notes NVARCHAR(300) NULL,
		CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

		CONSTRAINT CK_HistoriqueAchat_Category_NotEmpty CHECK (LEN(LTRIM(RTRIM(Category))) > 0),
		CONSTRAINT CK_HistoriqueAchat_Quantity CHECK (Quantity IS NULL OR Quantity > 0),
		CONSTRAINT CK_HistoriqueAchat_UnitPrice CHECK (UnitPriceAr IS NULL OR UnitPriceAr >= 0)
	);
END
GO

/* =========================
   A FAIRE (AMELIORATIONS)
   ========================= */

-- 1) Ajouter une table de prix fournisseur (historique des prix avec date d'effet)
--    et lier Production.UnitPriceAr a cette reference.
-- 2) Ajouter une table Client et mettre une valeur par defaut (ex: DIVERS)
--    pour HistoriqueVente.CustomerName.
-- 3) Ajouter une table Fournisseur et mettre une valeur par defaut (ex: DIVERS)
--    pour HistoriqueAchat.SupplierName.
-- 4) Ajouter une table Unite + conversion (g, kg, piece, etc.) et une table Parametre.

/* =========================
   CLES ETRANGERES (OPTIONNELLES)
   ========================= */

-- FK Production -> Lot
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Production_Lot')
BEGIN
	ALTER TABLE Production
	ADD CONSTRAINT FK_Production_Lot FOREIGN KEY (LotId)
		REFERENCES Lot(LotId);
END
GO

-- FK HistoriqueVente -> Production
IF OBJECT_ID(N'Production', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_HistoriqueVente_Production')
BEGIN
	ALTER TABLE HistoriqueVente
	ADD CONSTRAINT FK_HistoriqueVente_Production FOREIGN KEY (ProductionId)
		REFERENCES Production(ProductionId);
END
GO

-- FK HistoriqueVente -> Lot
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_HistoriqueVente_Lot')
BEGIN
	ALTER TABLE HistoriqueVente
	ADD CONSTRAINT FK_HistoriqueVente_Lot FOREIGN KEY (LotId)
		REFERENCES Lot(LotId);
END
GO

-- FK Prevision -> Lot
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Prevision_Lot')
BEGIN
	ALTER TABLE Prevision
	ADD CONSTRAINT FK_Prevision_Lot FOREIGN KEY (LotId)
		REFERENCES Lot(LotId);
END
GO

-- FK HistoriqueAchat -> Lot
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_HistoriqueAchat_Lot')
BEGIN
	ALTER TABLE HistoriqueAchat
	ADD CONSTRAINT FK_HistoriqueAchat_Lot FOREIGN KEY (LotId)
		REFERENCES Lot(LotId);
END
GO

-- FK HistoriqueAchat -> Prevision
IF OBJECT_ID(N'Prevision', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_HistoriqueAchat_Prevision')
BEGIN
	ALTER TABLE HistoriqueAchat
	ADD CONSTRAINT FK_HistoriqueAchat_Prevision FOREIGN KEY (PrevisionId)
		REFERENCES Prevision(PrevisionId);
END
GO

/* =========================
   INDEXES
   ========================= */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Production_Lot_ProductType' AND object_id = OBJECT_ID(N'Production'))
BEGIN
	CREATE INDEX IX_Production_Lot_ProductType ON Production(LotId, ProductType);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_HistoriqueVente_SaleDate' AND object_id = OBJECT_ID(N'HistoriqueVente'))
BEGIN
	CREATE INDEX IX_HistoriqueVente_SaleDate ON HistoriqueVente(SaleDate, ProductType);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_HistoriqueVente_Lot' AND object_id = OBJECT_ID(N'HistoriqueVente'))
BEGIN
	CREATE INDEX IX_HistoriqueVente_Lot ON HistoriqueVente(LotId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Prevision_Status_Date' AND object_id = OBJECT_ID(N'Prevision'))
BEGIN
	CREATE INDEX IX_Prevision_Status_Date ON Prevision(Status, PlannedDate);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Prevision_Category' AND object_id = OBJECT_ID(N'Prevision'))
BEGIN
	CREATE INDEX IX_Prevision_Category ON Prevision(Category, PlannedDate);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_HistoriqueAchat_Date_Category' AND object_id = OBJECT_ID(N'HistoriqueAchat'))
BEGIN
	CREATE INDEX IX_HistoriqueAchat_Date_Category ON HistoriqueAchat(PurchaseDate, Category);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_HistoriqueAchat_Lot' AND object_id = OBJECT_ID(N'HistoriqueAchat'))
BEGIN
	CREATE INDEX IX_HistoriqueAchat_Lot ON HistoriqueAchat(LotId);
END
GO

/* =========================
   DONNEES DE TEST COMMERCIALES
   ========================= */

-- Lot de test (facultatif) : utilise le premier Lot disponible si present.
DECLARE @LotTestId INT = NULL;
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
BEGIN
	SELECT TOP 1 @LotTestId = LotId FROM Lot ORDER BY LotId;
END

-- 1) Production de test
IF NOT EXISTS (
	SELECT 1
	FROM Production
	WHERE ProductType = N'OEUF'
	  AND AvailableQuantity = 420
	  AND UnitPriceAr = 300.00
)
BEGIN
	INSERT INTO Production (LotId, ProductType, AvailableQuantity, Unit, UnitPriceAr, IsActive)
	VALUES (@LotTestId, N'OEUF', 420, N'PIECE', 300.00, 1);
END

IF NOT EXISTS (
	SELECT 1
	FROM Production
	WHERE ProductType = N'POULET'
	  AND AvailableQuantity = 35
	  AND UnitPriceAr = 18000.00
)
BEGIN
	INSERT INTO Production (LotId, ProductType, AvailableQuantity, Unit, UnitPriceAr, IsActive)
	VALUES (@LotTestId, N'POULET', 35, N'PIECE', 18000.00, 1);
END
GO

-- 2) Previsions de test
DECLARE @LotTestId2 INT = NULL;
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
BEGIN
	SELECT TOP 1 @LotTestId2 = LotId FROM Lot ORDER BY LotId;
END

IF NOT EXISTS (
	SELECT 1 FROM Prevision
	WHERE Category = N'ALIMENT'
	  AND Description = N'Achat aliment croissance - semaine en cours'
)
BEGIN
	INSERT INTO Prevision (LotId, Category, Description, PlannedDate, PlannedAmountAr, Status, Notes)
	VALUES (@LotTestId2, N'ALIMENT', N'Achat aliment croissance - semaine en cours', '2026-03-15', 250000.00, N'EN_ATTENTE', N'Prevision mensuelle');
END

IF NOT EXISTS (
	SELECT 1 FROM Prevision
	WHERE Category = N'MEDICAMENT'
	  AND Description = N'Vaccin rappel lot actif'
)
BEGIN
	INSERT INTO Prevision (LotId, Category, Description, PlannedDate, PlannedAmountAr, Status, Notes)
	VALUES (@LotTestId2, N'MEDICAMENT', N'Vaccin rappel lot actif', '2026-03-20', 80000.00, N'EN_ATTENTE', N'Suivi sanitaire');
END
GO

-- 3) HistoriqueVente de test
DECLARE @ProdOeufId BIGINT = (
	SELECT TOP 1 ProductionId
	FROM Production
	WHERE ProductType = N'OEUF'
	ORDER BY ProductionId DESC
);

DECLARE @ProdPouletId BIGINT = (
	SELECT TOP 1 ProductionId
	FROM Production
	WHERE ProductType = N'POULET'
	ORDER BY ProductionId DESC
);

DECLARE @LotTestId3 INT = NULL;
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
BEGIN
	SELECT TOP 1 @LotTestId3 = LotId FROM Lot ORDER BY LotId;
END

IF @ProdOeufId IS NOT NULL
AND NOT EXISTS (
	SELECT 1 FROM HistoriqueVente
	WHERE ProductionId = @ProdOeufId
	  AND SaleDate = '2026-03-08'
	  AND Quantity = 120
)
BEGIN
	INSERT INTO HistoriqueVente (ProductionId, LotId, SaleDate, ProductType, Quantity, UnitPriceAr, EstimatedCostAr, CustomerName, Notes)
	VALUES (@ProdOeufId, @LotTestId3, '2026-03-08', N'OEUF', 120, 320.00, 25000.00, N'Client marche', N'Vente detail');
END

IF @ProdPouletId IS NOT NULL
AND NOT EXISTS (
	SELECT 1 FROM HistoriqueVente
	WHERE ProductionId = @ProdPouletId
	  AND SaleDate = '2026-03-09'
	  AND Quantity = 10
)
BEGIN
	INSERT INTO HistoriqueVente (ProductionId, LotId, SaleDate, ProductType, Quantity, UnitPriceAr, EstimatedCostAr, CustomerName, Notes)
	VALUES (@ProdPouletId, @LotTestId3, '2026-03-09', N'POULET', 10, 20000.00, 150000.00, N'Restaurant local', N'Commande hebdomadaire');
END
GO

-- 4) HistoriqueAchat de test
DECLARE @PrevisionAlimentId BIGINT = (
	SELECT TOP 1 PrevisionId
	FROM Prevision
	WHERE Category = N'ALIMENT'
	ORDER BY PrevisionId DESC
);

DECLARE @LotTestId4 INT = NULL;
IF OBJECT_ID(N'Lot', N'U') IS NOT NULL
BEGIN
	SELECT TOP 1 @LotTestId4 = LotId FROM Lot ORDER BY LotId;
END

IF NOT EXISTS (
	SELECT 1 FROM HistoriqueAchat
	WHERE PurchaseDate = '2026-03-07'
	  AND Category = N'ALIMENT'
	  AND ItemName = N'Aliment croissance'
)
BEGIN
	INSERT INTO HistoriqueAchat (LotId, PrevisionId, PurchaseDate, Category, ItemName, Quantity, Unit, UnitPriceAr, SupplierName, Notes)
	VALUES (@LotTestId4, @PrevisionAlimentId, '2026-03-07', N'ALIMENT', N'Aliment croissance', 250.000, N'KG', 950.00, N'Fournisseur A', N'Achat hebdomadaire');
END

IF NOT EXISTS (
	SELECT 1 FROM HistoriqueAchat
	WHERE PurchaseDate = '2026-03-08'
	  AND Category = N'MEDICAMENT'
	  AND ItemName = N'Vitamine volaille'
)
BEGIN
	INSERT INTO HistoriqueAchat (LotId, PrevisionId, PurchaseDate, Category, ItemName, Quantity, Unit, UnitPriceAr, SupplierName, Notes)
	VALUES (@LotTestId4, NULL, '2026-03-08', N'MEDICAMENT', N'Vitamine volaille', 10.000, N'PIECE', 6000.00, N'Pharma Vet', N'Reapprovisionnement');
END
GO
