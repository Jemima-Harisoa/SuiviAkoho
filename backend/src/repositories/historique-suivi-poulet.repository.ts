import { getPool } from '../config/database.config';
import { HistoriqueSuiviPoulet, CreateHistoriqueSuiviPouletDTO, UpdateHistoriqueSuiviPouletDTO } from '../models/historique-suivi-poulet.model';
import sql from 'mssql';

export async function findAll(): Promise<HistoriqueSuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      HSP.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
      HSP.SuiviPouletId AS suiviPouletId,
      SP.LotId AS lotId,
      SP.WeekNumber AS weekNumber,
      HSP.DateEntree AS dateEntree,
      HSP.RemainingCount AS remainingCount,
      HSP.AvgWeightG AS avgWeightG,
      HSP.FeedTotalKg AS feedTotalKg,
      HSP.FeedCostAr AS feedCostAr,
      HSP.Notes AS notes,
      HSP.CreatedAt AS createdAt
      FROM HistoriqueSuiviPoulet HSP
      INNER JOIN SuiviPoulet SP ON SP.SuiviPouletId = HSP.SuiviPouletId
      ORDER BY HSP.CreatedAt DESC`);
  
  return result.recordset;
}

export async function findBySuiviPoulet(suiviPouletId: number): Promise<HistoriqueSuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviPouletId', sql.Int, suiviPouletId)
    .query(`SELECT 
      HSP.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
      HSP.SuiviPouletId AS suiviPouletId,
      SP.LotId AS lotId,
      SP.WeekNumber AS weekNumber,
      HSP.DateEntree AS dateEntree,
      HSP.RemainingCount AS remainingCount,
      HSP.AvgWeightG AS avgWeightG,
      HSP.FeedTotalKg AS feedTotalKg,
      HSP.FeedCostAr AS feedCostAr,
      HSP.Notes AS notes,
      HSP.CreatedAt AS createdAt
      FROM HistoriqueSuiviPoulet HSP
      INNER JOIN SuiviPoulet SP ON SP.SuiviPouletId = HSP.SuiviPouletId
      WHERE HSP.SuiviPouletId = @suiviPouletId
      ORDER BY HSP.DateEntree DESC`);
  
  return result.recordset;
}

export async function findBySuiviPouletAndDate(
  suiviPouletId: number,
  dateEntree: Date
): Promise<HistoriqueSuiviPoulet | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviPouletId', sql.Int, suiviPouletId)
    .input('dateEntree', sql.Date, dateEntree)
    .query(`SELECT
      HSP.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
      HSP.SuiviPouletId AS suiviPouletId,
      SP.LotId AS lotId,
      SP.WeekNumber AS weekNumber,
      HSP.DateEntree AS dateEntree,
      HSP.RemainingCount AS remainingCount,
      HSP.AvgWeightG AS avgWeightG,
      HSP.FeedTotalKg AS feedTotalKg,
      HSP.FeedCostAr AS feedCostAr,
      HSP.Notes AS notes,
      HSP.CreatedAt AS createdAt
      FROM HistoriqueSuiviPoulet HSP
      INNER JOIN SuiviPoulet SP ON SP.SuiviPouletId = HSP.SuiviPouletId
      WHERE HSP.SuiviPouletId = @suiviPouletId
        AND HSP.DateEntree = @dateEntree`);

  return result.recordset[0] ?? null;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueSuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`SELECT 
      HSP.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
      HSP.SuiviPouletId AS suiviPouletId,
      SP.LotId AS lotId,
      SP.WeekNumber AS weekNumber,
      HSP.DateEntree AS dateEntree,
      HSP.RemainingCount AS remainingCount,
      HSP.AvgWeightG AS avgWeightG,
      HSP.FeedTotalKg AS feedTotalKg,
      HSP.FeedCostAr AS feedCostAr,
      HSP.Notes AS notes,
      HSP.CreatedAt AS createdAt
      FROM HistoriqueSuiviPoulet HSP
      INNER JOIN SuiviPoulet SP ON SP.SuiviPouletId = HSP.SuiviPouletId
      WHERE HSP.DateEntree BETWEEN @startDate AND @endDate
      ORDER BY HSP.DateEntree DESC`);
  
  return result.recordset;
}

export async function findById(historiqueSuiviPouletId: number): Promise<HistoriqueSuiviPoulet | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, historiqueSuiviPouletId)
    .query(`SELECT 
      HSP.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
      HSP.SuiviPouletId AS suiviPouletId,
      SP.LotId AS lotId,
      SP.WeekNumber AS weekNumber,
      HSP.DateEntree AS dateEntree,
      HSP.RemainingCount AS remainingCount,
      HSP.AvgWeightG AS avgWeightG,
      HSP.FeedTotalKg AS feedTotalKg,
      HSP.FeedCostAr AS feedCostAr,
      HSP.Notes AS notes,
      HSP.CreatedAt AS createdAt
      FROM HistoriqueSuiviPoulet HSP
      INNER JOIN SuiviPoulet SP ON SP.SuiviPouletId = HSP.SuiviPouletId
      WHERE HSP.HistoriqueSuiviPouletId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function findByLot(lotId: number): Promise<HistoriqueSuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT
      HSP.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
      HSP.SuiviPouletId AS suiviPouletId,
      SP.LotId AS lotId,
      SP.WeekNumber AS weekNumber,
      HSP.DateEntree AS dateEntree,
      HSP.RemainingCount AS remainingCount,
      HSP.AvgWeightG AS avgWeightG,
      HSP.FeedTotalKg AS feedTotalKg,
      HSP.FeedCostAr AS feedCostAr,
      HSP.Notes AS notes,
      HSP.CreatedAt AS createdAt
      FROM HistoriqueSuiviPoulet HSP
      INNER JOIN SuiviPoulet SP ON SP.SuiviPouletId = HSP.SuiviPouletId
      WHERE SP.LotId = @lotId
      ORDER BY HSP.DateEntree DESC, HSP.CreatedAt DESC`);

  return result.recordset;
}

export async function create(data: CreateHistoriqueSuiviPouletDTO): Promise<HistoriqueSuiviPoulet> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviPouletId', sql.Int, data.suiviPouletId)
    .input('dateEntree', sql.Date, data.dateEntree)
    .input('remainingCount', sql.Int, data.remainingCount ?? null)
    .input('avgWeightG', sql.Decimal(10, 2), data.avgWeightG ?? null)
    .input('feedTotalKg', sql.Decimal(12, 3), data.feedTotalKg ?? null)
    .input('feedCostAr', sql.Decimal(18, 2), data.feedCostAr ?? null)
    .input('notes', sql.NVarChar(300), data.notes ?? null)
    .query(`INSERT INTO HistoriqueSuiviPoulet
      (SuiviPouletId, DateEntree, RemainingCount, AvgWeightG, FeedTotalKg, FeedCostAr, Notes, CreatedAt)
      OUTPUT
        INSERTED.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
        INSERTED.SuiviPouletId AS suiviPouletId,
        INSERTED.DateEntree AS dateEntree,
        INSERTED.RemainingCount AS remainingCount,
        INSERTED.AvgWeightG AS avgWeightG,
        INSERTED.FeedTotalKg AS feedTotalKg,
        INSERTED.FeedCostAr AS feedCostAr,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      VALUES (@suiviPouletId, @dateEntree, @remainingCount, @avgWeightG, @feedTotalKg, @feedCostAr, @notes, SYSUTCDATETIME())`);
  
  return result.recordset[0];
}

export async function update(historiqueSuiviPouletId: number, data: UpdateHistoriqueSuiviPouletDTO): Promise<HistoriqueSuiviPoulet> {
  const pool = await getPool();
  
  // Build the SET clause dynamically
  const setClauses: string[] = [];
  const request = pool.request();
  request.input('id', sql.Int, historiqueSuiviPouletId);
  
  if (data.remainingCount !== undefined) {
    setClauses.push('RemainingCount = @remainingCount');
    request.input('remainingCount', sql.Int, data.remainingCount ?? null);
  }
  if (data.avgWeightG !== undefined) {
    setClauses.push('AvgWeightG = @avgWeightG');
    request.input('avgWeightG', sql.Decimal(10, 2), data.avgWeightG ?? null);
  }
  if (data.feedTotalKg !== undefined) {
    setClauses.push('FeedTotalKg = @feedTotalKg');
    request.input('feedTotalKg', sql.Decimal(12, 3), data.feedTotalKg ?? null);
  }
  if (data.feedCostAr !== undefined) {
    setClauses.push('FeedCostAr = @feedCostAr');
    request.input('feedCostAr', sql.Decimal(18, 2), data.feedCostAr ?? null);
  }
  if (data.notes !== undefined) {
    setClauses.push('Notes = @notes');
    request.input('notes', sql.NVarChar(300), data.notes ?? null);
  }
  
  if (setClauses.length === 0) {
    const existing = await findById(historiqueSuiviPouletId);
    if (!existing) throw new Error('Historique suivi poulet non trouvé');
    return existing;
  }
  
  const result = await request
    .query(`UPDATE HistoriqueSuiviPoulet
      SET ${setClauses.join(', ')}
      OUTPUT
        INSERTED.HistoriqueSuiviPouletId AS historiqueSuiviPouletId,
        INSERTED.SuiviPouletId AS suiviPouletId,
        INSERTED.DateEntree AS dateEntree,
        INSERTED.RemainingCount AS remainingCount,
        INSERTED.AvgWeightG AS avgWeightG,
        INSERTED.FeedTotalKg AS feedTotalKg,
        INSERTED.FeedCostAr AS feedCostAr,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      WHERE HistoriqueSuiviPouletId = @id`);
  
  return result.recordset[0];
}

export async function delete_(historiqueSuiviPouletId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, historiqueSuiviPouletId)
    .query(`DELETE FROM HistoriqueSuiviPoulet WHERE HistoriqueSuiviPouletId = @id`);
}
