import { getPool } from '../config/database.config';
import { HistoriqueSuiviOeuf, CreateHistoriqueSuiviOeufDTO, UpdateHistoriqueSuiviOeufDTO } from '../models/historique-suivi-oeuf.model';
import sql from 'mssql';

export async function findAll(): Promise<HistoriqueSuiviOeuf[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
      SuiviOeufId AS suiviOeufId,
      DateEntree AS dateEntree,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      WeeklyRevenueAr AS weeklyRevenueAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueSuiviOeuf
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findBySuiviOeuf(suiviOeufId: number): Promise<HistoriqueSuiviOeuf[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, suiviOeufId)
    .query(`SELECT 
      HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
      SuiviOeufId AS suiviOeufId,
      DateEntree AS dateEntree,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      WeeklyRevenueAr AS weeklyRevenueAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueSuiviOeuf
      WHERE SuiviOeufId = @suiviOeufId
      ORDER BY DateEntree DESC`);
  
  return result.recordset;
}

export async function findBySuiviOeufAndDate(
  suiviOeufId: number,
  dateEntree: Date
): Promise<HistoriqueSuiviOeuf | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, suiviOeufId)
    .input('dateEntree', sql.Date, dateEntree)
    .query(`SELECT
      HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
      SuiviOeufId AS suiviOeufId,
      DateEntree AS dateEntree,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      WeeklyRevenueAr AS weeklyRevenueAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueSuiviOeuf
      WHERE SuiviOeufId = @suiviOeufId
        AND DateEntree = @dateEntree`);

  return result.recordset[0] ?? null;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueSuiviOeuf[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`SELECT 
      HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
      SuiviOeufId AS suiviOeufId,
      DateEntree AS dateEntree,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      WeeklyRevenueAr AS weeklyRevenueAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueSuiviOeuf
      WHERE DateEntree BETWEEN @startDate AND @endDate
      ORDER BY DateEntree DESC`);
  
  return result.recordset;
}

export async function findById(historiqueSuiviOeufId: number): Promise<HistoriqueSuiviOeuf | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, historiqueSuiviOeufId)
    .query(`SELECT 
      HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
      SuiviOeufId AS suiviOeufId,
      DateEntree AS dateEntree,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      WeeklyRevenueAr AS weeklyRevenueAr,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueSuiviOeuf
      WHERE HistoriqueSuiviOeufId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateHistoriqueSuiviOeufDTO): Promise<HistoriqueSuiviOeuf> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, data.suiviOeufId)
    .input('dateEntree', sql.Date, data.dateEntree)
    .input('eggsPerDay', sql.Decimal(10, 2), data.eggsPerDay ?? null)
    .input('eggsPerWeek', sql.Int, data.eggsPerWeek ?? null)
    .input('layingRatePct', sql.Decimal(5, 2), data.layingRatePct ?? null)
    .input('weeklyRevenueAr', sql.Decimal(18, 2), data.weeklyRevenueAr ?? null)
    .input('notes', sql.NVarChar(300), data.notes ?? null)
    .query(`INSERT INTO HistoriqueSuiviOeuf
      (SuiviOeufId, DateEntree, EggsPerDay, EggsPerWeek, LayingRatePct, WeeklyRevenueAr, Notes, CreatedAt)
      OUTPUT
        INSERTED.HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
        INSERTED.SuiviOeufId AS suiviOeufId,
        INSERTED.DateEntree AS dateEntree,
        INSERTED.EggsPerDay AS eggsPerDay,
        INSERTED.EggsPerWeek AS eggsPerWeek,
        INSERTED.LayingRatePct AS layingRatePct,
        INSERTED.WeeklyRevenueAr AS weeklyRevenueAr,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      VALUES (@suiviOeufId, @dateEntree, @eggsPerDay, @eggsPerWeek, @layingRatePct, @weeklyRevenueAr, @notes, SYSUTCDATETIME())`);
  
  return result.recordset[0];
}

export async function update(historiqueSuiviOeufId: number, data: UpdateHistoriqueSuiviOeufDTO): Promise<HistoriqueSuiviOeuf> {
  const pool = await getPool();
  
  // Build the SET clause dynamically
  const setClauses: string[] = [];
  const request = pool.request();
  request.input('id', sql.Int, historiqueSuiviOeufId);
  
  if (data.eggsPerDay !== undefined) {
    setClauses.push('EggsPerDay = @eggsPerDay');
    request.input('eggsPerDay', sql.Decimal(10, 2), data.eggsPerDay ?? null);
  }
  if (data.eggsPerWeek !== undefined) {
    setClauses.push('EggsPerWeek = @eggsPerWeek');
    request.input('eggsPerWeek', sql.Int, data.eggsPerWeek ?? null);
  }
  if (data.layingRatePct !== undefined) {
    setClauses.push('LayingRatePct = @layingRatePct');
    request.input('layingRatePct', sql.Decimal(5, 2), data.layingRatePct ?? null);
  }
  if (data.weeklyRevenueAr !== undefined) {
    setClauses.push('WeeklyRevenueAr = @weeklyRevenueAr');
    request.input('weeklyRevenueAr', sql.Decimal(18, 2), data.weeklyRevenueAr ?? null);
  }
  if (data.notes !== undefined) {
    setClauses.push('Notes = @notes');
    request.input('notes', sql.NVarChar(300), data.notes ?? null);
  }
  
  if (setClauses.length === 0) {
    const existing = await findById(historiqueSuiviOeufId);
    if (!existing) throw new Error('Historique suivi oeuf non trouvé');
    return existing;
  }
  
  const result = await request
    .query(`UPDATE HistoriqueSuiviOeuf
      SET ${setClauses.join(', ')}
      OUTPUT
        INSERTED.HistoriqueSuiviOeufId AS historiqueSuiviOeufId,
        INSERTED.SuiviOeufId AS suiviOeufId,
        INSERTED.DateEntree AS dateEntree,
        INSERTED.EggsPerDay AS eggsPerDay,
        INSERTED.EggsPerWeek AS eggsPerWeek,
        INSERTED.LayingRatePct AS layingRatePct,
        INSERTED.WeeklyRevenueAr AS weeklyRevenueAr,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      WHERE HistoriqueSuiviOeufId = @id`);
  
  return result.recordset[0];
}

export async function delete_(historiqueSuiviOeufId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, historiqueSuiviOeufId)
    .query(`DELETE FROM HistoriqueSuiviOeuf WHERE HistoriqueSuiviOeufId = @id`);
}
