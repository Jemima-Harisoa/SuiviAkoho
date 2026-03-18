import { getPool } from '../config/database.config';
import { Incubation, CreateIncubationDTO, UpdateIncubationDTO } from '../models/incubation.model';
import sql from 'mssql';

export async function findAll(): Promise<Incubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      IncubationId AS incubationId,
      LotId AS lotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      HatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
      FROM elevage.Incubation
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findById(incubationId: number): Promise<Incubation | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, incubationId)
    .query(`SELECT 
      IncubationId AS incubationId,
      LotId AS lotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      HatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
      FROM elevage.Incubation
      WHERE IncubationId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function findByLot(lotId: number): Promise<Incubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT 
      IncubationId AS incubationId,
      LotId AS lotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      HatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
      FROM elevage.Incubation
      WHERE LotId = @lotId
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findByDateRange(startDate: Date, endDate: Date): Promise<Incubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('start', sql.Date, startDate)
    .input('end', sql.Date, endDate)
    .query(`SELECT 
      IncubationId AS incubationId,
      LotId AS lotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      HatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      Notes AS notes,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
      FROM elevage.Incubation
      WHERE StartDate BETWEEN @start AND @end
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function create(data: CreateIncubationDTO): Promise<Incubation> {
  const pool = await getPool();
  
  // Calculer la date d'éclosion attendue (21j après le démarrage)
  const expectedHatchDate = new Date(data.startDate);
  expectedHatchDate.setDate(expectedHatchDate.getDate() + 21);
  
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId ?? null)
    .input('incubatorType', sql.NVarChar(100), data.incubatorType)
    .input('startDate', sql.Date, data.startDate)
    .input('eggsSetCount', sql.Int, data.eggsSetCount)
    .input('expectedHatchDate', sql.Date, expectedHatchDate)
    .input('notes', sql.NVarChar(sql.MAX), data.notes ?? null)
    .query(`INSERT INTO elevage.Incubation
      (LotId, IncubatorType, StartDate, EggsSetCount, ExpectedHatchDate, Notes, CreatedAt, UpdatedAt)
      OUTPUT
        INSERTED.IncubationId AS incubationId,
        INSERTED.LotId AS lotId,
        INSERTED.IncubatorType AS incubatorType,
        INSERTED.StartDate AS startDate,
        INSERTED.EggsSetCount AS eggsSetCount,
        INSERTED.ExpectedHatchDate AS expectedHatchDate,
        INSERTED.HatchedCount AS hatchedCount,
        INSERTED.HatchRatePct AS hatchRatePct,
        INSERTED.Notes AS notes,
        INSERTED.CreatedAt AS createdAt,
        INSERTED.UpdatedAt AS updatedAt
      VALUES (@lotId, @incubatorType, @startDate, @eggsSetCount, @expectedHatchDate, @notes, GETDATE(), GETDATE())`);
  
  return result.recordset[0];
}

export async function update(incubationId: number, data: UpdateIncubationDTO): Promise<Incubation> {
  const pool = await getPool();
  
  const updates: string[] = [];
  const request = pool.request().input('id', sql.Int, incubationId);
  
  if (data.hatchedCount !== undefined) {
    updates.push('HatchedCount = @hatchedCount');
    request.input('hatchedCount', sql.Int, data.hatchedCount);
  }
  if (data.notes !== undefined) {
    updates.push('Notes = @notes');
    request.input('notes', sql.NVarChar(sql.MAX), data.notes);
  }
  
  updates.push('UpdatedAt = GETDATE()');
  
  const result = await request.query(`UPDATE elevage.Incubation
    SET ${updates.join(', ')}
    OUTPUT
      INSERTED.IncubationId AS incubationId,
      INSERTED.LotId AS lotId,
      INSERTED.IncubatorType AS incubatorType,
      INSERTED.StartDate AS startDate,
      INSERTED.EggsSetCount AS eggsSetCount,
      INSERTED.ExpectedHatchDate AS expectedHatchDate,
      INSERTED.HatchedCount AS hatchedCount,
      INSERTED.HatchRatePct AS hatchRatePct,
      INSERTED.Notes AS notes,
      INSERTED.CreatedAt AS createdAt,
      INSERTED.UpdatedAt AS updatedAt
    WHERE IncubationId = @id`);
  
  return result.recordset[0];
}

export async function delete$(incubationId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, incubationId)
    .query(`DELETE FROM elevage.Incubation WHERE IncubationId = @id`);
}
