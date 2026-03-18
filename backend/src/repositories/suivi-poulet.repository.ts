import { getPool } from '../config/database.config';
import { SuiviPoulet, CreateSuiviPouletDTO, UpdateSuiviPouletDTO } from '../models/suivi-poulet.model';
import sql from 'mssql';

export async function findAll(): Promise<SuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      SuiviPouletId AS suiviPouletId,
      LotId AS lotId,
      Week AS week,
      AverageWeightG AS averageWeightG,
      RationGPerDay AS rationGPerDay,
      SuppliedRationG AS suppliedRationG,
      CostPerAr AS costPerAr,
      Mortality AS mortality,
      SoldCount AS soldCount,
      Notes AS notes,
      RecordedAt AS recordedAt
      FROM elevage.SuiviPoulet
      ORDER BY RecordedAt DESC`);
  
  return result.recordset;
}

export async function findByLot(lotId: number): Promise<SuiviPoulet[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT 
      SuiviPouletId AS suiviPouletId,
      LotId AS lotId,
      Week AS week,
      AverageWeightG AS averageWeightG,
      RationGPerDay AS rationGPerDay,
      SuppliedRationG AS suppliedRationG,
      CostPerAr AS costPerAr,
      Mortality AS mortality,
      SoldCount AS soldCount,
      Notes AS notes,
      RecordedAt AS recordedAt
      FROM elevage.SuiviPoulet
      WHERE LotId = @lotId
      ORDER BY Week ASC`);
  
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
      Week AS week,
      AverageWeightG AS averageWeightG,
      RationGPerDay AS rationGPerDay,
      SuppliedRationG AS suppliedRationG,
      CostPerAr AS costPerAr,
      Mortality AS mortality,
      SoldCount AS soldCount,
      Notes AS notes,
      RecordedAt AS recordedAt
      FROM elevage.SuiviPoulet
      WHERE LotId = @lotId AND Week = @week`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateSuiviPouletDTO): Promise<SuiviPoulet> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId)
    .input('week', sql.Int, data.week)
    .input('averageWeightG', sql.Decimal(10, 2), data.averageWeightG)
    .input('rationGPerDay', sql.Decimal(10, 2), data.rationGPerDay)
    .input('suppliedRationG', sql.Decimal(10, 2), data.suppliedRationG)
    .input('costPerAr', sql.Decimal(15, 2), data.costPerAr)
    .input('mortality', sql.Int, data.mortality)
    .input('soldCount', sql.Int, data.soldCount)
    .input('notes', sql.NVarChar(sql.MAX), data.notes ?? null)
    .query(`INSERT INTO elevage.SuiviPoulet
      (LotId, Week, AverageWeightG, RationGPerDay, SuppliedRationG, CostPerAr, Mortality, SoldCount, Notes, RecordedAt)
      OUTPUT
        INSERTED.SuiviPouletId AS suiviPouletId,
        INSERTED.LotId AS lotId,
        INSERTED.Week AS week,
        INSERTED.AverageWeightG AS averageWeightG,
        INSERTED.RationGPerDay AS rationGPerDay,
        INSERTED.SuppliedRationG AS suppliedRationG,
        INSERTED.CostPerAr AS costPerAr,
        INSERTED.Mortality AS mortality,
        INSERTED.SoldCount AS soldCount,
        INSERTED.Notes AS notes,
        INSERTED.RecordedAt AS recordedAt
      VALUES (@lotId, @week, @averageWeightG, @rationGPerDay, @suppliedRationG, @costPerAr, @mortality, @soldCount, @notes, GETDATE())`);
  
  return result.recordset[0];
}

export async function update(suiviPouletId: number, data: UpdateSuiviPouletDTO): Promise<SuiviPoulet> {
  const pool = await getPool();
  
  const updates: string[] = [];
  const request = pool.request().input('id', sql.Int, suiviPouletId);
  
  if (data.averageWeightG !== undefined) {
    updates.push('AverageWeightG = @averageWeightG');
    request.input('averageWeightG', sql.Decimal(10, 2), data.averageWeightG);
  }
  if (data.rationGPerDay !== undefined) {
    updates.push('RationGPerDay = @rationGPerDay');
    request.input('rationGPerDay', sql.Decimal(10, 2), data.rationGPerDay);
  }
  if (data.suppliedRationG !== undefined) {
    updates.push('SuppliedRationG = @suppliedRationG');
    request.input('suppliedRationG', sql.Decimal(10, 2), data.suppliedRationG);
  }
  if (data.costPerAr !== undefined) {
    updates.push('CostPerAr = @costPerAr');
    request.input('costPerAr', sql.Decimal(15, 2), data.costPerAr);
  }
  if (data.mortality !== undefined) {
    updates.push('Mortality = @mortality');
    request.input('mortality', sql.Int, data.mortality);
  }
  if (data.soldCount !== undefined) {
    updates.push('SoldCount = @soldCount');
    request.input('soldCount', sql.Int, data.soldCount);
  }
  if (data.notes !== undefined) {
    updates.push('Notes = @notes');
    request.input('notes', sql.NVarChar(sql.MAX), data.notes);
  }
  
  const result = await request.query(`UPDATE elevage.SuiviPoulet
    SET ${updates.join(', ')}
    OUTPUT
      INSERTED.SuiviPouletId AS suiviPouletId,
      INSERTED.LotId AS lotId,
      INSERTED.Week AS week,
      INSERTED.AverageWeightG AS averageWeightG,
      INSERTED.RationGPerDay AS rationGPerDay,
      INSERTED.SuppliedRationG AS suppliedRationG,
      INSERTED.CostPerAr AS costPerAr,
      INSERTED.Mortality AS mortality,
      INSERTED.SoldCount AS soldCount,
      INSERTED.Notes AS notes,
      INSERTED.RecordedAt AS recordedAt
    WHERE SuiviPouletId = @id`);
  
  return result.recordset[0];
}

export async function delete$(suiviPouletId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, suiviPouletId)
    .query(`DELETE FROM elevage.SuiviPoulet WHERE SuiviPouletId = @id`);
}
