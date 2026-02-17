const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

console.log('1. Express app created');

app.use(express.json());
console.log('2. Middleware configured');

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});
console.log('3. Routes configured');

console.log('4. About to listen on port', PORT);
const server = app.listen(PORT, '127.0.0.1');
console.log('5. app.listen() called');

server.on('listening', () => {
  console.log('6. Server is listening on port', PORT);
});

server.on('error', (err) => {
  console.error('7. Server error:', err);
});

console.log('8. Server object created, waiting for async...');
