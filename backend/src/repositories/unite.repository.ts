import { getPool } from '../config/database.config';
import { Unite, CreateUniteDTO } from '../models/unite.model';
import sql from 'mssql';

export async function findAll(): Promise<Unite[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      UniteId AS uniteId,
      Code AS code,
      Label AS label
      FROM Unite 
      ORDER BY Code`);
  
  return result.recordset;
}

export async function findById(uniteId: number): Promise<Unite | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, uniteId)
    .query(`SELECT 
      UniteId AS uniteId,
      Code AS code,
      Label AS label
      FROM Unite 
      WHERE UniteId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function findByCode(code: string): Promise<Unite | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), code)
    .query(`SELECT 
      UniteId AS uniteId,
      Code AS code,
      Label AS label
      FROM Unite 
      WHERE Code = @code`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateUniteDTO): Promise<Unite> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), data.code)
    .input('label', sql.NVarChar(100), data.label)
    .query(
      `INSERT INTO Unite (Code, Label) 
       OUTPUT 
        INSERTED.UniteId AS uniteId,
        INSERTED.Code AS code,
        INSERTED.Label AS label
       VALUES (@code, @label)`
    );
  
  return result.recordset[0];
}
