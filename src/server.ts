import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start
const server = app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker API running on port ${PORT}`);
});

// Rejection
process.on('unhandledRejection', (err: Error) => {
  console.error('⚠️ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Exception
process.on('uncaughtException', (err: Error) => {
  console.error('⚠️ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});