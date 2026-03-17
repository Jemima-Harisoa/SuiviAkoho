"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.closePool = closePool;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    server: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Dev@12345',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME || 'SuiviAkoho',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};
let pool = null;
async function getPool() {
    try {
        pool ?? (pool = await mssql_1.default.connect(config));
        console.log('Connecte a SQL Server');
        return pool;
    }
    catch (error) {
        const err = error;
        console.error('Erreur SQL Server (getPool):', {
            message: err.message,
            stack: err.stack,
            server: config.server,
            database: config.database,
            port: config.port,
        });
        throw error;
    }
}
async function closePool() {
    try {
        await pool?.close();
        pool = null;
        console.log('Connexion SQL Server fermee');
    }
    catch (error) {
        const err = error;
        console.error('Erreur SQL Server (closePool):', {
            message: err.message,
            stack: err.stack,
        });
        throw error;
    }
}
