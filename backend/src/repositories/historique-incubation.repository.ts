import { getPool } from '../config/database.config';
import { HistoriqueIncubation, CreateHistoriqueIncubationDTO, UpdateHistoriqueIncubationDTO } from '../models/historique-incubation.model';
import sql from 'mssql';

export async function findAll(): Promise<HistoriqueIncubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      HistoriqueIncubationId AS historiqueIncubationId,
      IncubationId AS incubationId,
      DateEntree AS dateEntree,
      IncubatorType AS incubatorType,
      EggsSetCount AS eggsSetCount,
      EggsHatchedCount AS eggsHatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueIncubation
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findByIncubation(incubationId: number): Promise<HistoriqueIncubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('incubationId', sql.Int, incubationId)
    .query(`SELECT 
      HistoriqueIncubationId AS historiqueIncubationId,
      IncubationId AS incubationId,
      DateEntree AS dateEntree,
      IncubatorType AS incubatorType,
      EggsSetCount AS eggsSetCount,
      EggsHatchedCount AS eggsHatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueIncubation
      WHERE IncubationId = @incubationId
      ORDER BY DateEntree DESC`);
  
  return result.recordset;
}

export async function findByIncubationAndDate(
  incubationId: number,
  dateEntree: Date
): Promise<HistoriqueIncubation | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('incubationId', sql.Int, incubationId)
    .input('dateEntree', sql.Date, dateEntree)
    .query(`SELECT
      HistoriqueIncubationId AS historiqueIncubationId,
      IncubationId AS incubationId,
      DateEntree AS dateEntree,
      IncubatorType AS incubatorType,
      EggsSetCount AS eggsSetCount,
      EggsHatchedCount AS eggsHatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueIncubation
      WHERE IncubationId = @incubationId
        AND DateEntree = @dateEntree`);

  return result.recordset[0] ?? null;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueIncubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`SELECT 
      HistoriqueIncubationId AS historiqueIncubationId,
      IncubationId AS incubationId,
      DateEntree AS dateEntree,
      IncubatorType AS incubatorType,
      EggsSetCount AS eggsSetCount,
      EggsHatchedCount AS eggsHatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueIncubation
      WHERE DateEntree BETWEEN @startDate AND @endDate
      ORDER BY DateEntree DESC`);
  
  return result.recordset;
}

export async function findById(historiqueIncubationId: number): Promise<HistoriqueIncubation | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, historiqueIncubationId)
    .query(`SELECT 
      HistoriqueIncubationId AS historiqueIncubationId,
      IncubationId AS incubationId,
      DateEntree AS dateEntree,
      IncubatorType AS incubatorType,
      EggsSetCount AS eggsSetCount,
      EggsHatchedCount AS eggsHatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt
      FROM HistoriqueIncubation
      WHERE HistoriqueIncubationId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateHistoriqueIncubationDTO): Promise<HistoriqueIncubation> {
  const pool = await getPool();
  const result = await pool.request()
    .input('incubationId', sql.Int, data.incubationId)
    .input('dateEntree', sql.Date, data.dateEntree)
    .input('incubatorType', sql.NVarChar(20), data.incubatorType ?? null)
    .input('eggsSetCount', sql.Int, data.eggsSetCount ?? null)
    .input('eggsHatchedCount', sql.Int, data.eggsHatchedCount ?? null)
    .input('hatchRatePct', sql.Decimal(5, 2), data.hatchRatePct ?? null)
    .input('notes', sql.NVarChar(300), data.notes ?? null)
    .query(`INSERT INTO HistoriqueIncubation
      (IncubationId, DateEntree, IncubatorType, EggsSetCount, EggsHatchedCount, HatchRatePct, Notes, CreatedAt)
      OUTPUT
        INSERTED.HistoriqueIncubationId AS historiqueIncubationId,
        INSERTED.IncubationId AS incubationId,
        INSERTED.DateEntree AS dateEntree,
        INSERTED.IncubatorType AS incubatorType,
        INSERTED.EggsSetCount AS eggsSetCount,
        INSERTED.EggsHatchedCount AS eggsHatchedCount,
        INSERTED.HatchRatePct AS hatchRatePct,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      VALUES (@incubationId, @dateEntree, @incubatorType, @eggsSetCount, @eggsHatchedCount, @hatchRatePct, @notes, SYSUTCDATETIME())`);
  
  return result.recordset[0];
}

export async function update(historiqueIncubationId: number, data: UpdateHistoriqueIncubationDTO): Promise<HistoriqueIncubation> {
  const pool = await getPool();
  
  // Build the SET clause dynamically
  const setClauses: string[] = [];
  const request = pool.request();
  request.input('id', sql.Int, historiqueIncubationId);
  
  if (data.incubatorType !== undefined) {
    setClauses.push('IncubatorType = @incubatorType');
    request.input('incubatorType', sql.NVarChar(20), data.incubatorType ?? null);
  }
  if (data.eggsSetCount !== undefined) {
    setClauses.push('EggsSetCount = @eggsSetCount');
    request.input('eggsSetCount', sql.Int, data.eggsSetCount ?? null);
  }
  if (data.eggsHatchedCount !== undefined) {
    setClauses.push('EggsHatchedCount = @eggsHatchedCount');
    request.input('eggsHatchedCount', sql.Int, data.eggsHatchedCount ?? null);
  }
  if (data.hatchRatePct !== undefined) {
    setClauses.push('HatchRatePct = @hatchRatePct');
    request.input('hatchRatePct', sql.Decimal(5, 2), data.hatchRatePct ?? null);
  }
  if (data.notes !== undefined) {
    setClauses.push('Notes = @notes');
    request.input('notes', sql.NVarChar(300), data.notes ?? null);
  }
  
  if (setClauses.length === 0) {
    const existing = await findById(historiqueIncubationId);
    if (!existing) throw new Error('Historique incubation non trouvé');
    return existing;
  }
  
  const result = await request
    .query(`UPDATE HistoriqueIncubation
      SET ${setClauses.join(', ')}
      OUTPUT
        INSERTED.HistoriqueIncubationId AS historiqueIncubationId,
        INSERTED.IncubationId AS incubationId,
        INSERTED.DateEntree AS dateEntree,
        INSERTED.IncubatorType AS incubatorType,
        INSERTED.EggsSetCount AS eggsSetCount,
        INSERTED.EggsHatchedCount AS eggsHatchedCount,
        INSERTED.HatchRatePct AS hatchRatePct,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt
      WHERE HistoriqueIncubationId = @id`);
  
  return result.recordset[0];
}

export async function delete_(historiqueIncubationId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, historiqueIncubationId)
    .query(`DELETE FROM HistoriqueIncubation WHERE HistoriqueIncubationId = @id`);
}
