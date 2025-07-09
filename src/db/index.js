// Import Pool from 'pg' package to manage PostgreSQL connections
import pkg from "pg";
const { Pool } = pkg;

// Initialize connection pool using environment variables
const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Export the database pool for use in other modules
export default db;
