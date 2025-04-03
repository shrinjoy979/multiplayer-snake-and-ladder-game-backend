const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for some cloud providers
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Ensure the table exists when the server starts
const createTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          profile_image TEXT
        );
      `);
      console.log("✅ Users table is ready.");
    } catch (error) {
      console.error("❌ Error creating table:", error);
    }
};
  
// Call this function when the backend starts
createTable();

module.exports = pool;
