console.log('A: Starting...');

console.log('B: About to call dotenv.config()');
require('dotenv').config();
console.log('C: dotenv.config() completed');

const express = require('express');
console.log('D: Created express');

const app = express();
app.get('/health', (req, res) => res.json({ status: 'OK' }));

const server = app.listen(3000, '127.0.0.1');
server.on('listening', () => {
  console.log('✅ Server listening on port 3000');
});

console.log('E: Setup complete');
