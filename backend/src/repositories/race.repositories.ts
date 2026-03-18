import { getPool } from "../config/database.config";
import {Race, CreateRaceDTO} from "../models/race.models";
import sql from 'mssql';

export async function findAll() : Promise<Race[]> {
    const pool = await getPool();
    const result = await pool.request()
                             .query('SELECT RaceId AS raceId, Name AS name, DescriptionJson AS descriptionJson, CreatedAt AS createdAt FROM Race ORDER BY Name');

    return result.recordset;
}

export async function findById(raceId: number) : Promise<Race | null>{
    const pool = await getPool();
    const result = await pool.request()
    .input('id', sql.Int, raceId)
    .query('SELECT RaceId AS raceId, Name AS name, DescriptionJson AS descriptionJson, CreatedAt AS createdAt FROM Race WHERE RaceId = @id');

    return result.recordset[0] ?? null;
}

export async function findByName(name: string) : Promise<Race | null>{
    const pool = await getPool();
    const result = await pool.request()
    .input('name', sql.NVarChar(120), name)
    .query('SELECT RaceId AS raceId, Name AS name, DescriptionJson AS descriptionJson, CreatedAt AS createdAt FROM Race WHERE Name = @name');

    return result.recordset[0] ?? null;
}

export async function create(data: CreateRaceDTO) : Promise<Race>{
    const pool = await getPool();
    const descriptionJsonStr = data.descriptionJson != null ? JSON.stringify(data.descriptionJson) : null;
    const result = await pool.request()
    .input('name', sql.NVarChar(120), data.name)
    .input('descriptionJson', sql.NVarChar(sql.MAX), descriptionJsonStr)
    .query('INSERT INTO Race (Name, DescriptionJson) OUTPUT INSERTED.RaceId AS raceId, INSERTED.Name AS name, INSERTED.DescriptionJson AS descriptionJson, INSERTED.CreatedAt AS createdAt VALUES (@name, @descriptionJson)');
    return result.recordset[0];
}