import { getPool } from '../config/database.config';
import { Parametre, CreateParametreDTO } from '../models/parametre.model';
import sql from 'mssql';

export async function findAll(): Promise<Parametre[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      ParametreId AS parametreId,
      Code AS code,
      Label AS label,
      Value AS value,
      EffectiveDate AS effectiveDate,
      EndDate AS endDate
      FROM Parametre 
      ORDER BY Code`);
  
  return result.recordset;
}

export async function findById(parametreId: number): Promise<Parametre | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, parametreId)
    .query(`SELECT 
      ParametreId AS parametreId,
      Code AS code,
      Label AS label,
      Value AS value,
      EffectiveDate AS effectiveDate,
      EndDate AS endDate
      FROM Parametre 
      WHERE ParametreId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateParametreDTO): Promise<Parametre> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), data.code)
    .input('label', sql.NVarChar(100), data.label)
    .input('value', sql.NVarChar(sql.MAX), data.value)
    .input('effectiveDate', sql.Date, data.effectiveDate)
    .input('endDate', sql.Date, data.endDate ?? null)
    .query(
      `INSERT INTO Parametre (Code, Label, Value, EffectiveDate, EndDate) 
       OUTPUT 
        INSERTED.ParametreId AS parametreId,
        INSERTED.Code AS code,
        INSERTED.Label AS label,
        INSERTED.Value AS value,
        INSERTED.EffectiveDate AS effectiveDate,
        INSERTED.EndDate AS endDate
       VALUES (@code, @label, @value, @effectiveDate, @endDate)`
    );
  
  return result.recordset[0];
}
