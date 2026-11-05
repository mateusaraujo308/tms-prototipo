// Camada de dados no Supabase: carrega as tabelas antes do app e sincroniza cada save().
const ROTA_TABLES={company:'company',drivers:'drivers',models:'models',vehicles:'vehicles',customers:'customers',cteDrafts:'cte_drafts',mdfeDrafts:'mdfe_drafts',users:'users'};
const ROTA_SCRIPTS=['app.js','company.js','emissions.js','cte.js','cte-extras.js','navigation.js','workflows.js','mdfe.js','operations.js','cte-xml.js','users.js','table-actions.js','integrations.js'];
const rotaSync=(()=>{
 let client,synced={},queue=Promise.resolve(),pending=0;
 const snapshot=data=>Object.fromEntries(Object.keys(ROTA_TABLES).map(k=>[k,new Map((data[k]||[]).map(x=>[x.id,JSON.stringify(x)]))]));
 async function load(){
  const cfg=window.ROTA_SUPABASE||{};
  if(!cfg.url||!cfg.anonKey)throw Error('Supabase não configurado. Preencha public/js/supabase-config.js.');
  if(!window.supabase)throw Error('Não foi possível carregar a biblioteca do Supabase. Verifique a conexão com a internet.');
  const fetchWithTimeout=async(url,options={})=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000),abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});try{return await fetch(url,{...options,signal:controller.signal})}finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort)}};
  client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:false},global:{fetch:fetchWithTimeout}});
  const data={};
  await Promise.all(Object.entries(ROTA_TABLES).map(async([key,table])=>{
   const {data:rows,error}=await client.from(table).select('id,data').order('created_at');
   // Tabela ainda não criada no banco: o app abre e avisa ao tentar gravar nela.
   if(error&&(error.code==='PGRST205'||error.code==='42P01')){console.warn(`Tabela ${table} não encontrada. Execute supabase/schema.sql.`);data[key]=[];return}
   if(error)throw Error(`Erro ao ler a tabela ${table}: ${error.message}`);
   data[key]=rows.map(r=>({...r.data,id:r.id}));
  }));
  synced=snapshot(data);return data;
 }
 // Compara com o último estado gravado e envia apenas inclusões, alterações e exclusões.
 async function push(db){
  const next=snapshot(db);
  for(const [key,table] of Object.entries(ROTA_TABLES)){
   const before=synced[key],after=next[key];
   const upserts=[...after].filter(([id,json])=>before.get(id)!==json).map(([id,json])=>({id,data:JSON.parse(json),updated_at:new Date().toISOString()}));
   const deletes=[...before.keys()].filter(id=>!after.has(id));
   if(upserts.length){const {error}=await client.from(table).upsert(upserts);if(error)throw Error(error.message)}
   if(deletes.length){const {error}=await client.from(table).delete().in('id',deletes);if(error)throw Error(error.message)}
   synced[key]=after;
  }
 }
 function save(db){
  const copy=structuredClone(db);pending++;
  queue=queue.then(()=>push(copy)).catch(e=>{console.error(e);toast('Não foi possível salvar no Supabase: '+e.message)}).finally(()=>pending--);
  return queue;
 }
 window.addEventListener('beforeunload',e=>{if(pending){e.preventDefault();e.returnValue=''}});
 async function rpc(fn,args){await queue;const {error}=await client.rpc(fn,args);if(error)throw Error(error.message)}
 return {load,save,rpc};
})();
(async()=>{
 const main=document.getElementById('main');
 main.innerHTML='<p class="loading-state">Carregando dados…</p>';
 try{window.ROTA_DATA=await rotaSync.load()}
 catch(e){window.ROTA_READONLY_OFFLINE=true;window.ROTA_DB_CONNECTION_ERROR='A conexão com o banco de dados falhou.';console.error('Falha ao carregar dados do Supabase:',e);window.ROTA_DATA=Object.fromEntries(Object.keys(ROTA_TABLES).map(k=>[k,[]]));main.innerHTML='<section class="panel"><div class="panel-body"><h2>Banco indisponível — modo somente leitura</h2><p>Não foi possível carregar os dados. Verifique a conexão e tente novamente.</p><p>A central de integrações permanece disponível; cadastros e rascunhos não serão salvos.</p><button class="button" onclick="location.reload()">Tentar novamente</button></div></section>'}
 for(const src of ROTA_SCRIPTS){const s=document.createElement('script');s.src='js/'+src;s.async=false;document.body.append(s)}
})();
