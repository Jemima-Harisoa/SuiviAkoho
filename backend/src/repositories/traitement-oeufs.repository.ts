import { getPool } from '../config/database.config';
import { TraitementOeufs, CreateTraitementOeufsDTO } from '../models/traitement-oeufs.model';
import sql from 'mssql';

export async function findAll(): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      TraitementId AS traitementId,
      SuiviOeufId AS suiviOeufId,
      TreatmentType AS treatmentType,
      Count AS count,
      UnitPrice AS unitPrice,
      TotalAmountAr AS totalAmountAr,
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
      TraitementId AS traitementId,
      SuiviOeufId AS suiviOeufId,
      TreatmentType AS treatmentType,
      Count AS count,
      UnitPrice AS unitPrice,
      TotalAmountAr AS totalAmountAr,
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
      TraitementId AS traitementId,
      SuiviOeufId AS suiviOeufId,
      TreatmentType AS treatmentType,
      Count AS count,
      UnitPrice AS unitPrice,
      TotalAmountAr AS totalAmountAr,
      CreatedAt AS createdAt
      FROM TraitementOeufs
      WHERE TreatmentType = @type
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function create(data: CreateTraitementOeufsDTO): Promise<TraitementOeufs> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, data.suiviOeufId)
    .input('type', sql.NVarChar(20), data.treatmentType)
    .input('count', sql.Int, data.count)
    .input('unitPrice', sql.Decimal(15, 2), data.unitPrice ?? null)
    .input('totalAmountAr', sql.Decimal(15, 2), data.totalAmountAr ?? null)
    .query(`INSERT INTO TraitementOeufs
      (SuiviOeufId, TreatmentType, Count, UnitPrice, TotalAmountAr, CreatedAt)
      OUTPUT
        INSERTED.TraitementId AS traitementId,
        INSERTED.SuiviOeufId AS suiviOeufId,
        INSERTED.TreatmentType AS treatmentType,
        INSERTED.Count AS count,
        INSERTED.UnitPrice AS unitPrice,
        INSERTED.TotalAmountAr AS totalAmountAr,
        INSERTED.CreatedAt AS createdAt
      VALUES (@suiviOeufId, @type, @count, @unitPrice, @totalAmountAr, GETDATE())`);
  
  return result.recordset[0];
}

export async function delete$(traitementId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, traitementId)
    .query(`DELETE FROM TraitementOeufs WHERE TraitementId = @id`);
}
