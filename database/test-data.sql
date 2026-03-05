/*
  Données de test cohérentes - Suivi d'élevage AkoFre
  Période : Février 2026 (4 semaines)
  
  Scénario :
    - LOT-CH-001 : 200 poulets chair (Cobb 500), éclos le 01/02/2026
    - LOT-PO-001 : 150 poules pondeuses (ISA Brown), éclos le 15/01/2026
    - 1 incubation d'oeufs du lot pondeuse, démarrée le 10/02/2026
    - Suivi hebdomadaire poulets : semaines 1 à 4
    - Suivi hebdomadaire oeufs : semaines 3 à 6 (les poules pondent depuis la semaine 3)
    - Historiques datés dans le mois
    - Traitement d'oeufs : ventes + incubation
*/

USE SuiviAkoho;
GO

SET NOCOUNT ON;
GO

/* =========================
   DONNÉES DE RÉFÉRENCE
   ========================= */

-- Sexe
INSERT INTO elevage.Sexe (Code, Label)
SELECT N'FEMELLE', N'Femelle'
WHERE NOT EXISTS (SELECT 1 FROM elevage.Sexe WHERE Code = N'FEMELLE');

INSERT INTO elevage.Sexe (Code, Label)
SELECT N'MALE', N'Mâle'
WHERE NOT EXISTS (SELECT 1 FROM elevage.Sexe WHERE Code = N'MALE');
GO

-- TypeProduction
INSERT INTO elevage.TypeProduction (Code, Label)
SELECT N'CHAIR', N'Poulet chair'
WHERE NOT EXISTS (SELECT 1 FROM elevage.TypeProduction WHERE Code = N'CHAIR');

INSERT INTO elevage.TypeProduction (Code, Label, SexeId)
SELECT N'PONDEUSE', N'Poule pondeuse', (SELECT SexeId FROM elevage.Sexe WHERE Code = N'FEMELLE')
WHERE NOT EXISTS (SELECT 1 FROM elevage.TypeProduction WHERE Code = N'PONDEUSE');
GO

-- PhaseAlimentation
INSERT INTO elevage.PhaseAlimentation (Code, Label, WeekFrom, WeekTo, RationMinGPerDay, RationMaxGPerDay, Objective)
SELECT N'STARTER', N'Starter', 0, 3, 20, 50, N'Croissance rapide'
WHERE NOT EXISTS (SELECT 1 FROM elevage.PhaseAlimentation WHERE Code = N'STARTER');

INSERT INTO elevage.PhaseAlimentation (Code, Label, WeekFrom, WeekTo, RationMinGPerDay, RationMaxGPerDay, Objective)
SELECT N'GROWER', N'Grower', 3, 5, 50, 120, N'Développement musculaire'
WHERE NOT EXISTS (SELECT 1 FROM elevage.PhaseAlimentation WHERE Code = N'GROWER');

INSERT INTO elevage.PhaseAlimentation (Code, Label, WeekFrom, WeekTo, RationMinGPerDay, RationMaxGPerDay, Objective)
SELECT N'FINISHER', N'Finisher', 5, 6, 120, 120, N'Finition poids'
WHERE NOT EXISTS (SELECT 1 FROM elevage.PhaseAlimentation WHERE Code = N'FINISHER');
GO

-- ReferenceCompositionAliment
INSERT INTO elevage.ReferenceCompositionAliment (Ingredient, PercentMin, PercentMax, Notes)
SELECT N'Maïs', 60, 60, N'Composition locale typique'
WHERE NOT EXISTS (SELECT 1 FROM elevage.ReferenceCompositionAliment WHERE Ingredient = N'Maïs');

INSERT INTO elevage.ReferenceCompositionAliment (Ingredient, PercentMin, PercentMax, Notes)
SELECT N'Son de riz', NULL, NULL, N'Composition locale typique'
WHERE NOT EXISTS (SELECT 1 FROM elevage.ReferenceCompositionAliment WHERE Ingredient = N'Son de riz');

INSERT INTO elevage.ReferenceCompositionAliment (Ingredient, PercentMin, PercentMax, Notes)
SELECT N'Concentré protéiné', NULL, NULL, N'Composition locale typique'
WHERE NOT EXISTS (SELECT 1 FROM elevage.ReferenceCompositionAliment WHERE Ingredient = N'Concentré protéiné');

INSERT INTO elevage.ReferenceCompositionAliment (Ingredient, PercentMin, PercentMax, Notes)
SELECT N'Calcium', 3, 4, N'Pour ponte'
WHERE NOT EXISTS (SELECT 1 FROM elevage.ReferenceCompositionAliment WHERE Ingredient = N'Calcium');
GO

/* =========================
   RACES
   ========================= */

INSERT INTO elevage.Race (Name, DescriptionJson)
SELECT N'Cobb 500', N'{"origine":"USA","type":"chair","poidsAdulteKg":2.5,"croissance":"rapide","plumage":"blanc"}'
WHERE NOT EXISTS (SELECT 1 FROM elevage.Race WHERE Name = N'Cobb 500');

INSERT INTO elevage.Race (Name, DescriptionJson)
SELECT N'ISA Brown', N'{"origine":"France","type":"pondeuse","oeufsParAn":300,"plumage":"brun","maturite":"18 semaines"}'
WHERE NOT EXISTS (SELECT 1 FROM elevage.Race WHERE Name = N'ISA Brown');
GO

/* =========================
   LOTS
   ========================= */

-- Variables pour les IDs
DECLARE @RaceCobb INT = (SELECT RaceId FROM elevage.Race WHERE Name = N'Cobb 500');
DECLARE @RaceISA INT = (SELECT RaceId FROM elevage.Race WHERE Name = N'ISA Brown');
DECLARE @TypeChair TINYINT = (SELECT TypeProductionId FROM elevage.TypeProduction WHERE Code = N'CHAIR');
DECLARE @TypePondeuse TINYINT = (SELECT TypeProductionId FROM elevage.TypeProduction WHERE Code = N'PONDEUSE');

-- Lot 1 : 200 poulets chair Cobb 500, éclos le 1er février 2026
INSERT INTO elevage.Lot (LotCode, RaceId, TypeProductionId, HatchDate, InitialCount, MaleCount, FemaleCount, Status, PurchaseValue)
SELECT N'LOT-CH-001', @RaceCobb, @TypeChair, '2026-02-01', 200, 105, 95, N'ACTIF', 400000.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.Lot WHERE LotCode = N'LOT-CH-001');

-- Lot 2 : 150 poules pondeuses ISA Brown, éclos le 15 janvier 2026 (déjà en ponte début février)
INSERT INTO elevage.Lot (LotCode, RaceId, TypeProductionId, HatchDate, InitialCount, MaleCount, FemaleCount, Status, PurchaseValue)
SELECT N'LOT-PO-001', @RaceISA, @TypePondeuse, '2026-01-15', 150, 0, 150, N'ACTIF', 525000.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.Lot WHERE LotCode = N'LOT-PO-001');
GO

/* =========================
   SUIVI POULET (LOT-CH-001) — Semaines 1 à 4
   Scénario : poussins grossissent, quelques pertes naturelles
   ========================= */

DECLARE @LotChair INT = (SELECT LotId FROM elevage.Lot WHERE LotCode = N'LOT-CH-001');

-- Semaine 1 (01-07 fév) : poussins de 42g, 3 morts
INSERT INTO elevage.SuiviPoulet (LotId, WeekNumber, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr)
SELECT @LotChair, 1, 197, 42.00, 2.800, 8400.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviPoulet WHERE LotId = @LotChair AND WeekNumber = 1);

-- Semaine 2 (08-14 fév) : croissance bonne, 1 mort
INSERT INTO elevage.SuiviPoulet (LotId, WeekNumber, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr)
SELECT @LotChair, 2, 196, 125.50, 6.500, 19500.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviPoulet WHERE LotId = @LotChair AND WeekNumber = 2);

-- Semaine 3 (15-21 fév) : passage au grower, 2 morts
INSERT INTO elevage.SuiviPoulet (LotId, WeekNumber, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr)
SELECT @LotChair, 3, 194, 320.00, 14.200, 42600.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviPoulet WHERE LotId = @LotChair AND WeekNumber = 3);

-- Semaine 4 (22-28 fév) : bonne croissance, 1 mort
INSERT INTO elevage.SuiviPoulet (LotId, WeekNumber, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr)
SELECT @LotChair, 4, 193, 580.00, 22.500, 67500.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviPoulet WHERE LotId = @LotChair AND WeekNumber = 4);
GO

/* =========================
   SUIVI OEUF (LOT-PO-001) — Semaines 3 à 6 du lot
   Les poules ISA Brown ont éclos le 15/01, donc en semaine 3 on est début février
   ========================= */

DECLARE @LotPondeuse INT = (SELECT LotId FROM elevage.Lot WHERE LotCode = N'LOT-PO-001');

-- Semaine 3 (29 jan - 04 fév) : début de ponte, taux faible
INSERT INTO elevage.SuiviOeuf (LotId, WeekNumber, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr)
SELECT @LotPondeuse, 3, 45.00, 315, 30.00, 94500.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviOeuf WHERE LotId = @LotPondeuse AND WeekNumber = 3);

-- Semaine 4 (05-11 fév) : montée en ponte
INSERT INTO elevage.SuiviOeuf (LotId, WeekNumber, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr)
SELECT @LotPondeuse, 4, 82.00, 574, 54.67, 172200.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviOeuf WHERE LotId = @LotPondeuse AND WeekNumber = 4);

-- Semaine 5 (12-18 fév) : bonne production
INSERT INTO elevage.SuiviOeuf (LotId, WeekNumber, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr)
SELECT @LotPondeuse, 5, 112.00, 784, 74.67, 235200.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviOeuf WHERE LotId = @LotPondeuse AND WeekNumber = 5);

-- Semaine 6 (19-25 fév) : pic de ponte
INSERT INTO elevage.SuiviOeuf (LotId, WeekNumber, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr)
SELECT @LotPondeuse, 6, 127.00, 889, 84.67, 266700.00
WHERE NOT EXISTS (SELECT 1 FROM elevage.SuiviOeuf WHERE LotId = @LotPondeuse AND WeekNumber = 6);
GO

/* =========================
   INCUBATION — Oeufs du lot pondeuse
   30 oeufs mis en incubation le 10 février, éclosion prévue le 3 mars
   ========================= */

DECLARE @LotPondeuse2 INT = (SELECT LotId FROM elevage.Lot WHERE LotCode = N'LOT-PO-001');

INSERT INTO elevage.Incubation (SourceLotId, StartDate, IncubatorType, EggsSetCount, EggsHatchedCount, CreatedLotId)
SELECT @LotPondeuse2, '2026-02-10', N'MODERNE', 30, NULL, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM elevage.Incubation
    WHERE SourceLotId = @LotPondeuse2 AND StartDate = '2026-02-10'
);
GO

/* =========================
   TRAITEMENT DES OEUFS
   Semaine 4 : vente de 500 oeufs + 30 en incubation
   Semaine 5 : vente de 700 oeufs
   Semaine 6 : vente de 850 oeufs
   ========================= */

DECLARE @LotPo INT = (SELECT LotId FROM elevage.Lot WHERE LotCode = N'LOT-PO-001');
DECLARE @SuiviOeufS4 BIGINT = (SELECT SuiviOeufId FROM elevage.SuiviOeuf WHERE LotId = @LotPo AND WeekNumber = 4);
DECLARE @SuiviOeufS5 BIGINT = (SELECT SuiviOeufId FROM elevage.SuiviOeuf WHERE LotId = @LotPo AND WeekNumber = 5);
DECLARE @SuiviOeufS6 BIGINT = (SELECT SuiviOeufId FROM elevage.SuiviOeuf WHERE LotId = @LotPo AND WeekNumber = 6);
DECLARE @IncubId INT = (SELECT TOP 1 IncubationId FROM elevage.Incubation WHERE SourceLotId = @LotPo AND StartDate = '2026-02-10');

-- Semaine 4 : vente de 500 oeufs à 300 Ar pièce
INSERT INTO elevage.TraitementOeufs (SuiviOeufId, ProcessType, EggCount, UnitPriceAr, IncubationId)
SELECT @SuiviOeufS4, N'VENTE', 500, 300.00, NULL
WHERE @SuiviOeufS4 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM elevage.TraitementOeufs
    WHERE SuiviOeufId = @SuiviOeufS4 AND ProcessType = N'VENTE'
  );

-- Semaine 4 : 30 oeufs mis en incubation
INSERT INTO elevage.TraitementOeufs (SuiviOeufId, ProcessType, EggCount, UnitPriceAr, IncubationId)
SELECT @SuiviOeufS4, N'INCUBATION', 30, NULL, @IncubId
WHERE @SuiviOeufS4 IS NOT NULL AND @IncubId IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM elevage.TraitementOeufs
    WHERE SuiviOeufId = @SuiviOeufS4 AND ProcessType = N'INCUBATION'
  );

-- Semaine 5 : vente de 700 oeufs à 300 Ar pièce
INSERT INTO elevage.TraitementOeufs (SuiviOeufId, ProcessType, EggCount, UnitPriceAr, IncubationId)
SELECT @SuiviOeufS5, N'VENTE', 700, 300.00, NULL
WHERE @SuiviOeufS5 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM elevage.TraitementOeufs
    WHERE SuiviOeufId = @SuiviOeufS5 AND ProcessType = N'VENTE'
  );

-- Semaine 6 : vente de 850 oeufs à 300 Ar pièce
INSERT INTO elevage.TraitementOeufs (SuiviOeufId, ProcessType, EggCount, UnitPriceAr, IncubationId)
SELECT @SuiviOeufS6, N'VENTE', 850, 300.00, NULL
WHERE @SuiviOeufS6 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM elevage.TraitementOeufs
    WHERE SuiviOeufId = @SuiviOeufS6 AND ProcessType = N'VENTE'
  );
GO

/* =========================
   HISTORIQUE SUIVI POULET (LOT-CH-001)
   Entrées en milieu de semaine pour suivre l'évolution
   ========================= */

DECLARE @LotCh INT = (SELECT LotId FROM elevage.Lot WHERE LotCode = N'LOT-CH-001');
DECLARE @SPouletS1 BIGINT = (SELECT SuiviPouletId FROM elevage.SuiviPoulet WHERE LotId = @LotCh AND WeekNumber = 1);
DECLARE @SPouletS2 BIGINT = (SELECT SuiviPouletId FROM elevage.SuiviPoulet WHERE LotId = @LotCh AND WeekNumber = 2);
DECLARE @SPouletS3 BIGINT = (SELECT SuiviPouletId FROM elevage.SuiviPoulet WHERE LotId = @LotCh AND WeekNumber = 3);
DECLARE @SPouletS4 BIGINT = (SELECT SuiviPouletId FROM elevage.SuiviPoulet WHERE LotId = @LotCh AND WeekNumber = 4);

-- Sem 1 : contrôle le 03/02 — 2 morts constatés, poussins à 38g
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS1, '2026-02-03', 198, 38.00, 1.200, 3600.00, N'2 poussins morts (faiblesse)'
WHERE @SPouletS1 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS1 AND DateEntree = '2026-02-03');

-- Sem 1 : fin de semaine 07/02 — 1 mort supplémentaire
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS1, '2026-02-07', 197, 42.00, 2.800, 8400.00, N'Fin semaine 1, total 3 pertes'
WHERE @SPouletS1 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS1 AND DateEntree = '2026-02-07');

-- Sem 2 : contrôle le 11/02 — bonne croissance
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS2, '2026-02-11', 196, 100.00, 4.200, 12600.00, N'Croissance normale, aucun problème'
WHERE @SPouletS2 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS2 AND DateEntree = '2026-02-11');

-- Sem 2 : fin de semaine 14/02
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS2, '2026-02-14', 196, 125.50, 6.500, 19500.00, N'Poids conforme aux objectifs'
WHERE @SPouletS2 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS2 AND DateEntree = '2026-02-14');

-- Sem 3 : contrôle le 18/02 — 1 mort, passage grower
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS3, '2026-02-18', 195, 280.00, 10.000, 30000.00, N'Passage à l''aliment grower, 1 mort'
WHERE @SPouletS3 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS3 AND DateEntree = '2026-02-18');

-- Sem 3 : fin de semaine 21/02
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS3, '2026-02-21', 194, 320.00, 14.200, 42600.00, N'1 mort supplémentaire, reste 194'
WHERE @SPouletS3 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS3 AND DateEntree = '2026-02-21');

-- Sem 4 : contrôle le 25/02 — stable
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS4, '2026-02-25', 193, 500.00, 16.000, 48000.00, N'Bonne prise de poids, lot sain'
WHERE @SPouletS4 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS4 AND DateEntree = '2026-02-25');

-- Sem 4 : fin de semaine 28/02
INSERT INTO elevage.HistoriqueSuiviPoulet (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes)
SELECT @SPouletS4, '2026-02-28', 193, 580.00, 22.500, 67500.00, N'Fin du mois, prêts pour la semaine 5'
WHERE @SPouletS4 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviPoulet WHERE SuiviPouletId = @SPouletS4 AND DateEntree = '2026-02-28');
GO

/* =========================
   HISTORIQUE SUIVI OEUF (LOT-PO-001)
   ========================= */

DECLARE @LotPo2 INT = (SELECT LotId FROM elevage.Lot WHERE LotCode = N'LOT-PO-001');
DECLARE @SOeufS4 BIGINT = (SELECT SuiviOeufId FROM elevage.SuiviOeuf WHERE LotId = @LotPo2 AND WeekNumber = 4);
DECLARE @SOeufS5 BIGINT = (SELECT SuiviOeufId FROM elevage.SuiviOeuf WHERE LotId = @LotPo2 AND WeekNumber = 5);
DECLARE @SOeufS6 BIGINT = (SELECT SuiviOeufId FROM elevage.SuiviOeuf WHERE LotId = @LotPo2 AND WeekNumber = 6);

-- Sem 4 : relevé le 07/02 — ponte en hausse
INSERT INTO elevage.HistoriqueSuiviOeuf (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes)
SELECT @SOeufS4, '2026-02-07', 72.00, 504, 48.00, 151200.00, N'Montée progressive de la ponte'
WHERE @SOeufS4 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviOeuf WHERE SuiviOeufId = @SOeufS4 AND DateEntree = '2026-02-07');

-- Sem 4 : fin de semaine 11/02
INSERT INTO elevage.HistoriqueSuiviOeuf (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes)
SELECT @SOeufS4, '2026-02-11', 82.00, 574, 54.67, 172200.00, N'Bonne progression, 30 oeufs réservés pour incubation'
WHERE @SOeufS4 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviOeuf WHERE SuiviOeufId = @SOeufS4 AND DateEntree = '2026-02-11');

-- Sem 5 : relevé le 14/02
INSERT INTO elevage.HistoriqueSuiviOeuf (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes)
SELECT @SOeufS5, '2026-02-14', 105.00, 735, 70.00, 220500.00, N'Les poules montent en régime'
WHERE @SOeufS5 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviOeuf WHERE SuiviOeufId = @SOeufS5 AND DateEntree = '2026-02-14');

-- Sem 5 : fin de semaine 18/02
INSERT INTO elevage.HistoriqueSuiviOeuf (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes)
SELECT @SOeufS5, '2026-02-18', 112.00, 784, 74.67, 235200.00, N'Production stabilisée à 74%'
WHERE @SOeufS5 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviOeuf WHERE SuiviOeufId = @SOeufS5 AND DateEntree = '2026-02-18');

-- Sem 6 : relevé le 21/02 — pic
INSERT INTO elevage.HistoriqueSuiviOeuf (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes)
SELECT @SOeufS6, '2026-02-21', 120.00, 840, 80.00, 252000.00, N'Approche du pic de ponte'
WHERE @SOeufS6 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviOeuf WHERE SuiviOeufId = @SOeufS6 AND DateEntree = '2026-02-21');

-- Sem 6 : fin de semaine 25/02
INSERT INTO elevage.HistoriqueSuiviOeuf (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes)
SELECT @SOeufS6, '2026-02-25', 127.00, 889, 84.67, 266700.00, N'Pic de ponte atteint, très bon rendement'
WHERE @SOeufS6 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueSuiviOeuf WHERE SuiviOeufId = @SOeufS6 AND DateEntree = '2026-02-25');
GO

/* =========================
   HISTORIQUE INCUBATION
   Suivi de l'incubation démarrée le 10/02 (éclosion prévue le 03/03)
   ========================= */

DECLARE @IncubTest INT = (SELECT TOP 1 IncubationId FROM elevage.Incubation WHERE StartDate = '2026-02-10');

-- Jour 5 : mirage, 2 oeufs clairs retirés
INSERT INTO elevage.HistoriqueIncubation (IncubationId, DateEntree, IncubatorType, EggsSetCount, EggsHatchedCount, HatchRatePct, Notes)
SELECT @IncubTest, '2026-02-15', N'MODERNE', 28, NULL, NULL, N'Mirage J5 : 2 oeufs clairs retirés, reste 28 fertiles'
WHERE @IncubTest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueIncubation WHERE IncubationId = @IncubTest AND DateEntree = '2026-02-15');

-- Jour 10 : 2ème mirage
INSERT INTO elevage.HistoriqueIncubation (IncubationId, DateEntree, IncubatorType, EggsSetCount, EggsHatchedCount, HatchRatePct, Notes)
SELECT @IncubTest, '2026-02-20', N'MODERNE', 27, NULL, NULL, N'Mirage J10 : 1 oeuf mort retiré, 27 embryons viables'
WHERE @IncubTest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueIncubation WHERE IncubationId = @IncubTest AND DateEntree = '2026-02-20');

-- Jour 18 : transfert en éclosoir
INSERT INTO elevage.HistoriqueIncubation (IncubationId, DateEntree, IncubatorType, EggsSetCount, EggsHatchedCount, HatchRatePct, Notes)
SELECT @IncubTest, '2026-02-28', N'MODERNE', 27, NULL, NULL, N'Transfert éclosoir J18, tous les 27 oeufs en bon état'
WHERE @IncubTest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM elevage.HistoriqueIncubation WHERE IncubationId = @IncubTest AND DateEntree = '2026-02-28');
GO

PRINT N'=== Données de test insérées avec succès ===';
GO
