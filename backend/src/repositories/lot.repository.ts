import { getPool } from '../config/database.config';
import { Lot, CreateLotDTO, UpdateLotDTO } from '../models/lot.model';
import sql from 'mssql';

export async function findAll(): Promise<Lot[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      LotId AS lotId,
      LotCode AS lotCode,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId,
      HatchDate AS hatchDate,
      InitialCount AS initialCount,
      MaleCount AS maleCount,
      FemaleCount AS femaleCount,
      Status AS status,
      PurchaseValue AS purchaseValue,
      CreatedAt AS createdAt
      FROM Lot
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findById(lotId: number): Promise<Lot | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, lotId)
    .query(`SELECT 
      LotId AS lotId,
      LotCode AS lotCode,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId,
      HatchDate AS hatchDate,
      InitialCount AS initialCount,
      MaleCount AS maleCount,
      FemaleCount AS femaleCount,
      Status AS status,
      PurchaseValue AS purchaseValue,
      CreatedAt AS createdAt
      FROM Lot
      WHERE LotId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function findByCode(lotCode: string): Promise<Lot | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(50), lotCode)
    .query(`SELECT 
      LotId AS lotId,
      LotCode AS lotCode,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId,
      HatchDate AS hatchDate,
      InitialCount AS initialCount,
      MaleCount AS maleCount,
      FemaleCount AS femaleCount,
      Status AS status,
      PurchaseValue AS purchaseValue,
      CreatedAt AS createdAt
      FROM Lot
      WHERE LotCode = @code`);
  
  return result.recordset[0] ?? null;
}

export async function findByStatus(status: string): Promise<Lot[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('status', sql.NVarChar(20), status)
    .query(`SELECT 
      LotId AS lotId,
      LotCode AS lotCode,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId,
      HatchDate AS hatchDate,
      InitialCount AS initialCount,
      MaleCount AS maleCount,
      FemaleCount AS femaleCount,
      Status AS status,
      PurchaseValue AS purchaseValue,
      CreatedAt AS createdAt
      FROM Lot
      WHERE Status = @status
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findByRace(raceId: number): Promise<Lot[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('raceId', sql.Int, raceId)
    .query(`SELECT 
      LotId AS lotId,
      LotCode AS lotCode,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId,
      HatchDate AS hatchDate,
      InitialCount AS initialCount,
      MaleCount AS maleCount,
      FemaleCount AS femaleCount,
      Status AS status,
      PurchaseValue AS purchaseValue,
      CreatedAt AS createdAt
      FROM Lot
      WHERE RaceId = @raceId
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function create(data: CreateLotDTO): Promise<Lot> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(50), data.lotCode)
    .input('raceId', sql.Int, data.raceId)
    .input('typeProductionId', sql.Int, data.typeProductionId)
    .input('hatchDate', sql.Date, data.hatchDate)
    .input('initialCount', sql.Int, data.initialCount)
    .input('maleCount', sql.Int, data.maleCount)
    .input('femaleCount', sql.Int, data.femaleCount)
    .input('purchaseValue', sql.Decimal(18, 2), data.purchaseValue ?? null)
    .query(`INSERT INTO Lot 
      (LotCode, RaceId, TypeProductionId, HatchDate, InitialCount, MaleCount, FemaleCount, Status, PurchaseValue, CreatedAt)
      OUTPUT
        INSERTED.LotId AS lotId,
        INSERTED.LotCode AS lotCode,
        INSERTED.RaceId AS raceId,
        INSERTED.TypeProductionId AS typeProductionId,
        INSERTED.HatchDate AS hatchDate,
        INSERTED.InitialCount AS initialCount,
        INSERTED.MaleCount AS maleCount,
        INSERTED.FemaleCount AS femaleCount,
        INSERTED.Status AS status,
        INSERTED.PurchaseValue AS purchaseValue,
        INSERTED.CreatedAt AS createdAt
      VALUES (@code, @raceId, @typeProductionId, @hatchDate, @initialCount, @maleCount, @femaleCount, 'ACTIF', @purchaseValue, GETDATE())`)
  
  return result.recordset[0];
}

export async function update(lotId: number, data: UpdateLotDTO): Promise<Lot> {
  const pool = await getPool();
  
  const updates: string[] = [];
  const request = pool.request().input('id', sql.Int, lotId);
  
  if (data.raceId !== undefined) {
    updates.push('RaceId = @raceId');
    request.input('raceId', sql.Int, data.raceId);
  }
  if (data.typeProductionId !== undefined) {
    updates.push('TypeProductionId = @typeProductionId');
    request.input('typeProductionId', sql.Int, data.typeProductionId);
  }
  if (data.initialCount !== undefined) {
    updates.push('InitialCount = @initialCount');
    request.input('initialCount', sql.Int, data.initialCount);
  }
  if (data.maleCount !== undefined) {
    updates.push('MaleCount = @maleCount');
    request.input('maleCount', sql.Int, data.maleCount);
  }
  if (data.femaleCount !== undefined) {
    updates.push('FemaleCount = @femaleCount');
    request.input('femaleCount', sql.Int, data.femaleCount);
  }
  if (data.status !== undefined) {
    updates.push('Status = @status');
    request.input('status', sql.NVarChar(20), data.status);
  }
  if (data.purchaseValue !== undefined) {
    updates.push('PurchaseValue = @purchaseValue');
    request.input('purchaseValue', sql.Decimal(18, 2), data.purchaseValue);
  }
  
  const result = await request.query(`UPDATE Lot
    SET ${updates.join(', ')}
    OUTPUT
      INSERTED.LotId AS lotId,
      INSERTED.LotCode AS lotCode,
      INSERTED.RaceId AS raceId,
      INSERTED.TypeProductionId AS typeProductionId,
      INSERTED.HatchDate AS hatchDate,
      INSERTED.InitialCount AS initialCount,
      INSERTED.MaleCount AS maleCount,
      INSERTED.FemaleCount AS femaleCount,
      INSERTED.Status AS status,
      INSERTED.PurchaseValue AS purchaseValue,
      INSERTED.CreatedAt AS createdAt
    WHERE LotId = @id`);
  
  return result.recordset[0];
}

export async function delete$(lotId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, lotId)
    .query(`DELETE FROM Lot WHERE LotId = @id`);
}
