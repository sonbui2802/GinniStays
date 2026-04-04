require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db.js');

const PORT = process.env.PORT || 5000;

/**
 * Start the GinniStays backend
 */
async function startServer() {
  try {
    // 1. Ensure DB is connected before starting the server
    await testConnection();

    // 2. Start listening for requests
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Critical failure: Could not start server.');
    process.exit(1); // Exit with failure code
  }
}

// --- GRACEFUL SHUTDOWN HANDLERS ---

// Handle sync errors (e.g., calling a non-existent function)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle async errors (e.g., a promise that was rejected and not caught)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();