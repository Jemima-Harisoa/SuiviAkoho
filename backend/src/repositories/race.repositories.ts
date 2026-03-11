import { getPool } from "../config/database.config";
import {Race, CreateRaceDTO} from "../models/race.models";
import sql from 'mssql';

export async function findAllRacees() : Promise<Race[]> {
    const pool = await getPool();
    const result = await pool.request()
                             .query('SELECT RaceId, Name, DescriptionJson, CreatedAt FROM Race');

    return result.recordset;
}

export async function findRaceById(raceId: number) : Promise<Race | null>{
    const pool = await getPool();
    const result = await pool.request()
    .input('id', raceId)
    .query('SELECT RaceId, Name, DescriptionJson, CreatedAt FROM Race WHERE RaceId = @id');

    return result.recordset[0] ?? null;
}

export async function createRace(data: CreateRaceDTO) : Promise<Race>{
    const pool = await getPool();
    const descriptionJsonStr = data.descriptionJson != null ? JSON.stringify(data.descriptionJson) : null;
    const result = await pool.request()
    .input('name', sql.NVarChar(120), data.name)
    .input('descriptionJson', sql.NVarChar(sql.MAX), descriptionJsonStr)
    .query ('INSERT INTO Race (Name, DescriptionJson) OUTPUT INSERTED.RaceId, INSERTED.Name, INSERTED.DescriptionJson, INSERTED.CreatedAt VALUES (@name, @descriptionJson)');
    return result.recordset[0];
}