// Standalone connectivity check for the local dev database.
// Run with: npm run db:ping
const { ping, close } = require('../database');

(async () => {
  try {
    await ping();
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.error(`❌ Could not connect to MongoDB: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();
