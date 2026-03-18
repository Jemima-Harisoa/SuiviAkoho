import { getPool } from '../config/database.config';
import { SuiviOeuf, CreateSuiviOeufDTO, UpdateSuiviOeufDTO } from '../models/suivi-oeuf.model';
import sql from 'mssql';

export async function findAll(): Promise<SuiviOeuf[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      SuiviOeufId AS suiviOeufId,
      LotId AS lotId,
      Week AS week,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      Notes AS notes,
      RecordedAt AS recordedAt
      FROM SuiviOeuf
      ORDER BY RecordedAt DESC`);
  
  return result.recordset;
}

export async function findByLot(lotId: number): Promise<SuiviOeuf[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .query(`SELECT 
      SuiviOeufId AS suiviOeufId,
      LotId AS lotId,
      Week AS week,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      Notes AS notes,
      RecordedAt AS recordedAt
      FROM SuiviOeuf
      WHERE LotId = @lotId
      ORDER BY Week ASC`);
  
  return result.recordset;
}

export async function findByLotAndWeek(lotId: number, week: number): Promise<SuiviOeuf | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, lotId)
    .input('week', sql.Int, week)
    .query(`SELECT 
      SuiviOeufId AS suiviOeufId,
      LotId AS lotId,
      Week AS week,
      EggsPerDay AS eggsPerDay,
      EggsPerWeek AS eggsPerWeek,
      LayingRatePct AS layingRatePct,
      Notes AS notes,
      RecordedAt AS recordedAt
      FROM SuiviOeuf
      WHERE LotId = @lotId AND Week = @week`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateSuiviOeufDTO): Promise<SuiviOeuf> {
  const pool = await getPool();
  const result = await pool.request()
    .input('lotId', sql.Int, data.lotId)
    .input('week', sql.Int, data.week)
    .input('eggsPerDay', sql.Decimal(10, 2), data.eggsPerDay)
    .input('eggsPerWeek', sql.Decimal(10, 2), data.eggsPerWeek)
    .input('layingRatePct', sql.Decimal(5, 2), data.layingRatePct)
    .input('notes', sql.NVarChar(sql.MAX), data.notes ?? null)
    .query(`INSERT INTO SuiviOeuf
      (LotId, Week, EggsPerDay, EggsPerWeek, LayingRatePct, Notes, RecordedAt)
      OUTPUT
        INSERTED.SuiviOeufId AS suiviOeufId,
        INSERTED.LotId AS lotId,
        INSERTED.Week AS week,
        INSERTED.EggsPerDay AS eggsPerDay,
        INSERTED.EggsPerWeek AS eggsPerWeek,
        INSERTED.LayingRatePct AS layingRatePct,
        INSERTED.Notes AS notes,
        INSERTED.RecordedAt AS recordedAt
      VALUES (@lotId, @week, @eggsPerDay, @eggsPerWeek, @layingRatePct, @notes, GETDATE())`);
  
  return result.recordset[0];
}

export async function update(suiviOeufId: number, data: UpdateSuiviOeufDTO): Promise<SuiviOeuf> {
  const pool = await getPool();
  
  const updates: string[] = [];
  const request = pool.request().input('id', sql.Int, suiviOeufId);
  
  if (data.eggsPerDay !== undefined) {
    updates.push('EggsPerDay = @eggsPerDay');
    request.input('eggsPerDay', sql.Decimal(10, 2), data.eggsPerDay);
  }
  if (data.eggsPerWeek !== undefined) {
    updates.push('EggsPerWeek = @eggsPerWeek');
    request.input('eggsPerWeek', sql.Decimal(10, 2), data.eggsPerWeek);
  }
  if (data.layingRatePct !== undefined) {
    updates.push('LayingRatePct = @layingRatePct');
    request.input('layingRatePct', sql.Decimal(5, 2), data.layingRatePct);
  }
  if (data.notes !== undefined) {
    updates.push('Notes = @notes');
    request.input('notes', sql.NVarChar(sql.MAX), data.notes);
  }
  
  const result = await request.query(`UPDATE SuiviOeuf
    SET ${updates.join(', ')}
    OUTPUT
      INSERTED.SuiviOeufId AS suiviOeufId,
      INSERTED.LotId AS lotId,
      INSERTED.Week AS week,
      INSERTED.EggsPerDay AS eggsPerDay,
      INSERTED.EggsPerWeek AS eggsPerWeek,
      INSERTED.LayingRatePct AS layingRatePct,
      INSERTED.Notes AS notes,
      INSERTED.RecordedAt AS recordedAt
    WHERE SuiviOeufId = @id`);
  
  return result.recordset[0];
}

export async function delete$(suiviOeufId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, suiviOeufId)
    .query(`DELETE FROM SuiviOeuf WHERE SuiviOeufId = @id`);
}
