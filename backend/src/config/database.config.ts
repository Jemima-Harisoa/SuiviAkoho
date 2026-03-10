import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
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

let pool: sql.ConnectionPool | null = null;


export async function getPool(): Promise<sql.ConnectionPool> {
  try {
    pool ??= await sql.connect(config);
    console.log('Connecte a SQL Server');
    return pool;
  } catch (error) {
    const err = error as Error;
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

export async function closePool(): Promise<void> {
  try {
    await pool?.close();
    pool = null;
    console.log('Connexion SQL Server fermee');
  } catch (error) {
    const err = error as Error;
    console.error('Erreur SQL Server (closePool):', {
      message: err.message,
      stack: err.stack,
    });
    throw error;
  }
}