import http from 'http';
import { URL } from 'url';
import { OrchestratorService } from './services/orchestrator.service';

const PORT = process.env.PORT || 5000;
const ORCHESTRATOR_TOKEN = process.env.LAB_ORCHESTRATOR_TOKEN || 'secure-internal-orchestrator-token-change-me';

const orchestrator = new OrchestratorService();

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method || 'GET';

  // Health endpoint (Public / Liveness)
  if (pathname === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }

  // Internal Service Authentication check
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token || token !== ORCHESTRATOR_TOKEN) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'UNAUTHORIZED_INTERNAL_REQUEST' }));
    return;
  }

  try {
    // POST /internal/lab-instances
    if (pathname === '/internal/lab-instances' && method === 'POST') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await orchestrator.createInstance(data);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Match /internal/lab-instances/:id/...
    const match = pathname.match(/^\/internal\/lab-instances\/([^/]+)(\/(start|stop|restart|status|connection))?$/);
    if (match) {
      const instanceId = match[1];
      const action = match[3];

      if (method === 'GET' && !action) {
        const status = await orchestrator.getStatus(instanceId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ instanceId, status }));
        return;
      }

      if (method === 'POST' && action === 'start') {
        const result = await orchestrator.startInstance(instanceId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      if (method === 'POST' && action === 'stop') {
        const result = await orchestrator.stopInstance(instanceId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      if (method === 'POST' && action === 'restart') {
        const result = await orchestrator.restartInstance(instanceId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      if (method === 'GET' && action === 'status') {
        const status = await orchestrator.getStatus(instanceId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ instanceId, status }));
        return;
      }

      if (method === 'GET' && action === 'connection') {
        const conn = await orchestrator.getConnectionInfo(instanceId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(conn));
        return;
      }

      if (method === 'DELETE') {
        await orchestrator.destroyInstance(instanceId);
        res.writeHead(204);
        res.end();
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ENDPOINT_NOT_FOUND' }));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: err.message }));
  }
});

if (require.main === module) {
  server.listen(Number(PORT), () => {
    console.log(`Lab Orchestrator running on port ${PORT}`);
  });
}

export default server;
