const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { getIntegrationStatus } = require('./server/integrations/status.cjs');

function loadLocalEnv() {
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(ROTA_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}
loadLocalEnv();

const root = path.resolve(__dirname, 'public');
const port = Number(process.env.ROTA_PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url, 'http://127.0.0.1');
  } catch {
    return sendJson(res, 400, { error: 'Bad request' });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', externalCallsMade: false });
  }
  if (url.pathname === '/api/integrations/status') {
    return sendJson(res, 200, getIntegrationStatus());
  }
  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'Not found' });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return sendJson(res, 400, { error: 'Bad request' });
  }
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) || !mime[path.extname(file)]) {
    res.writeHead(404, { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    return res.end('Not found');
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      return res.end(error.code === 'ENOENT' ? 'Not found' : 'Erro ao abrir arquivo');
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)],
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Rota TMS disponível em http://127.0.0.1:${port}`);
  console.log('Diagnóstico local somente leitura; chamadas externas desativadas.');
  if (process.argv.includes('--open')) {
    require('node:child_process').spawn('cmd.exe', ['/c', 'start', '', `http://127.0.0.1:${port}`], { windowsHide: true });
  }
});
