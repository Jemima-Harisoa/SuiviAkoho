import { getPool } from '../config/database.config';
import { SuiviPoulet, CreateSuiviPouletDTO, UpdateSuiviPouletDTO } from '../models/suivi-poulet.model';
import sql from 'mssql';

export async function findAll(): Promise<SuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      SuiviPouletId AS suiviPouletId,
      LotId AS lotId,
      WeekNumber AS week,
      RemainingCount AS remainingCount,
      AvgWeightG AS avgWeightG,
      FeedTotalKg AS feedTotalKg,
      FeedCostAr AS feedCostAr,
      CreatedAt AS createdAt
      FROM SuiviPoulet
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findByLot(lotId: number): Promise<SuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT 
      SuiviPouletId AS suiviPouletId,
      LotId AS lotId,
      WeekNumber AS week,
      RemainingCount AS remainingCount,
      AvgWeightG AS avgWeightG,
      FeedTotalKg AS feedTotalKg,
      FeedCostAr AS feedCostAr,
      CreatedAt AS createdAt
      FROM SuiviPoulet
      WHERE LotId = @lotId
      ORDER BY WeekNumber ASC`);
  
  return result.recordset;
}

export async function findByLotAndWeek(lotId: number, week: number): Promise<SuiviPoulet | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .input('week', sql.Int, week)
    .query(`SELECT 
      SuiviPouletId AS suiviPouletId,
      LotId AS lotId,
      WeekNumber AS week,
      RemainingCount AS remainingCount,
      AvgWeightG AS avgWeightG,
      FeedTotalKg AS feedTotalKg,
      FeedCostAr AS feedCostAr,
      CreatedAt AS createdAt
      FROM SuiviPoulet
      WHERE LotId = @lotId AND WeekNumber = @week`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateSuiviPouletDTO): Promise<SuiviPoulet> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId)
    .input('weekNumber', sql.Int, data.week)
    .input('remainingCount', sql.Int, data.remainingCount ?? 0)
    .input('avgWeightG', sql.Decimal(10, 2), data.avgWeightG ?? null)
    .input('feedTotalKg', sql.Decimal(12, 3), data.feedTotalKg ?? null)
    .input('feedCostAr', sql.Decimal(18, 2), data.feedCostAr ?? null)
    .query(`INSERT INTO SuiviPoulet
      (LotId, WeekNumber, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, CreatedAt)
      OUTPUT
        INSERTED.SuiviPouletId AS suiviPouletId,
        INSERTED.LotId AS lotId,
        INSERTED.WeekNumber AS week,
        INSERTED.RemainingCount AS remainingCount,
        INSERTED.AvgWeightG AS avgWeightG,
        INSERTED.FeedTotalKg AS feedTotalKg,
        INSERTED.FeedCostAr AS feedCostAr,
        INSERTED.CreatedAt AS createdAt
      VALUES (@lotId, @weekNumber, @remainingCount, @avgWeightG, @feedTotalKg, @feedCostAr, GETDATE())`)
  
  return result.recordset[0];
}

export async function update(suiviPouletId: number, data: UpdateSuiviPouletDTO): Promise<SuiviPoulet> {
  const pool = await getPool();
  
  const updates: string[] = [];
  const request = pool.request().input('id', sql.Int, suiviPouletId);
  
  if (data.remainingCount !== undefined) {
    updates.push('RemainingCount = @remainingCount');
    request.input('remainingCount', sql.Int, data.remainingCount);
  }
  if (data.avgWeightG !== undefined) {
    updates.push('AvgWeightG = @avgWeightG');
    request.input('avgWeightG', sql.Decimal(10, 2), data.avgWeightG);
  }
  if (data.feedTotalKg !== undefined) {
    updates.push('FeedTotalKg = @feedTotalKg');
    request.input('feedTotalKg', sql.Decimal(12, 3), data.feedTotalKg);
  }
  if (data.feedCostAr !== undefined) {
    updates.push('FeedCostAr = @feedCostAr');
    request.input('feedCostAr', sql.Decimal(18, 2), data.feedCostAr);
  }
  
  const result = await request.query(`UPDATE SuiviPoulet
    SET ${updates.join(', ')}
    OUTPUT
      INSERTED.SuiviPouletId AS suiviPouletId,
      INSERTED.LotId AS lotId,
      INSERTED.WeekNumber AS week,
      INSERTED.RemainingCount AS remainingCount,
      INSERTED.AvgWeightG AS avgWeightG,
      INSERTED.FeedTotalKg AS feedTotalKg,
      INSERTED.FeedCostAr AS feedCostAr,
      INSERTED.CreatedAt AS createdAt
    WHERE SuiviPouletId = @id`);
  
  return result.recordset[0];
}

export async function delete$(suiviPouletId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, suiviPouletId)
    .query(`DELETE FROM SuiviPoulet WHERE SuiviPouletId = @id`);
}
