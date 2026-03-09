/*
  Extension commerciale - Suivi d'elevage de poulets (AkoFre)
  Tables ajoutees:
	- Production
	- HistoriqueVente
	- Prevision
	- HistoriqueAchat

  Note:
	- Aucune table n'utilise de prefixe de schema (ex: elevage.)
	- Ce fichier suppose que les tables de base (Lot, SuiviOeuf, etc.)
	  existent egalement sans schema.
*/

USE SuiviAkoho;
GO

SET NOCOUNT ON;
GO

/* =========================
   TABLES DE GESTION COMMERCIALE
   ========================= */

-- Table : Stock destine a la vente immediate (oeufs et poulets disponibles)
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

	CONSTRAINT CK_Production_ProductType CHECK (ProductType IN (N'OEUF', N'POULET')),
	CONSTRAINT CK_Production_AvailableQty CHECK (AvailableQuantity >= 0),
	CONSTRAINT CK_Production_UnitPrice CHECK (UnitPriceAr IS NULL OR UnitPriceAr >= 0)
);
GO

-- Table : Historique des ventes realisees (CA, cout estime, benefice)
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

	CONSTRAINT CK_HistoriqueVente_ProductType CHECK (ProductType IN (N'OEUF', N'POULET')),
	CONSTRAINT CK_HistoriqueVente_Qty CHECK (Quantity > 0),
	CONSTRAINT CK_HistoriqueVente_UnitPrice CHECK (UnitPriceAr >= 0),
	CONSTRAINT CK_HistoriqueVente_EstimatedCost CHECK (EstimatedCostAr IS NULL OR EstimatedCostAr >= 0)
);
GO

-- Table : Planification des depenses (budget previsionnel)
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

	CONSTRAINT CK_Prevision_Category CHECK (Category IN (N'ALIMENT', N'MEDICAMENT', N'POUSSIN', N'MAINTENANCE', N'AUTRE')),
	CONSTRAINT CK_Prevision_PlannedAmount CHECK (PlannedAmountAr > 0),
	CONSTRAINT CK_Prevision_Status CHECK (Status IN (N'EN_ATTENTE', N'REALISEE', N'ANNULEE')),
	CONSTRAINT CK_Prevision_RealizedAmount CHECK (RealizedAmountAr IS NULL OR RealizedAmountAr >= 0)
);
GO

-- Table : Historique des achats et depenses (aliment, medicament, poussins, etc.)
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

	CONSTRAINT CK_HistoriqueAchat_Category CHECK (Category IN (N'ALIMENT', N'MEDICAMENT', N'POUSSIN', N'MAINTENANCE', N'AUTRE')),
	CONSTRAINT CK_HistoriqueAchat_Quantity CHECK (Quantity IS NULL OR Quantity > 0),
	CONSTRAINT CK_HistoriqueAchat_UnitPrice CHECK (UnitPriceAr IS NULL OR UnitPriceAr >= 0)
);
GO

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

CREATE INDEX IX_Production_Lot_ProductType
ON Production(LotId, ProductType);
GO

CREATE INDEX IX_HistoriqueVente_SaleDate
ON HistoriqueVente(SaleDate, ProductType);
GO

CREATE INDEX IX_HistoriqueVente_Lot
ON HistoriqueVente(LotId);
GO

CREATE INDEX IX_Prevision_Status_Date
ON Prevision(Status, PlannedDate);
GO

CREATE INDEX IX_Prevision_Category
ON Prevision(Category, PlannedDate);
GO

CREATE INDEX IX_HistoriqueAchat_Date_Category
ON HistoriqueAchat(PurchaseDate, Category);
GO

CREATE INDEX IX_HistoriqueAchat_Lot
ON HistoriqueAchat(LotId);
GO
