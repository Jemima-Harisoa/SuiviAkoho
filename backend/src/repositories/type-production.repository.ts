import { getPool } from '../config/database.config';
import { TypeProduction, CreateTypeProductionDTO } from '../models/type-production.model';
import sql from 'mssql';

export async function findAll(): Promise<TypeProduction[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT TypeProductionId AS typeProductionId, Code AS code, Label AS label, SexeId AS sexeId FROM TypeProduction ORDER BY Code');
  
  return result.recordset;
}

export async function findById(typeProductionId: number): Promise<TypeProduction | null> {
    const pool = await getPool();
    const result = await pool.request()
    .input('id', sql.TinyInt, typeProductionId)
    .query('SELECT TypeProductionId AS typeProductionId, Code AS code, Label AS label, SexeId AS sexeId FROM TypeProduction WHERE TypeProductionId = @id');
    return result.recordset[0] ?? null;
}

export async function findByCode(code: string): Promise<TypeProduction | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), code)
    .query('SELECT TypeProductionId AS typeProductionId, Code AS code, Label AS label, SexeId AS sexeId FROM TypeProduction WHERE Code = @code');
  return result.recordset[0] ?? null;
}

export async function create(data: CreateTypeProductionDTO): Promise<TypeProduction> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), data.code)
    .input('label', sql.NVarChar(100), data.label)
    .input('sexeId', sql.TinyInt, data.sexeId ?? null)
    .query(
      `INSERT INTO TypeProduction (Code, Label, SexeId) 
       OUTPUT INSERTED.TypeProductionId AS typeProductionId, INSERTED.Code AS code, INSERTED.Label AS label, INSERTED.SexeId AS sexeId
       VALUES (@code, @label, @sexeId)`
    );
  
  return result.recordset[0];
}
