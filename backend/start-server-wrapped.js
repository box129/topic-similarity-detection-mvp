#!/usr/bin/env node
/**
 * Clean startup wrapper - starts the Express server
 */

console.log('\n🚀 BACKEND SERVER STARTING\n');
console.log(`📍 Time: ${new Date().toISOString()}`);
console.log(`🔧 Node: ${process.version}`);
console.log(`📊 PID: ${process.pid}\n`);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n⚠️  UNHANDLED REJECTION:', reason);
});

// Start server
try {
  require('./src/server');
  console.log('✅ Server started successfully\n');
  console.log('═'.repeat(50));
  console.log('Server is running on port 8080');
  console.log('Press CTRL+C to stop\n');
  console.log('Endpoints:');
  console.log('  GET  http://localhost:8080/health');
  console.log('  POST http://localhost:8080/api/similarity/check\n');
  console.log('═'.repeat(50) + '\n');
} catch (err) {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
}
