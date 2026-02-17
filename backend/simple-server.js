console.log('A: Starting...');

const express = require('express');
console.log('B: Imported express');

const config = require('./config/env');
console.log('C: Imported config');

const logger = require('./config/logger');
console.log('D: Imported logger');

const app = express();
console.log('E: Created app');

app.use(express.json());
console.log('F: Added json middleware');

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});
console.log('G: Added health route');

app.post('/api/similarity/check', (req, res) => {
  res.json({ message: 'similarity check' });
});
console.log('H: Added similarity route');

const PORT = config.port || 3000;
console.log('I: About to listen on port', PORT);

const server = app.listen(PORT, '127.0.0.1');
console.log('J: Called app.listen()');

server.on('listening', () => {
  console.log('K: Server is now listening!');
  console.log(`✅ Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('L: Server error:', err);
});

console.log('M: Event handlers registered, process continuing...');
