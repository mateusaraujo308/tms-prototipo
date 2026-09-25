const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/company.js':'company.js','/emissions.js':'emissions.js','/cte.js':'cte.js','/cte-extras.js':'cte-extras.js'};
http.createServer((req,res)=>{const pathname = new URL(req.url,'http://localhost').pathname;const file=files[pathname];if(!file){res.writeHead(404);return res.end('Not found');}fs.readFile(path.join(__dirname,file),(error,data)=>{if(error){res.writeHead(500);return res.end('Erro ao abrir arquivo');}res.writeHead(200,{'Content-Type':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('TMS disponível em http://127.0.0.1:4173'));
