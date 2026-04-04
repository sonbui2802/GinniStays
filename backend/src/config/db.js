const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool using environment variables

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * This will be called in server.js before the app starts
 */
async function testConnection() {
  try {
    // Get a connection from the pool and run a simple query
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    
    console.log('✅ MySQL Database connected successfully.');
    
   
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error; // Re-throw so server.js knows it failed
  }
}

module.exports = {
  pool,
  testConnection
};