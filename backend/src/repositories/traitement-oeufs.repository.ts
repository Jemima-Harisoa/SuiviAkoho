import { getPool } from '../config/database.config';
import { TraitementOeufs, CreateTraitementOeufsDTO } from '../models/traitement-oeufs.model';
import sql from 'mssql';

export async function findAll(): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      TraitementOeufsId AS traitementId,
      SuiviOeufId AS suiviOeufId,
      ProcessType AS treatmentType,
      EggCount AS count,
      UnitPriceAr AS unitPrice,
      TotalAmountAr AS totalAmountAr,
      IncubationId AS incubationId,
      CreatedAt AS createdAt
      FROM TraitementOeufs
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findBySuiviOeuf(suiviOeufId: number): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, suiviOeufId)
    .query(`SELECT 
      TraitementOeufsId AS traitementId,
      SuiviOeufId AS suiviOeufId,
      ProcessType AS treatmentType,
      EggCount AS count,
      UnitPriceAr AS unitPrice,
      TotalAmountAr AS totalAmountAr,
      IncubationId AS incubationId,
      CreatedAt AS createdAt
      FROM TraitementOeufs
      WHERE SuiviOeufId = @suiviOeufId
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findByType(treatmentType: string): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('type', sql.NVarChar(20), treatmentType)
    .query(`SELECT 
      TraitementOeufsId AS traitementId,
      SuiviOeufId AS suiviOeufId,
      ProcessType AS treatmentType,
      EggCount AS count,
      UnitPriceAr AS unitPrice,
      TotalAmountAr AS totalAmountAr,
      IncubationId AS incubationId,
      CreatedAt AS createdAt
      FROM TraitementOeufs
      WHERE ProcessType = @type
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function create(data: CreateTraitementOeufsDTO): Promise<TraitementOeufs> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, data.suiviOeufId)
    .input('type', sql.NVarChar(20), data.treatmentType)
    .input('count', sql.Int, data.count)
    .input('unitPrice', sql.Decimal(18, 2), data.unitPrice ?? null)
    .input('incubationId', sql.Int, data.incubationId ?? null)
    .query(`INSERT INTO TraitementOeufs
      (SuiviOeufId, ProcessType, EggCount, UnitPriceAr, IncubationId, CreatedAt)
      OUTPUT
        INSERTED.TraitementOeufsId AS traitementId,
        INSERTED.SuiviOeufId AS suiviOeufId,
        INSERTED.ProcessType AS treatmentType,
        INSERTED.EggCount AS count,
        INSERTED.UnitPriceAr AS unitPrice,
        INSERTED.TotalAmountAr AS totalAmountAr,
        INSERTED.IncubationId AS incubationId,
        INSERTED.CreatedAt AS createdAt
      VALUES (@suiviOeufId, @type, @count, @unitPrice, @incubationId, GETDATE())`);
  
  return result.recordset[0];
}

export async function delete$(traitementId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, traitementId)
    .query(`DELETE FROM TraitementOeufs WHERE TraitementOeufsId = @id`);
}
