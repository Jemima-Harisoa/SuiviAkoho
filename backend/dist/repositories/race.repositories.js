"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllRacees = findAllRacees;
exports.findRaceById = findRaceById;
exports.createRace = createRace;
const database_config_1 = require("../config/database.config");
const mssql_1 = __importDefault(require("mssql"));
async function findAllRacees() {
    const pool = await (0, database_config_1.getPool)();
    const result = await pool.request()
        .query('SELECT RaceId AS raceId, Name AS name, DescriptionJson AS descriptionJson, CreatedAt AS createdAt FROM Race');
    return result.recordset;
}
async function findRaceById(raceId) {
    const pool = await (0, database_config_1.getPool)();
    const result = await pool.request()
        .input('id', raceId)
        .query('SELECT RaceId AS raceId, Name AS name, DescriptionJson AS descriptionJson, CreatedAt AS createdAt FROM Race WHERE RaceId = @id');
    return result.recordset[0] ?? null;
}
async function createRace(data) {
    const pool = await (0, database_config_1.getPool)();
    const descriptionJsonStr = data.descriptionJson != null ? JSON.stringify(data.descriptionJson) : null;
    const result = await pool.request()
        .input('name', mssql_1.default.NVarChar(120), data.name)
        .input('descriptionJson', mssql_1.default.NVarChar(mssql_1.default.MAX), descriptionJsonStr)
        .query('INSERT INTO Race (Name, DescriptionJson) OUTPUT INSERTED.RaceId AS raceId, INSERTED.Name AS name, INSERTED.DescriptionJson AS descriptionJson, INSERTED.CreatedAt AS createdAt VALUES (@name, @descriptionJson)');
    return result.recordset[0];
}
