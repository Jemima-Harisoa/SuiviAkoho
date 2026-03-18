/*
  Schéma SQL Server - Suivi d'élevage de poulets (AkoFre)
  Version corrigée et optimisée
*/

SET NOCOUNT ON;
GO

IF DB_ID(N'SuiviAkoho') IS NULL
    CREATE DATABASE SuiviAkoho;
GO

USE SuiviAkoho;
GO

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO


/* =========================
   TABLES DE RÉFÉRENCE
   ========================= */

-- Table : Référentiel des sexes de poulets
CREATE TABLE Sexe (
    SexeId TINYINT IDENTITY PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Label NVARCHAR(100) NOT NULL
);
GO

-- Table : Type de production (chair / pondeuse)
CREATE TABLE TypeProduction (
    TypeProductionId TINYINT IDENTITY PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Label NVARCHAR(100) NOT NULL,
    SexeId TINYINT NULL,
    CONSTRAINT FK_TypeProduction_Sexe FOREIGN KEY (SexeId)
        REFERENCES Sexe(SexeId)
);
GO

-- Table : Référentiel des races de poulets (descriptif JSON)
CREATE TABLE Race (
    RaceId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(120) NOT NULL UNIQUE,
    DescriptionJson NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Race_Json CHECK (DescriptionJson IS NULL OR ISJSON(DescriptionJson) = 1)
);
GO

-- Table : Phases d'alimentation par tranche d'âge (par race et type de production)
CREATE TABLE PhaseAlimentation (
    PhaseAlimentationId TINYINT IDENTITY PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Label NVARCHAR(100) NOT NULL,
    WeekFrom TINYINT NOT NULL,
    WeekTo TINYINT NOT NULL,
    RationMinGPerDay DECIMAL(8,2) NOT NULL,
    RationMaxGPerDay DECIMAL(8,2) NOT NULL,
    Objective NVARCHAR(200) NULL,
    RaceId INT NULL,
    TypeProductionId TINYINT NULL,

    CONSTRAINT FK_PhaseAlimentation_Race FOREIGN KEY (RaceId)
        REFERENCES Race(RaceId),

    CONSTRAINT FK_PhaseAlimentation_TypeProduction FOREIGN KEY (TypeProductionId)
        REFERENCES TypeProduction(TypeProductionId),

    CONSTRAINT CK_PhaseAlimentation_WeekRange CHECK (WeekFrom <= WeekTo),
    CONSTRAINT CK_PhaseAlimentation_Ration CHECK (RationMinGPerDay <= RationMaxGPerDay)
);
GO

-- Table : Référentiel de composition des aliments
CREATE TABLE ReferenceCompositionAliment (
    ReferenceCompositionAlimentId INT IDENTITY PRIMARY KEY,
    Ingredient NVARCHAR(120) NOT NULL,
    PercentMin DECIMAL(5,2) NULL,
    PercentMax DECIMAL(5,2) NULL,
    Notes NVARCHAR(250) NULL,
    RaceId INT NULL,
    TypeProductionId TINYINT NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(), -- date debut de l'alimentation

    CONSTRAINT FK_ReferenceComposition_TypeProduction FOREIGN KEY (TypeProductionId)
        REFERENCES TypeProduction(TypeProductionId),

    CONSTRAINT FK_ReferenceComposition_Race FOREIGN KEY (RaceId)
        REFERENCES Race(RaceId),

    CONSTRAINT CK_ReferenceComposition_Percent CHECK (
        (PercentMin IS NULL OR (PercentMin >= 0 AND PercentMin <= 100))
        AND (PercentMax IS NULL OR (PercentMax >= 0 AND PercentMax <= 100))
        AND (PercentMin IS NULL OR PercentMax IS NULL OR PercentMin <= PercentMax)
    )
);
GO

/* =========================
   ENTITÉS MÉTIER
   ========================= */

-- Table : Lots de volailles suivis dans l'élevage
CREATE TABLE Lot (
    LotId INT IDENTITY PRIMARY KEY,
    LotCode NVARCHAR(50) NOT NULL UNIQUE,
    RaceId INT NOT NULL,
    TypeProductionId TINYINT NOT NULL,
    HatchDate DATE NOT NULL,
    InitialCount INT NOT NULL,
    MaleCount INT NOT NULL DEFAULT 0,
    FemaleCount INT NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT N'ACTIF',
    PurchaseValue DECIMAL(18,2) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Lot_Race FOREIGN KEY (RaceId)
        REFERENCES Race(RaceId),

    CONSTRAINT FK_Lot_TypeProduction FOREIGN KEY (TypeProductionId)
        REFERENCES TypeProduction(TypeProductionId),

    CONSTRAINT CK_Lot_Initial CHECK (InitialCount > 0),
    CONSTRAINT CK_Lot_SexCount CHECK ((MaleCount + FemaleCount) <= InitialCount),
    CONSTRAINT CK_Lot_Status CHECK (Status IN (N'ACTIF', N'CLOTURE', N'ANNULE'))
);
GO

-- Table : Suivi des incubations d'oeufs (descriptif)
CREATE TABLE Incubation (
    IncubationId INT IDENTITY PRIMARY KEY,
    SourceLotId INT NULL,
    StartDate DATE NOT NULL,
    ExpectedHatchDate AS DATEADD(DAY, 21, StartDate) PERSISTED,
    IncubatorType NVARCHAR(20) NOT NULL,
    EggsSetCount INT NOT NULL,
    EggsHatchedCount INT NULL,
    HatchRatePct AS (
        CASE
            WHEN EggsHatchedCount IS NULL THEN NULL
            ELSE (EggsHatchedCount * 100.0 / EggsSetCount)
        END
    ) PERSISTED,
    CreatedLotId INT NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Incubation_SourceLot FOREIGN KEY (SourceLotId)
        REFERENCES Lot(LotId),

    CONSTRAINT FK_Incubation_CreatedLot FOREIGN KEY (CreatedLotId)
        REFERENCES Lot(LotId),

    CONSTRAINT CK_Incubation_Type CHECK (IncubatorType IN (N'NATUREL', N'MODERNE')),
    CONSTRAINT CK_Incubation_Eggs CHECK (EggsSetCount > 0),
    CONSTRAINT CK_Incubation_Hatched CHECK (EggsHatchedCount IS NULL OR EggsHatchedCount <= EggsSetCount)
);
GO

-- Table : Suivi hebdomadaire des poulets (descriptif, état initial par semaine)
CREATE TABLE SuiviPoulet (
    SuiviPouletId BIGINT IDENTITY PRIMARY KEY,
    LotId INT NOT NULL,
    WeekNumber SMALLINT NOT NULL,
    RemainingCount INT NOT NULL,
    AvgWeightG DECIMAL(10,2) NULL,
    FeedTotalKg DECIMAL(12,3) NULL,
    FeedCostAr DECIMAL(18,2) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_SuiviPoulet_Lot FOREIGN KEY (LotId)
        REFERENCES Lot(LotId),

    CONSTRAINT UQ_SuiviPoulet UNIQUE (LotId, WeekNumber),
    CONSTRAINT CK_SuiviPoulet_Remaining CHECK (RemainingCount >= 0)
);
GO

-- Table : Suivi hebdomadaire des oeufs (descriptif, état initial par semaine)
CREATE TABLE SuiviOeuf (
    SuiviOeufId BIGINT IDENTITY PRIMARY KEY,
    LotId INT NOT NULL,
    WeekNumber SMALLINT NOT NULL,
    EggsPerDay DECIMAL(10,2) NOT NULL,
    EggsPerWeek INT NOT NULL,
    LayingRatePct DECIMAL(5,2) NOT NULL,
    WeeklyRevenueAr DECIMAL(18,2) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_SuiviOeuf_Lot FOREIGN KEY (LotId)
        REFERENCES Lot(LotId),

    CONSTRAINT UQ_SuiviOeuf UNIQUE (LotId, WeekNumber)
);
GO

-- Table : Traitement des oeufs (vente ou incubation)
CREATE TABLE TraitementOeufs (
    TraitementOeufsId BIGINT IDENTITY PRIMARY KEY,
    SuiviOeufId BIGINT NOT NULL,
    SourceLotId INT NOT NULL,
    ProcessType NVARCHAR(20) NOT NULL,
    EggCount INT NOT NULL,
    UnitPriceAr DECIMAL(18,2) NULL,
    TotalAmountAr AS (
        CASE WHEN UnitPriceAr IS NULL THEN NULL
             ELSE UnitPriceAr * EggCount
        END
    ) PERSISTED,
    IncubationId INT NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_TraitementOeufs_SuiviOeuf FOREIGN KEY (SuiviOeufId)
        REFERENCES SuiviOeuf(SuiviOeufId),

    CONSTRAINT FK_TraitementOeufs_SourceLot FOREIGN KEY (SourceLotId)
        REFERENCES Lot(LotId),

    CONSTRAINT FK_TraitementOeufs_Incubation FOREIGN KEY (IncubationId)
        REFERENCES Incubation(IncubationId),

    CONSTRAINT CK_TraitementOeufs_ProcessType CHECK (ProcessType IN (N'VENTE', N'INCUBATION')),
    CONSTRAINT CK_TraitementOeufs_EggCount CHECK (EggCount > 0),
    CONSTRAINT CK_TraitementOeufs_UnitPrice CHECK (UnitPriceAr IS NULL OR UnitPriceAr >= 0)
);
GO

/* =========================
   TABLES D'HISTORIQUE
   ========================= */

-- Table : Historique des entrées de suivi poulet (évolution dans le temps)
CREATE TABLE HistoriqueSuiviPoulet (
    HistoriqueSuiviPouletId BIGINT IDENTITY PRIMARY KEY,
    SuiviPouletId BIGINT NOT NULL,
    DateEntree DATE NOT NULL,
    RemainingCount INT NULL,
    AvgWeightG DECIMAL(10,2) NULL,
    FeedTotalKg DECIMAL(12,3) NULL,
    FeedCostAr DECIMAL(18,2) NULL,
    Notes NVARCHAR(300) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_HistoSuiviPoulet_SuiviPoulet FOREIGN KEY (SuiviPouletId)
        REFERENCES SuiviPoulet(SuiviPouletId),

    CONSTRAINT UQ_HistoSuiviPoulet_Date UNIQUE (SuiviPouletId, DateEntree),
    CONSTRAINT CK_HistoSuiviPoulet_Remaining CHECK (RemainingCount IS NULL OR RemainingCount >= 0),
    CONSTRAINT CK_HistoSuiviPoulet_AvgWeight CHECK (AvgWeightG IS NULL OR AvgWeightG >= 0),
    CONSTRAINT CK_HistoSuiviPoulet_Feed CHECK (FeedTotalKg IS NULL OR FeedTotalKg >= 0),
    CONSTRAINT CK_HistoSuiviPoulet_FeedCost CHECK (FeedCostAr IS NULL OR FeedCostAr >= 0)
);
GO

-- Table : Historique des entrées de suivi oeuf (évolution dans le temps)
CREATE TABLE HistoriqueSuiviOeuf (
    HistoriqueSuiviOeufId BIGINT IDENTITY PRIMARY KEY,
    SuiviOeufId BIGINT NOT NULL,
    DateEntree DATE NOT NULL,
    EggsPerDay DECIMAL(10,2) NULL,
    EggsPerWeek INT NULL,
    LayingRatePct DECIMAL(5,2) NULL,
    WeeklyRevenueAr DECIMAL(18,2) NULL,
    Notes NVARCHAR(300) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_HistoSuiviOeuf_SuiviOeuf FOREIGN KEY (SuiviOeufId)
        REFERENCES SuiviOeuf(SuiviOeufId),

    CONSTRAINT UQ_HistoSuiviOeuf_Date UNIQUE (SuiviOeufId, DateEntree),
    CONSTRAINT CK_HistoSuiviOeuf_EggsDay CHECK (EggsPerDay IS NULL OR EggsPerDay >= 0),
    CONSTRAINT CK_HistoSuiviOeuf_EggsWeek CHECK (EggsPerWeek IS NULL OR EggsPerWeek >= 0),
    CONSTRAINT CK_HistoSuiviOeuf_Rate CHECK (LayingRatePct IS NULL OR (LayingRatePct >= 0 AND LayingRatePct <= 100)),
    CONSTRAINT CK_HistoSuiviOeuf_Revenue CHECK (WeeklyRevenueAr IS NULL OR WeeklyRevenueAr >= 0)
);
GO

-- Table : Historique des entrées d'incubation (évolution dans le temps)
CREATE TABLE HistoriqueIncubation (
    HistoriqueIncubationId BIGINT IDENTITY PRIMARY KEY,
    IncubationId INT NOT NULL,
    DateEntree DATE NOT NULL,
    IncubatorType NVARCHAR(20) NULL,
    EggsSetCount INT NULL,
    EggsHatchedCount INT NULL,
    HatchRatePct DECIMAL(5,2) NULL,
    Notes NVARCHAR(300) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_HistoIncubation_Incubation FOREIGN KEY (IncubationId)
        REFERENCES Incubation(IncubationId),

    CONSTRAINT UQ_HistoIncubation_Date UNIQUE (IncubationId, DateEntree),
    CONSTRAINT CK_HistoIncubation_Type CHECK (IncubatorType IS NULL OR IncubatorType IN (N'NATUREL', N'MODERNE')),
    CONSTRAINT CK_HistoIncubation_EggsSet CHECK (EggsSetCount IS NULL OR EggsSetCount > 0),
    CONSTRAINT CK_HistoIncubation_EggsHatched CHECK (EggsHatchedCount IS NULL OR EggsHatchedCount >= 0),
    CONSTRAINT CK_HistoIncubation_HatchRate CHECK (HatchRatePct IS NULL OR (HatchRatePct >= 0 AND HatchRatePct <= 100))
);
GO

/* =========================
   INDEXES
   ========================= */

CREATE INDEX IX_Lot_HatchDate ON Lot(HatchDate);
GO

CREATE INDEX IX_Incubation_StartDate ON Incubation(StartDate);
GO

CREATE INDEX IX_SuiviPoulet_Lot ON SuiviPoulet(LotId, WeekNumber);
GO

CREATE INDEX IX_SuiviOeuf_Lot ON SuiviOeuf(LotId, WeekNumber);
GO

CREATE INDEX IX_TraitementOeufs_SuiviOeuf ON TraitementOeufs(SuiviOeufId, ProcessType);
GO

CREATE INDEX IX_HistoSuiviPoulet_Date ON HistoriqueSuiviPoulet(SuiviPouletId, DateEntree);
GO

CREATE INDEX IX_HistoSuiviOeuf_Date ON HistoriqueSuiviOeuf(SuiviOeufId, DateEntree);
GO

CREATE INDEX IX_HistoIncubation_Date ON HistoriqueIncubation(IncubationId, DateEntree);
GO
