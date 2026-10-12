// Navegação e cadastros inspirados nos vídeos, preservando o tema Rota.
const states=ufOptions.map(([x])=>x);
if(!Array.isArray(db.customers))db.customers=[];
routes.splice(4,0,['customers','♧','Clientes / Participantes']);
config.customers={title:'Clientes / Participantes',single:'cliente',description:'Remetentes, destinatários, tomadores e proprietários em um único cadastro.'};
const customerSections=[
 ['identity','Identificação',[['personType','Tipo de pessoa','select',['Jurídica','Física','Exterior']],['document','CPF / CNPJ'],['name','Razão social / Nome','text',true],['tradeName','Nome fantasia'],['ie','Inscrição estadual'],['exempt','Isento de inscrição estadual','checkbox'],['municipalRegistration','Inscrição municipal'],['registrationDate','Data de cadastro','date'],['birthDate','Data de nascimento','date'],['sex','Sexo','select',['Não informado','Feminino','Masculino']],['activity','Atividade'],['phone','Telefone 1','tel'],['phone2','Telefone 2','tel']]],
 ['address','Endereço',[['postalCode','CEP'],['street','Endereço'],['number','Número'],['district','Bairro'],['complement','Complemento'],['state','UF','select',['',...states]],['city','Cidade']]],
 ['contacts','E-mails',[['email','E-mail da empresa','email'],['emailXml','Enviar XML para empresa (simulação)','checkbox'],['contactEmail','E-mail do contato','email'],['contactXml','Enviar XML para contato (simulação)','checkbox'],['accountantEmail','E-mail do contador','email'],['accountantXml','Enviar XML para contador (simulação)','checkbox'],['carrierEmail','E-mail da transportadora','email'],['carrierXml','Enviar XML para transportadora (simulação)','checkbox']]],
 ['bank','Dados bancários',[['bank','Banco'],['agency','Agência'],['account','Conta'],['pix','Chave PIX']]],
 ['tax','Tributos e observações',[['rntrc','RNTRC'],['taxRegime','Regime tributário','select',['Não informado','Simples Nacional','Normal']],['notes','Observações','textarea']]]
];
const vehicleSections=[
 ['vehicle','Dados do veículo',[['plate','Placa','text',true],['model','Modelo','select',[]],['year','Ano de fabricação','number'],['renavam','RENAVAM'],['tare','Tara (kg)','number'],['capacityKg','Capacidade (kg)','number'],['capacityM3','Capacidade (m³)','number'],['axles','Quantidade de eixos','number'],['ownership','Propriedade','select',['Próprio','Terceiro']],['vehicleType','Tipo de veículo','select',['Tração','Reboque']],['wheelType','Tipo rodado','select',['Não aplicável','Truck','Toco','Cavalo mecânico','VAN','Utilitário','Outros']],['bodyType','Tipo de carroceria','select',['Não aplicável','Aberta','Fechada / Baú','Graneleira','Porta-container','Sider']],['state','UF','select',['',...states]],['driver','Motorista responsável','select',[]],['status','Situação','select',['Disponível','Manutenção','Inativo']]]],
 ['owner','Informações do proprietário',[['ownerId','Proprietário','select',[]],['ownerType','Tipo do proprietário','select',['Não informado','TAC agregado','TAC independente','ETC']],['ownerRntrc','RNTRC do proprietário'],['ownerCiot','CIOT']]],
 ['extra','Informações adicionais',[['notes','Observações','textarea']]],
 ['toll','Informações de pedágio',[['tollTag','Tag de pedágio'],['tollSupplier','Fornecedor'],['tollValue','Valor (R$)','number']]]
];
let recordBuffer={};
const beforeRecordOpen=openForm;
openForm=function(id){
 if(!['vehicles','customers'].includes(route))return beforeRecordOpen(id);
 editing=id||null;recordBuffer=structuredClone(db[route].find(x=>x.id===id)||{});recordBuffer.linkedVehicles??=[];
 if(route==='vehicles'){
  vehicleSections[0][2].find(x=>x[0]==='model')[3]=db.models.map(x=>[x.id,`${x.brand} ${x.name}`]);
  vehicleSections[0][2].find(x=>x[0]==='driver')[3]=[['','Não vinculado'],...db.drivers.map(x=>[x.id,x.name])];
  vehicleSections[1][2].find(x=>x[0]==='ownerId')[3]=[['','Selecione'],...db.customers.map(x=>[x.id,x.name])];
 }
 $('#dialog').classList.add('company-dialog');$('#form').noValidate=true;
 $('#modal-title').textContent=(id?'Editar ':'Cadastrar ')+(route==='vehicles'?'veículo':'cliente');$('#form-error').textContent='';
 const sections=route==='vehicles'?vehicleSections:customerSections;
 $('#fields').innerHTML=sections.map(([key,label,fields],i)=>`<details class="company-panel" ${i<2?'open':''}><summary>${label}</summary><div class="form-grid">${fields.map(f=>recordInput(f,recordBuffer)).join('')}</div></details>`).join('')+(route==='vehicles'?`<details class="company-panel" open><summary>Veículos vinculados / Reboques</summary><div id="linked-vehicles"></div><div class="collection-entry"><label>Selecione o reboque<select id="trailer-pick"><option value="">Selecione</option>${db.vehicles.filter(x=>x.id!==id&&x.vehicleType==='Reboque').map(x=>`<option value="${esc(x.id)}">${esc(x.plate)} • ${esc(x.renavam||'Sem RENAVAM')}</option>`).join('')}</select></label><button type="button" id="link-trailer" class="button secondary">Adicionar vínculo</button></div></details>`:'');
 if(route==='vehicles'){
  const linked=()=>{$('#linked-vehicles').innerHTML=cteTable(['Placa','RENAVAM','Ação'],recordBuffer.linkedVehicles.map((id,i)=>{const v=db.vehicles.find(x=>x.id===id);return `<tr><td>${esc(v?.plate||'Cadastro removido')}</td><td>${esc(v?.renavam||'—')}</td><td><button type="button" class="row-action danger" data-unlink="${i}">Remover vínculo</button></td></tr>`}));document.querySelectorAll('[data-unlink]').forEach(b=>b.onclick=()=>{recordBuffer.linkedVehicles.splice(Number(b.dataset.unlink),1);linked()})};linked();
  $('#link-trailer').onclick=()=>{const id=$('#trailer-pick').value;if(!id)return toast('Selecione um reboque.');if(recordBuffer.linkedVehicles.includes(id))return toast('Este reboque já está vinculado.');recordBuffer.linkedVehicles.push(id);linked()};
 }
 $('#dialog').showModal();
};
function recordInput([key,label,type='text',options],source){
 const value=source[key]??'';let field;
 if(type==='checkbox')return `<label class="check-field"><input name="${key}" type="checkbox" ${value?'checked':''}>${label}</label>`;
 if(type==='select')field=`<select name="${key}">${options.map(x=>{const [id,text]=Array.isArray(x)?x:[x,x];return `<option value="${esc(id)}" ${value===id?'selected':''}>${esc(text||'Selecione')}</option>`}).join('')}</select>`;
 else if(type==='textarea')field=`<textarea name="${key}" rows="3" maxlength="4000">${esc(value)}</textarea>`;
 else field=`<input name="${key}" value="${esc(value)}" type="${type}" ${options===true?'required':''} ${type==='number'?'min="0" step="any"':'maxlength="200"'}>`;
 return `<label class="${type==='textarea'?'wide-field':''}">${label}${options===true?' *':''}${field}</label>`;
}
const beforeRecordSubmit=$('#form').onsubmit;
$('#form').onsubmit=function(e){
 if(!['customers','vehicles'].includes(route))return beforeRecordSubmit(e);
 e.preventDefault();const form=e.currentTarget;const values={...recordBuffer,...Object.fromEntries(new FormData(form))};
 form.querySelectorAll('input[type=checkbox]').forEach(x=>values[x.name]=x.checked);
 Object.keys(values).forEach(k=>{if(typeof values[k]==='string')values[k]=values[k].trim()});
 const invalid=[...form.elements].find(x=>x.willValidate&&(!x.validity.valid||(x.required&&!x.value.trim())));
 if(invalid){invalid.closest('details').open=true;invalid.focus();invalid.reportValidity();return}
 if(route==='vehicles'){
  values.plate=values.plate.toUpperCase().replace(/[-\s]/g,'');
  if(!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(values.plate)||db.vehicles.some(x=>x.id!==editing&&x.plate===values.plate)){$('#form-error').textContent='Informe uma placa válida e que não esteja cadastrada.';return}
  if(values.model&&!db.models.some(x=>x.id===values.model)){$('#form-error').textContent='Selecione um modelo cadastrado.';return}
 }
 values.id=editing||crypto.randomUUID();const index=db[route].findIndex(x=>x.id===editing);if(index<0)db[route].push(values);else db[route][index]=values;
 const ok=save();$('#dialog').close();render();if(ok)toast('Cadastro salvo com sucesso.');
};
const beforeRecords=records;
records=function(){if(route!=='customers')return beforeRecords();const data=db.customers.filter(x=>Object.values(x).join(' ').toLowerCase().includes(search.toLowerCase()));$('#count').textContent=`${data.length} registro(s)`;$('#records').innerHTML=cteTable(['Nome / Razão social','CPF / CNPJ','Cidade / UF','Ações'],data.map(x=>`<tr><td><strong>${esc(x.name)}</strong><small>${esc(x.tradeName||'')}</small></td><td>${esc(x.document)}</td><td>${esc(x.city||'—')} / ${esc(x.state||'—')}</td><td><button class="row-action" data-edit="${x.id}">Editar</button><button class="row-action danger" data-delete="${x.id}">Excluir</button></td></tr>`));document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openForm(b.dataset.edit));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>remove(b.dataset.delete));};
const beforeRemove=remove;
remove=function(id){if(route==='customers'&&db.vehicles.some(x=>x.ownerId===id))return toast('Cliente vinculado como proprietário de um veículo. Altere o vínculo antes de excluir.');if(route==='vehicles'&&db.vehicles.some(x=>(x.linkedVehicles||[]).includes(id)))return toast('Remova os vínculos deste reboque antes de excluir.');beforeRemove(id)};
const navIcons={dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',company:'<path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h4v12M9 7h2M9 11h2M9 15h2"/>',customers:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 9M22 21a7 7 0 0 0-4-6.3"/>',drivers:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 14v7M10 12H3.5M14 12h6.5"/>',models:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',vehicles:'<path d="M2 17V6a1 1 0 0 1 1-1h11v12M14 9h4l4 4v4h-2M8 17h7"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',cte:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',mdfe:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',queries:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'};
const navGroups=[['cadastros','Cadastros',['company','customers','drivers']],['frota','Frota',['models','vehicles']],['emissoes','Emissões',['cte','mdfe']]];
const NAV_KEY='rota-nav-collapsed';let navCollapsed;
try{navCollapsed=new Set(JSON.parse(localStorage.getItem(NAV_KEY))||[])}catch{navCollapsed=new Set()}
function navIcon(id){return `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${navIcons[id]||''}</svg>`}
function navCount(id){const n=(db[id+'Drafts']||[]).filter(x=>x.status==='Rascunho').length;return n?`<span class="nav-count" title="${n} rascunho(s)">${n}<span class="sr-only"> rascunho(s)</span></span>`:''}
function groupedNav(){
 const item=id=>{const r=routes.find(x=>x[0]===id);return `<a href="#${id}" class="${route===id?'active':''}" ${route===id?'aria-current="page"':''}>${navIcon(id)}<span class="nav-text">${r[2]}</span>${navCount(id)}</a>`};
 $('#sidebar nav').innerHTML=item('dashboard')+navGroups.map(([id,label,children])=>{
  const current=children.includes(route),open=current||!navCollapsed.has(id);
  return `<div class="nav-group${current?' has-current':''}"><button type="button" class="nav-toggle" aria-expanded="${open}" aria-controls="nav-${id}" data-nav="${id}"><span>${label}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="nav-${id}" ${open?'':'hidden'}>${children.map(item).join('')}</div></div>`;
 }).join('')+`<div class="nav-separator" role="presentation"></div>`+item('queries')+item('settings');
 // Alterna o grupo sem redesenhar o menu, preservando o foco do teclado.
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{const id=b.dataset.nav,open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',open);$('#nav-'+id).hidden=!open;open?navCollapsed.delete(id):navCollapsed.add(id);try{localStorage.setItem(NAV_KEY,JSON.stringify([...navCollapsed]))}catch{}});
}
// Menu lateral em telas pequenas: fundo escurecido, Esc e fechamento ao navegar.
const navBackdrop=document.createElement('div');navBackdrop.className='nav-backdrop';document.body.append(navBackdrop);
function setNavOpen(open){$('#sidebar').classList.toggle('open',open);document.body.classList.toggle('nav-open',open);$('#menu').setAttribute('aria-expanded',open);$('#menu').setAttribute('aria-label',open?'Fechar menu':'Abrir menu');if(open)$('#sidebar nav a[aria-current]')?.focus()}
$('#menu').setAttribute('aria-controls','sidebar');$('#menu').setAttribute('aria-expanded','false');
$('#menu').onclick=()=>setNavOpen(!$('#sidebar').classList.contains('open'));
navBackdrop.onclick=()=>setNavOpen(false);
$('#sidebar').addEventListener('click',e=>{if(e.target.closest('a[href^="#"]')&&$('#sidebar').classList.contains('open'))setNavOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#sidebar').classList.contains('open')&&!document.querySelector('dialog[open]')){setNavOpen(false);$('#menu').focus()}});
const beforeRender=render;
render=function(){document.body.classList.remove('operation-open');beforeRender();groupedNav();};
// Cadastro de clientes também aparece nas consultas e nos backups.
config.customers.fields=customerSections.flatMap(x=>x[2]);
render();
