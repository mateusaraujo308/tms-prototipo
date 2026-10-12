// Cadastro de usuários. A senha nunca fica no registro: vai direto para o banco pela função
// set_user_password, que grava apenas o hash (ver supabase/schema.sql).
if(!Array.isArray(db.users))db.users=[];
const userLevels=['Administrador','Gestor','Operador','Consulta'],userStatuses=['Ativo','Desativado'];
routes.push(['users','','Usuários']);
navGroups[0][2].push('users');
navIcons.users='<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="m17 11 2 2 4-4"/>';
config.users={title:'Usuários',single:'usuário',description:'Pessoas com acesso ao sistema, seus níveis de permissão e situação.',fields:[]};
const activeAdmins=except=>db.users.filter(u=>u.id!==except&&u.level==='Administrador'&&u.status==='Ativo').length;
const userBadge=s=>`<span class="badge ${s==='Ativo'?'':'gray'}">${esc(s||'—')}</span>`;
const formatPhone=v=>{const d=String(v||'').replace(/\D/g,'').slice(0,11);if(d.length<=2)return d;if(d.length<=6)return `(${d.slice(0,2)}) ${d.slice(2)}`;if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`};

const usersPrevRenderList=renderList;
renderList=function(){
 usersPrevRenderList();if(route!=='users')return;
 $('#search').insertAdjacentHTML('afterend',`<select id="filter" style="width:180px" aria-label="Filtrar situação"><option value="">Todas as situações</option>${userStatuses.map(v=>`<option ${filter===v?'selected':''}>${v}</option>`).join('')}</select>`);
 $('#filter').onchange=e=>{filter=e.target.value;records()};
};
const usersPrevRecords=records;
records=function(){
 if(route!=='users')return usersPrevRecords();
 const q=search.toLowerCase(),data=db.users.filter(u=>(!filter||u.status===filter)&&[u.name,u.email,u.phone,u.level].join(' ').toLowerCase().includes(q));
 $('#count').textContent=`${data.length} registro${data.length===1?'':'s'}`;
 $('#records').innerHTML=data.length?cteTable(['Usuário','Telefone','Nível','Situação','Opções'],data.map(u=>`<tr><td><strong>${esc(u.name)}</strong><small>${esc(u.email)}</small></td><td>${esc(u.phone||'—')}</td><td>${esc(u.level)}</td><td>${userBadge(u.status)}</td><td><button class="row-action" data-edit="${u.id}">Editar</button><button class="row-action danger" data-delete="${u.id}">Excluir</button></td></tr>`)):`<div class="empty">${search||filter?'Nenhum usuário encontrado com esses filtros.':'Nenhum usuário cadastrado. Use o botão acima para começar.'}</div>`;
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openForm(b.dataset.edit));
 document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>remove(b.dataset.delete));
};

const usersPrevOpen=openForm;
openForm=function(id){
 if(route!=='users')return usersPrevOpen(id);
 editing=id||null;const u=db.users.find(x=>x.id===id)||{level:'Operador',status:'Ativo'};
 $('#dialog').classList.remove('company-dialog');$('#form').noValidate=true;
 $('#modal-title').textContent=id?'Editar usuário':'Cadastrar usuário';$('#form-error').textContent='';
 const sel=(name,label,options)=>`<label>${label} *<select name="${name}">${options.map(o=>`<option ${u[name]===o?'selected':''}>${o}</option>`).join('')}</select></label>`;
 const pass=(name,label)=>`<label>${label}${id?'':' *'}<span class="password-field"><input name="${name}" type="password" minlength="8" maxlength="72" autocomplete="new-password" ${id?'placeholder="Deixe em branco para manter"':'required'}><button type="button" class="icon-action" data-toggle-password title="Mostrar senha" aria-label="Mostrar senha">${opIcon('eye')}</button></span></label>`;
 $('#fields').innerHTML=`<label>Nome *<input name="name" required maxlength="120" autocomplete="off" value="${esc(u.name||'')}"></label><label>E-mail *<input name="email" type="email" required maxlength="160" autocomplete="off" value="${esc(u.email||'')}"></label>${pass('password','Senha')}${pass('passwordConfirm','Confirmar senha')}<p class="section-help wide-field">${id?'Preencha a senha apenas se quiser trocá-la. ':''}Mínimo de 8 caracteres.</p><label>Telefone<input name="phone" type="tel" maxlength="15" inputmode="numeric" placeholder="(00) 00000-0000" value="${esc(u.phone||'')}"></label>${sel('level','Nível',userLevels)}${sel('status','Status',userStatuses)}`;
 $('#fields [name=phone]').oninput=e=>{e.target.value=formatPhone(e.target.value)};
 document.querySelectorAll('[data-toggle-password]').forEach(b=>b.onclick=()=>{const input=b.previousElementSibling,show=input.type==='password';input.type=show?'text':'password';b.title=b.ariaLabel=show?'Ocultar senha':'Mostrar senha'});
 $('#dialog').showModal();$('#fields [name=name]').focus();
};

const usersPrevSubmit=$('#form').onsubmit;
$('#form').onsubmit=async function(e){
 if(route!=='users')return usersPrevSubmit.call(this,e);
 e.preventDefault();const form=e.currentTarget,v=Object.fromEntries([...new FormData(form)].map(([k,x])=>[k,k.startsWith('password')?x:String(x).trim()]));
 const fail=(msg,field)=>{$('#form-error').textContent=msg;if(field)form.elements.namedItem(field).focus()};
 if(!v.name)return fail('Informe o nome.','name');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))return fail('Informe um e-mail válido.','email');
 v.email=v.email.toLowerCase();
 if(db.users.some(u=>u.id!==editing&&u.email===v.email))return fail('Já existe um usuário com este e-mail.','email');
 if(v.phone&&!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(v.phone))return fail('Informe o telefone com DDD.','phone');
 if(!editing||v.password||v.passwordConfirm){
  if(v.password.length<8)return fail('A senha precisa ter ao menos 8 caracteres.','password');
  if(v.password!==v.passwordConfirm)return fail('As senhas não conferem.','passwordConfirm');
 }
 const before=db.users.find(u=>u.id===editing);
 if(before?.level==='Administrador'&&before.status==='Ativo'&&(v.level!=='Administrador'||v.status!=='Ativo')&&!activeAdmins(editing))return fail('É preciso manter ao menos um administrador ativo.');
 const record={id:editing||crypto.randomUUID(),name:v.name,email:v.email,phone:v.phone,level:v.level,status:v.status,createdAt:before?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 const index=db.users.findIndex(u=>u.id===record.id);if(index<0)db.users.push(record);else db.users[index]=record;
 save();
 if(v.password){
  const submit=form.querySelector('[type=submit]');submit.disabled=true;
  try{await rotaSync.rpc('set_user_password',{p_user_id:record.id,p_password:v.password})}
  catch(err){submit.disabled=false;render();return toast('Usuário salvo, mas a senha não foi gravada: '+err.message)}
  submit.disabled=false;
 }
 $('#dialog').close();render();toast(editing?'Usuário atualizado.':'Usuário cadastrado.');
};

const usersPrevRemove=remove;
remove=function(id){
 if(route==='users'){const u=db.users.find(x=>x.id===id);if(u?.level==='Administrador'&&u.status==='Ativo'&&!activeAdmins(id))return toast('Não é possível excluir o último administrador ativo.')}
 usersPrevRemove(id);
};
// O formulário de cadastro limpa os campos de senha ao fechar.
$('#dialog').addEventListener('close',()=>document.querySelectorAll('#fields input[type=password],#fields [name^=password]').forEach(x=>x.value=''));
// O menu já foi desenhado antes deste módulo carregar; abrir direto em #users exige novo render.
if(location.hash==='#users')render();else groupedNav();
