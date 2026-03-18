import { getPool } from '../config/database.config';
import { Sexe, CreateSexeDTO } from '../models/sexe.model';
import sql from 'mssql';

export async function findAll(): Promise<Sexe[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT SexeId AS sexeId, Code AS code, Label AS label FROM Sexe ORDER BY Code');
  
  return result.recordset;
}

export async function findById(sexeId: number): Promise<Sexe | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.TinyInt, sexeId)
    .query('SELECT SexeId AS sexeId, Code AS code, Label AS label FROM Sexe WHERE SexeId = @id');
  
  return result.recordset[0] ?? null;
}

export async function findByCode(code: string): Promise<Sexe | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), code)
    .query('SELECT SexeId AS sexeId, Code AS code, Label AS label FROM Sexe WHERE Code = @code');
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateSexeDTO): Promise<Sexe> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), data.code)
    .input('label', sql.NVarChar(100), data.label)
    .query(
      `INSERT INTO Sexe (Code, Label) 
       OUTPUT INSERTED.SexeId AS sexeId, INSERTED.Code AS code, INSERTED.Label AS label 
       VALUES (@code, @label)`
    );
  
  return result.recordset[0];
}
