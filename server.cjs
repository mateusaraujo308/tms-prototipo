const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}if(pathname==='/')pathname='/index.html';const file=path.join(root,pathname);const type=types[path.extname(file)];if(!file.startsWith(root+path.sep)||!type){res.writeHead(404);return res.end('Not found');}fs.readFile(file,(error,data)=>{if(error){res.writeHead(error.code==='ENOENT'?404:500);return res.end(error.code==='ENOENT'?'Not found':'Erro ao abrir arquivo');}res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});res.end(data);});}).listen(4173,'127.0.0.1',()=>{console.log('TMS disponível em http://127.0.0.1:4173');if(process.argv.includes('--open'))require('node:child_process').spawn('cmd.exe',['/c','start','','http://127.0.0.1:4173'],{windowsHide:true});});
