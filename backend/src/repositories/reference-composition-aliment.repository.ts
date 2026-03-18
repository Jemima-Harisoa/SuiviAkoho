import { getPool } from '../config/database.config';
import { ReferenceCompositionAliment, CreateReferenceCompositionAlimentDTO } from '../models/reference-composition-aliment.model';
import sql from 'mssql';

export async function findAll(): Promise<ReferenceCompositionAliment[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT 
      ReferenceCompositionAlimentId AS referenceCompositionAlimentId,
      Ingredient AS ingredient,
      PercentMin AS percentMin,
      PercentMax AS percentMax,
      Notes AS notes,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId
      FROM ReferenceCompositionAliment 
      ORDER BY Ingredient`);
  
  return result.recordset;
}

export async function findById(referenceCompositionAlimentId: number): Promise<ReferenceCompositionAliment | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, referenceCompositionAlimentId)
    .query(`SELECT 
      ReferenceCompositionAlimentId AS referenceCompositionAlimentId,
      Ingredient AS ingredient,
      PercentMin AS percentMin,
      PercentMax AS percentMax,
      Notes AS notes,
      RaceId AS raceId,
      TypeProductionId AS typeProductionId
      FROM ReferenceCompositionAliment 
      WHERE ReferenceCompositionAlimentId = @id`);
  
  return result.recordset[0] ?? null;
}

export async function create(data: CreateReferenceCompositionAlimentDTO): Promise<ReferenceCompositionAliment> {
  const pool = await getPool();
  const result = await pool.request()
    .input('ingredient', sql.NVarChar(120), data.ingredient)
    .input('percentMin', sql.Decimal(5, 2), data.percentMin ?? null)
    .input('percentMax', sql.Decimal(5, 2), data.percentMax ?? null)
    .input('notes', sql.NVarChar(250), data.notes ?? null)
    .input('raceId', sql.Int, data.raceId ?? null)
    .input('typeProductionId', sql.TinyInt, data.typeProductionId ?? null)
    .query(
      `INSERT INTO ReferenceCompositionAliment (Ingredient, PercentMin, PercentMax, Notes, RaceId, TypeProductionId) 
       OUTPUT 
        INSERTED.ReferenceCompositionAlimentId AS referenceCompositionAlimentId,
        INSERTED.Ingredient AS ingredient,
        INSERTED.PercentMin AS percentMin,
        INSERTED.PercentMax AS percentMax,
        INSERTED.Notes AS notes,
        INSERTED.RaceId AS raceId,
        INSERTED.TypeProductionId AS typeProductionId
       VALUES (@ingredient, @percentMin, @percentMax, @notes, @raceId, @typeProductionId)`
    );
  
  return result.recordset[0];
}
