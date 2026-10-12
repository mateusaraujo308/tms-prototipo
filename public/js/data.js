// Camada de dados no Supabase: carrega as tabelas antes do app e sincroniza cada save().
const ROTA_TABLES={company:'company',drivers:'drivers',models:'models',vehicles:'vehicles',customers:'customers',cteDrafts:'cte_drafts',mdfeDrafts:'mdfe_drafts'};
const ROTA_SCRIPTS=['app.js','company.js','emissions.js','cte.js','cte-extras.js','navigation.js','workflows.js','mdfe.js','operations.js'];
const rotaSync=(()=>{
 let client,synced={},queue=Promise.resolve(),pending=0;
 const snapshot=data=>Object.fromEntries(Object.keys(ROTA_TABLES).map(k=>[k,new Map((data[k]||[]).map(x=>[x.id,JSON.stringify(x)]))]));
 async function load(){
  const cfg=window.ROTA_SUPABASE||{};
  if(!cfg.url||!cfg.anonKey)throw Error('Supabase não configurado. Preencha public/js/supabase-config.js.');
  if(!window.supabase)throw Error('Não foi possível carregar a biblioteca do Supabase. Verifique a conexão com a internet.');
  client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:false}});
  const data={};
  await Promise.all(Object.entries(ROTA_TABLES).map(async([key,table])=>{
   const {data:rows,error}=await client.from(table).select('id,data').order('created_at');
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
 return {load,save};
})();
(async()=>{
 const main=document.getElementById('main');
 main.innerHTML='<p class="loading-state">Carregando dados…</p>';
 try{window.ROTA_DATA=await rotaSync.load()}
 catch(e){main.innerHTML=`<section class="panel"><div class="panel-body"><h2>Não foi possível conectar ao banco de dados</h2><p>${String(e.message).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}</p><button class="button" onclick="location.reload()">Tentar novamente</button></div></section>`;return}
 for(const src of ROTA_SCRIPTS){const s=document.createElement('script');s.src='js/'+src;s.async=false;document.body.append(s)}
})();
