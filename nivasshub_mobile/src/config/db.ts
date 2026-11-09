import * as sql from 'mssql';
import * as dotenv from 'dotenv';
 
dotenv.config();
/**
 * Required database environment variables.
 * The application will fail to start if any of these
 * variables are missing.
 */
const requiredEnv = [
  'DB_SERVER',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_PORT',
];
/**
 * Validate that all required database configuration
 * values are available in the environment.
 */
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}`,
    );
  }
}
/**
 * SQL Server connection configuration.
 * Values are loaded from environment variables.
 */
const config: sql.config = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  /**
   * Connection pool configuration.
   */
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};
/**
 * Reusable SQL Server connection pool.
 */
let pool: sql.ConnectionPool | undefined;
/**
 * Creates and returns the SQL Server connection pool.
 * If an active connection already exists, the existing
 * connection pool is reused.
 */
export async function connectDB(): Promise<sql.ConnectionPool> {
  try {
    // Reuse the existing connection when it is still active.
    if (pool?.connected) {
      return pool;
    }
    // Create a new SQL Server connection pool.
    pool = await sql.connect(config);
    return pool;
  } catch (error: unknown) {
    // Re-throw the database connection error so that
    // the calling layer can handle it appropriately.
    throw error;
  }
}
export { sql };
 