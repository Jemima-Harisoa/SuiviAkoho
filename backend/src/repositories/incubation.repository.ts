import { getPool } from '../config/database.config';
import { Incubation, CreateIncubationDTO, UpdateIncubationDTO } from '../models/incubation.model';
import sql from 'mssql';

export async function findAll(): Promise<Incubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      IncubationId AS incubationId,
      SourceLotId AS sourceLotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      EggsHatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      CreatedLotId AS createdLotId,
      CreatedAt AS createdAt
      FROM Incubation
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findById(incubationId: number): Promise<Incubation | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, incubationId)
    .query(`SELECT 
      IncubationId AS incubationId,
      SourceLotId AS sourceLotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      EggsHatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      CreatedLotId AS createdLotId,
      CreatedAt AS createdAt
      FROM Incubation
      WHERE IncubationId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function findByLot(lotId: number): Promise<Incubation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT 
      IncubationId AS incubationId,
      SourceLotId AS sourceLotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      EggsHatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      CreatedLotId AS createdLotId,
      CreatedAt AS createdAt
      FROM Incubation
      WHERE SourceLotId = @lotId
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
      SourceLotId AS sourceLotId,
      IncubatorType AS incubatorType,
      StartDate AS startDate,
      EggsSetCount AS eggsSetCount,
      ExpectedHatchDate AS expectedHatchDate,
      EggsHatchedCount AS hatchedCount,
      HatchRatePct AS hatchRatePct,
      CreatedLotId AS createdLotId,
      CreatedAt AS createdAt
      FROM Incubation
      WHERE StartDate BETWEEN @start AND @end
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function create(data: CreateIncubationDTO): Promise<Incubation> {
  const pool = await getPool();
  
  const result = await pool.request()
    .input('sourceLotId', sql.Int, data.sourceLotId ?? null)
    .input('incubatorType', sql.NVarChar(20), data.incubatorType)
    .input('startDate', sql.Date, data.startDate)
    .input('eggsSetCount', sql.Int, data.eggsSetCount)
    .input('createdLotId', sql.Int, data.createdLotId ?? null)
    .query(`INSERT INTO Incubation
      (SourceLotId, IncubatorType, StartDate, EggsSetCount, CreatedLotId, CreatedAt)
      OUTPUT
        INSERTED.IncubationId AS incubationId,
        INSERTED.SourceLotId AS sourceLotId,
        INSERTED.IncubatorType AS incubatorType,
        INSERTED.StartDate AS startDate,
        INSERTED.EggsSetCount AS eggsSetCount,
        INSERTED.ExpectedHatchDate AS expectedHatchDate,
        INSERTED.EggsHatchedCount AS hatchedCount,
        INSERTED.HatchRatePct AS hatchRatePct,
        INSERTED.CreatedLotId AS createdLotId,
        INSERTED.CreatedAt AS createdAt
      VALUES (@sourceLotId, @incubatorType, @startDate, @eggsSetCount, @createdLotId, GETDATE())`)
  
  return result.recordset[0];
}

export async function update(incubationId: number, data: UpdateIncubationDTO): Promise<Incubation> {
  const pool = await getPool();
  
  const updates: string[] = [];
  const request = pool.request().input('id', sql.Int, incubationId);
  
  if (data.hatchedCount !== undefined) {
    updates.push('EggsHatchedCount = @hatchedCount');
    request.input('hatchedCount', sql.Int, data.hatchedCount);
  }
  if (data.createdLotId !== undefined) {
    updates.push('CreatedLotId = @createdLotId');
    request.input('createdLotId', sql.Int, data.createdLotId);
  }
  
  const result = await request.query(`UPDATE Incubation
    SET ${updates.join(', ')}
    OUTPUT
      INSERTED.IncubationId AS incubationId,
      INSERTED.SourceLotId AS sourceLotId,
      INSERTED.IncubatorType AS incubatorType,
      INSERTED.StartDate AS startDate,
      INSERTED.EggsSetCount AS eggsSetCount,
      INSERTED.ExpectedHatchDate AS expectedHatchDate,
      INSERTED.EggsHatchedCount AS hatchedCount,
      INSERTED.HatchRatePct AS hatchRatePct,
      INSERTED.CreatedLotId AS createdLotId,
      INSERTED.CreatedAt AS createdAt
    WHERE IncubationId = @id`);
  
  return result.recordset[0];
}

export async function delete$(incubationId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, incubationId)
    .query(`DELETE FROM Incubation WHERE IncubationId = @id`);
}
