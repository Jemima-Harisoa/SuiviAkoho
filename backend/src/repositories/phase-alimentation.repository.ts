import { getPool } from '../config/database.config';
import { PhaseAlimentation, CreatePhaseAlimentationDTO } from '../models/phase-alimentation.model';
import sql from 'mssql';

export async function findAll(): Promise<PhaseAlimentation[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      PhaseAlimentationId AS phaseAlimentationId,
      Code AS code,
      Label AS label,
      WeekFrom AS weekFrom,
      WeekTo AS weekTo,
      RationMinGPerDay AS rationMinGPerDay,
      RationMaxGPerDay AS rationMaxGPerDay,
      Objective AS objective,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId
      FROM PhaseAlimentation 
      ORDER BY Code`);
  
  return result.recordset;
}

export async function findById(phaseAlimentationId: number): Promise<PhaseAlimentation | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.TinyInt, phaseAlimentationId)
    .query(`SELECT 
      PhaseAlimentationId AS phaseAlimentationId,
      Code AS code,
      Label AS label,
      WeekFrom AS weekFrom,
      WeekTo AS weekTo,
      RationMinGPerDay AS rationMinGPerDay,
      RationMaxGPerDay AS rationMaxGPerDay,
      Objective AS objective,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId
      FROM PhaseAlimentation 
      WHERE PhaseAlimentationId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function findByCode(code: string): Promise<PhaseAlimentation | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), code)
    .query(`SELECT 
      PhaseAlimentationId AS phaseAlimentationId,
      Code AS code,
      Label AS label,
      WeekFrom AS weekFrom,
      WeekTo AS weekTo,
      RationMinGPerDay AS rationMinGPerDay,
      RationMaxGPerDay AS rationMaxGPerDay,
      Objective AS objective,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId
      FROM PhaseAlimentation 
      WHERE Code = @code`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreatePhaseAlimentationDTO): Promise<PhaseAlimentation> {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar(20), data.code)
    .input('label', sql.NVarChar(100), data.label)
    .input('weekFrom', sql.TinyInt, data.weekFrom)
    .input('weekTo', sql.TinyInt, data.weekTo)
    .input('rationMinGPerDay', sql.Decimal(8, 2), data.rationMinGPerDay)
    .input('rationMaxGPerDay', sql.Decimal(8, 2), data.rationMaxGPerDay)
    .input('objective', sql.NVarChar(200), data.objective ?? null)
    .input('raceId', sql.Int, data.raceId ?? null)
    .input('typeProductionId', sql.TinyInt, data.typeProductionId ?? null)
    .query(
      `INSERT INTO PhaseAlimentation (Code, Label, WeekFrom, WeekTo, RationMinGPerDay, RationMaxGPerDay, Objective, RaceId, TypeProductionId) 
       OUTPUT 
        INSERTED.PhaseAlimentationId AS phaseAlimentationId,
        INSERTED.Code AS code,
        INSERTED.Label AS label,
        INSERTED.WeekFrom AS weekFrom,
        INSERTED.WeekTo AS weekTo,
        INSERTED.RationMinGPerDay AS rationMinGPerDay,
        INSERTED.RationMaxGPerDay AS rationMaxGPerDay,
        INSERTED.Objective AS objective,
        INSERTED.RaceId AS raceId,
        INSERTED.TypeProductionId AS typeProductionId
       VALUES (@code, @label, @weekFrom, @weekTo, @rationMinGPerDay, @rationMaxGPerDay, @objective, @raceId, @typeProductionId)`
    );
  
  return result.recordset[0];
}
