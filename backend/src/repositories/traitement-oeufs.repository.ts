import { getPool } from '../config/database.config';
import { TraitementOeufs, CreateTraitementOeufsDTO } from '../models/traitement-oeufs.model';
import sql from 'mssql';

export async function findAll(): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      TraitementOeufsId AS traitementOeufsId,
      SuiviOeufId AS suiviOeufId,
      SourceLotId AS sourceLotId,
      ProcessType AS processType,
      EggCount AS eggCount,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      IncubationId AS incubationId,
      CreatedAt AS createdAt
      FROM TraitementOeufs
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findByLot(sourceLotId: number): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('sourceLotId', sql.Int, sourceLotId)
    .query(`SELECT 
      TraitementOeufsId AS traitementOeufsId,
      SuiviOeufId AS suiviOeufId,
      SourceLotId AS sourceLotId,
      ProcessType AS processType,
      EggCount AS eggCount,
      UnitPriceAr AS unitPriceAr,
      TotalAmountAr AS totalAmountAr,
      IncubationId AS incubationId,
      CreatedAt AS createdAt
      FROM TraitementOeufs
      WHERE SourceLotId = @sourceLotId
      ORDER BY CreatedAt DESC`);
  
  return result.recordset;
}

export async function findBySuiviOeuf(suiviOeufId: number): Promise<TraitementOeufs[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('suiviOeufId', sql.Int, suiviOeufId)
    .query(`SELECT 
      TraitementOeufsId AS traitementOeufsId,
      SuiviOeufId AS suiviOeufId,
      SourceLotId AS sourceLotId,
      ProcessType AS processType,
      EggCount AS eggCount,
      UnitPriceAr AS unitPriceAr,
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
      TraitementOeufsId AS traitementOeufsId,
      SuiviOeufId AS suiviOeufId,
      SourceLotId AS sourceLotId,
      ProcessType AS processType,
      EggCount AS eggCount,
      UnitPriceAr AS unitPriceAr,
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
    .input('sourceLotId', sql.Int, data.sourceLotId)
    .input('type', sql.NVarChar(20), data.processType)
    .input('count', sql.Int, data.eggCount)
    .input('unitPrice', sql.Decimal(18, 2), data.unitPriceAr ?? null)
    .input('incubationId', sql.Int, data.incubationId ?? null)
    .query(`INSERT INTO TraitementOeufs
      (SuiviOeufId, SourceLotId, ProcessType, EggCount, UnitPriceAr, IncubationId, CreatedAt)
      OUTPUT
        INSERTED.TraitementOeufsId AS traitementOeufsId,
        INSERTED.SuiviOeufId AS suiviOeufId,
        INSERTED.SourceLotId AS sourceLotId,
        INSERTED.ProcessType AS processType,
        INSERTED.EggCount AS eggCount,
        INSERTED.UnitPriceAr AS unitPriceAr,
        INSERTED.TotalAmountAr AS totalAmountAr,
        INSERTED.IncubationId AS incubationId,
        INSERTED.CreatedAt AS createdAt
      VALUES (@suiviOeufId, @sourceLotId, @type, @count, @unitPrice, @incubationId, GETDATE())`);
  
  return result.recordset[0];
}

export async function delete$(traitementId: number): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, traitementId)
    .query(`DELETE FROM TraitementOeufs WHERE TraitementOeufsId = @id`);
}
