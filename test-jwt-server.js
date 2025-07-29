// Simple test JWT server for development
const http = require('http');

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        console.log('[JWT Server] Received request:', requestData);
        
        // Generate a mock JWT token
        const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJ6b29tIiwiaXNzIjoidGVzdCIsImV4cCI6MTcwOTgzMjAwMH0.mock_signature_for_testing';
        
        const response = {
          token: mockToken,
          expires_in: 3600
        };
        
        console.log('[JWT Server] Sending response:', response);
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(response));
        
      } catch (error) {
        console.error('[JWT Server] Error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 4000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[JWT Server] Test JWT server running at http://127.0.0.1:${PORT}`);
  console.log('[JWT Server] This is a mock server for development testing');
  console.log('[JWT Server] Waiting for JWT token requests...');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[JWT Server] Shutting down...');
  server.close(() => {
    console.log('[JWT Server] Server closed');
    process.exit(0);
  });
});