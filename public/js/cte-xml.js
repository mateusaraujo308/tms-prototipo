// XML do CT-e no layout 4.00 (modelo 57, modal rodoviário), sem assinatura digital.
// Gera ambiente de homologação (tpAmb=2). Assinatura e autorização exigem certificado A1 e servidor.
const UF_CODES={RO:11,AC:12,AM:13,RR:14,PA:15,AP:16,TO:17,MA:21,PI:22,CE:23,RN:24,PB:25,PE:26,AL:27,SE:28,BA:29,MG:31,ES:32,RJ:33,SP:35,PR:41,SC:42,RS:43,MS:50,MT:51,GO:52,DF:53};
// URLs de consulta por QR Code em homologação, por SEFAZ autorizadora. Conferir no portal do CT-e antes de produção.
const CTE_QRCODE_URLS={SP:'https://homologacao.nfe.fazenda.sp.gov.br/CTeConsulta/qrCode',MG:'https://hcte.fazenda.mg.gov.br/portalcte/sistema/qrcode.xhtml',PR:'http://www.fazenda.pr.gov.br/cte/qrcode',MT:'https://homologacao.sefaz.mt.gov.br/cte/qrcode',MS:'http://www.dfe.ms.gov.br/cte/qrcode',default:'https://dfe-portal.svrs.rs.gov.br/cte/qrCode'};
const CTE_TIMEZONES={'America/Sao_Paulo':'-03:00','America/Manaus':'-04:00','America/Rio_Branco':'-05:00','America/Noronha':'-02:00'};
const digits=v=>String(v??'').replace(/\D/g,'');
const xmlText=v=>String(v??'').replace(/\s+/g,' ').trim().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const xt=(name,value,max)=>{let v=String(value??'').replace(/\s+/g,' ').trim();if(max)v=v.slice(0,max);return v===''?'':`<${name}>${xmlText(v)}</${name}>`};
const dec=(v,n=2)=>Number(v||0).toFixed(n);
// Módulo 11 da chave de acesso; aceita o CNPJ alfanumérico (valor do caractere = código ASCII − 48).
function mod11(base){let sum=0,w=2;for(let i=base.length-1;i>=0;i--){sum+=(base.charCodeAt(i)-48)*w;w=w===9?2:w+1}const r=sum%11;return r<2?0:11-r}
function validCnpj(v){const c=String(v||'').toUpperCase().replace(/[^0-9A-Z]/g,'');if(!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)||/^(\w)\1+$/.test(c))return false;const dv=n=>{let sum=0;const w=n===12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];for(let i=0;i<n;i++)sum+=(c.charCodeAt(i)-48)*w[i];const r=sum%11;return r<2?0:11-r};return dv(12)===Number(c[12])&&dv(13)===Number(c[13])}
function validCpf(v){const c=digits(v);if(c.length!==11||/^(\d)\1+$/.test(c))return false;const dv=n=>{let sum=0;for(let i=0;i<n;i++)sum+=Number(c[i])*(n+1-i);const r=sum*10%11;return r===10?0:r};return dv(9)===Number(c[9])&&dv(10)===Number(c[10])}
const validKey=k=>/^\d{44}$/.test(k)&&mod11(k.slice(0,43))===Number(k[43]);

// Municípios do IBGE, carregados sob demanda por UF.
const ibgeCache={};
const normCity=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/['’`-]/g,' ').replace(/\s+/g,' ').trim();
async function ibgeCity(uf,name){
 if(!UF_CODES[uf]||!String(name||'').trim())return null;
 ibgeCache[uf]??=fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`).then(r=>{if(!r.ok)throw Error();return r.json()}).catch(e=>{delete ibgeCache[uf];throw Error('Não foi possível consultar os municípios do IBGE. Verifique a conexão.')});
 const list=await ibgeCache[uf],code=digits(name);
 const found=code.length===7?list.find(m=>String(m.id)===code):list.find(m=>normCity(m.nome)===normCity(name));
 return found?{code:String(found.id),name:found.nome}:null;
}

function cteXmlCompany(x){return db.company.find(c=>c.id===x.company)}
function participant(x,prefix){const v=k=>x[prefix+k]??'';return {name:x[prefix]||'',doc:v('Document'),ie:v('Ie'),fant:v('TradeName'),phone:v('Phone'),street:v('Street'),number:v('Number'),complement:v('Complement'),district:v('District'),city:v('City'),state:v('State'),cep:v('PostalCode'),email:v('Email'),foreign:x[prefix+'Foreign']===true}}
function cteCities(x){
 const c=cteXmlCompany(x)||{},list=[['emit','Município da transportadora','Cadastro da empresa',c.state,c.city],['env','Localidade de emissão','Dados',x.issueState||c.state,x.issueCity||c.city],['ini','Início da prestação','Dados',x.originState,x.originCity],['fim','Término da prestação','Dados',x.destinationState,x.destinationCity],['sender','Cidade do remetente','Remetente',x.senderState,x.senderCity],['recipient','Cidade do destinatário','Destinatário',x.recipientState,x.recipientCity]];
 if(x.expeditor)list.push(['expeditor','Cidade do expedidor','Outros',x.expeditorState,x.expeditorCity]);
 if(x.receiver)list.push(['receiver','Cidade do recebedor','Outros',x.receiverState,x.receiverCity]);
 if(x.payer==='Outro')list.push(['otherPayer','Cidade do outro tomador','Outros',x.otherPayerState,x.otherPayerCity]);
 return list;
}
const CTE_TOMA={Remetente:'0',Destinatário:'3',Outro:'4'};
function cteValues(x){const prev=draft;draft=x;try{const t=serviceTotals();const rate=Number(x.icmsRate||0),red=Number(x.icmsReduction||0);const base=x.icmsBase!=null&&x.icmsBase!==''?Number(x.icmsBase):t.gross*(1-red/100);return {total:Number(x.serviceValue||t.total||0),receivable:Number(x.receivableValue||x.serviceValue||t.total||0),base,rate,red,tax:base*rate/100}}finally{draft=prev}}

// Pendências que impedem gerar um XML aceito pelo schema. Cada item: [mensagem, onde corrigir].
function cteXmlIssues(x){
 const issues=[],add=(m,w)=>issues.push([m,w]),c=cteXmlCompany(x);
 if(!c)add('Selecione a transportadora','Dados');
 else{
  if(!validCnpj(c.document))add('CNPJ da transportadora inválido','Cadastro da empresa');
  if(!digits(c.stateRegistration))add('Inscrição estadual da transportadora','Cadastro da empresa');
  if(!(c.legalName||c.name))add('Razão social da transportadora','Cadastro da empresa');
  if(!UF_CODES[c.state])add('UF da transportadora','Cadastro da empresa');
  if(!c.street||!c.district)add('Logradouro e bairro da transportadora','Cadastro da empresa');
  if(!/^\d{8}$/.test(digits(x.rntrc||c.rntrc)))add('RNTRC com 8 dígitos (CT-e ou cadastro da empresa)','Informações da carga › Rodoviário');
 }
 if(x.model&&x.model!=='57')add('Somente o modelo 57 é suportado','Dados');
 if(x.cteType&&!/^normal$/i.test(x.cteType))add('Somente CT-e do tipo Normal é suportado','Dados');
 if(x.globalized==='Sim')add('CT-e globalizado ainda não é suportado','Dados');
 const cfop=digits(x.cfop);
 if(!/^[567]\d{3}$/.test(cfop))add('CFOP com 4 dígitos (5xxx, 6xxx ou 7xxx)','Dados');
 else if(x.originState&&x.destinationState&&cfop[0]!=='7'&&cfop[0]!==(x.originState===x.destinationState?'5':'6'))add(`CFOP ${cfop} incompatível: prestação ${x.originState===x.destinationState?'dentro do estado usa 5xxx':'entre estados usa 6xxx'}`,'Dados');
 if(!String(x.nature||'').trim())add('Natureza da operação','Dados');
 if(!/^\d{1,9}$/.test(digits(x.number))||!Number(digits(x.number)))add('Número do CT-e','Dados');
 if(digits(x.series)===''||Number(digits(x.series))>999)add('Série do CT-e (0 a 999)','Dados');
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x.issuedAt||''))add('Data e hora de emissão','Dados');
 if(!CTE_TOMA[x.payer])add('Tomador do serviço','Dados');
 const parts=[['sender','Remetente','Remetente'],['recipient','Destinatário','Destinatário']];
 if(x.payer==='Outro')parts.push(['otherPayer','Outro tomador','Outros']);
 if(x.expeditor)parts.push(['expeditor','Expedidor','Outros']);
 if(x.receiver)parts.push(['receiver','Recebedor','Outros']);
 for(const [p,label,where] of parts){const d=participant(x,p);
  if(d.foreign){add(`${label}: participante do exterior ainda não é suportado`,where);continue}
  if(!d.name)add(`${label}: razão social`,where);
  const doc=digits(d.doc);if(!(doc.length===11?validCpf(doc):validCnpj(d.doc)))add(`${label}: CPF ou CNPJ válido`,where);
  if(!d.street||!d.district)add(`${label}: logradouro e bairro`,where);
 }
 const v=cteValues(x);
 if(!(v.total>0))add('Valor total da prestação maior que zero','Serviços e Impostos');
 if(!x.icmsCst)add('Situação tributária do ICMS','Serviços e Impostos');
 else if(/^(00|20|90)/.test(x.icmsCst)&&!(v.rate>0))add('Alíquota do ICMS','Serviços e Impostos');
 if(/^20/.test(x.icmsCst)&&!(v.red>0))add('Percentual de redução da base do ICMS','Serviços e Impostos');
 if(!String(x.product||'').trim())add('Produto predominante','Informações da carga');
 if(!(x.cargoQuantities||[]).some(q=>Number(q.quantity)>0)&&!(Number(x.weight)>0))add('Ao menos uma quantidade da carga (ex.: peso em KG)','Informações da carga');
 const nfes=(x.documents||[]).filter(d=>(d.docType||'NF-e')==='NF-e');
 if(!nfes.length)add('Ao menos uma NF-e transportada','Remetente › Documentos');
 nfes.forEach(d=>{if(!validKey(digits(d.docKey)))add(`Chave da NF-e ${d.docNumber||d.docKey||''} inválida (44 dígitos)`,'Remetente › Documentos')});
 return issues;
}

function cteAccessKey(x,c){
 const dt=x.issuedAt,cnpj=String(c.document).toUpperCase().replace(/[^0-9A-Z]/g,''),nCT=digits(x.number).padStart(9,'0');
 let h=0;for(const ch of String(x.id))h=(h*31+ch.charCodeAt(0))>>>0;let cCT=String(h%100000000).padStart(8,'0');if(cCT===nCT.slice(1))cCT=String((h+1)%100000000).padStart(8,'0');
 const base=`${UF_CODES[c.state]}${dt.slice(2,4)}${dt.slice(5,7)}${cnpj}57${digits(x.series).padStart(3,'0')}${nCT}1${cCT}`;
 return {key:base+mod11(base),cCT,cDV:String(mod11(base))};
}
function cteDoc(d){const doc=digits(d.doc);return doc.length===11?xt('CPF',doc):xt('CNPJ',String(d.doc).toUpperCase().replace(/[^0-9A-Z]/g,''))}
function cteIe(v){return /isento/i.test(v||'')?'<IE>ISENTO</IE>':xt('IE',digits(v))}
function cteEnder(tag,d,city){return `<${tag}>${xt('xLgr',d.street,255)}${xt('nro',d.number||'S/N',60)}${xt('xCpl',d.complement,60)}${xt('xBairro',d.district,60)}<cMun>${city.code}</cMun>${xt('xMun',city.name)}${xt('CEP',digits(d.cep).length===8?digits(d.cep):'')}<UF>${d.state}</UF><cPais>1058</cPais><xPais>BRASIL</xPais></${tag}>`}
const cteFone=v=>{const f=digits(v);return f.length>=7&&f.length<=12?`<fone>${f}</fone>`:''};
function cteParty(tag,enderTag,d,city,fant){return `<${tag}>${cteDoc(d)}${cteIe(d.ie)}${xt('xNome',d.name,60)}${fant?xt('xFant',d.fant,60):''}${cteFone(d.phone)}${cteEnder(enderTag,d,city)}${xt('email',d.email,60)}</${tag}>`}
const CTE_UNITS=[[/^(m3|m³|metro)/i,'00'],[/^(kg|quilo)/i,'01'],[/^(t|ton)/i,'02'],[/^(un|und|unidade|vol|cx|caixa|pc)/i,'03'],[/^(l|lt|litro)/i,'04'],[/^mmbtu/i,'05']];
function cteIcms(x,v){
 if(x.icmsCst==='Simples Nacional')return '<ICMSSN><CST>90</CST><indSN>1</indSN></ICMSSN>';
 const cst=x.icmsCst.slice(0,2),b=dec(v.base),p=dec(v.rate),i=dec(v.tax);
 if(cst==='00')return `<ICMS00><CST>00</CST><vBC>${b}</vBC><pICMS>${p}</pICMS><vICMS>${i}</vICMS></ICMS00>`;
 if(cst==='20')return `<ICMS20><CST>20</CST><pRedBC>${dec(v.red)}</pRedBC><vBC>${b}</vBC><pICMS>${p}</pICMS><vICMS>${i}</vICMS></ICMS20>`;
 if(cst==='40'||cst==='41')return `<ICMS45><CST>${cst}</CST></ICMS45>`;
 if(cst==='60')return `<ICMS60><CST>60</CST><vBCSTRet>${b}</vBCSTRet><vICMSSTRet>${i}</vICMSSTRet><pICMSSTRet>${p}</pICMSSTRet></ICMS60>`;
 return `<ICMS90><CST>90</CST>${v.red>0?`<pRedBC>${dec(v.red)}</pRedBC>`:''}<vBC>${b}</vBC><pICMS>${p}</pICMS><vICMS>${i}</vICMS></ICMS90>`;
}

async function buildCteXml(x){
 const issues=cteXmlIssues(x);
 const cityDefs=cteCities(x),cities={};
 await Promise.all(cityDefs.map(async([id,label,where,uf,name])=>{
  if(!UF_CODES[uf]||!String(name||'').trim())return issues.push([`${label}: município e UF`,where]);
  const city=await ibgeCity(uf,name);if(!city)return issues.push([`${label}: “${name}” não encontrado no IBGE para ${uf}`,where]);
  cities[id]=city;
 }));
 if(issues.length)return {issues};
 const c=cteXmlCompany(x),{key,cCT,cDV}=cteAccessKey(x,c),v=cteValues(x),tz=CTE_TIMEZONES[c.timezone]||'-03:00';
 const toma=CTE_TOMA[x.payer],tomaParty=participant(x,toma==='0'?'sender':toma==='3'?'recipient':'otherPayer');
 const indIEToma=/^[129]/.test(x.payerIeIndicator||'')?x.payerIeIndicator[0]:/isento/i.test(tomaParty.ie)?'2':digits(tomaParty.ie)?'1':'9';
 const crt=c.taxRegime==='Simples Nacional'||c.simpleTax==='Sim'?'1':'3';
 const tpServ={normal:'0','subcontratação':'1',redespacho:'2','redespacho intermediário':'3'}[String(x.service||'normal').toLowerCase()]||'0';
 const ide=`<ide><cUF>${UF_CODES[c.state]}</cUF><cCT>${cCT}</cCT><CFOP>${digits(x.cfop)}</CFOP>${xt('natOp',x.nature,60)}<mod>57</mod><serie>${Number(digits(x.series))}</serie><nCT>${Number(digits(x.number))}</nCT><dhEmi>${x.issuedAt.slice(0,16)}:00${tz}</dhEmi><tpImp>${x.printLayout==='Paisagem'?'2':'1'}</tpImp><tpEmis>1</tpEmis><cDV>${cDV}</cDV><tpAmb>2</tpAmb><tpCTe>0</tpCTe><procEmi>0</procEmi><verProc>Rota TMS 1.0</verProc><cMunEnv>${cities.env.code}</cMunEnv>${xt('xMunEnv',cities.env.name)}<UFEnv>${x.issueState||c.state}</UFEnv><modal>01</modal><tpServ>${tpServ}</tpServ><cMunIni>${cities.ini.code}</cMunIni>${xt('xMunIni',cities.ini.name)}<UFIni>${x.originState}</UFIni><cMunFim>${cities.fim.code}</cMunFim>${xt('xMunFim',cities.fim.name)}<UFFim>${x.destinationState}</UFFim><retira>${x.receiverPickup?'0':'1'}</retira>${x.receiverPickup?xt('xDetRetira',x.pickupDetails,160):''}<indIEToma>${indIEToma}</indIEToma>${toma==='4'?`<toma4><toma>4</toma>${cteDoc(tomaParty)}${cteIe(tomaParty.ie)}${xt('xNome',tomaParty.name,60)}${xt('xFant',tomaParty.fant,60)}${cteFone(tomaParty.phone)}${cteEnder('enderToma',tomaParty,cities.otherPayer)}${xt('email',tomaParty.email,60)}</toma4>`:`<toma3><toma>${toma}</toma></toma3>`}</ide>`;
 const obs=(list,tag)=>(list||[]).filter(o=>o.description).slice(0,10).map(o=>`<${tag} xCampo="${xmlText(String(o.identifier||'Obs').slice(0,20))}">${xt('xTexto',o.description,160)}</${tag}>`).join('');
 const entrega=x.deliveryForecast?`<Entrega><comData><tpPer>2</tpPer><dProg>${x.deliveryForecast}</dProg></comData><semHora><tpHor>0</tpHor></semHora></Entrega>`:'';
 const complBody=xt('xCaracAd',x.transportCharacteristics,15)+xt('xCaracSer',x.serviceCharacteristics,30)+entrega+xt('xObs',x.operationNotes,2000)+obs(x.taxpayerNotes,'ObsCont')+obs(x.fiscalNotes,'ObsFisco');
 const emit=`<emit><CNPJ>${String(c.document).toUpperCase().replace(/[^0-9A-Z]/g,'')}</CNPJ>${xt('IE',digits(c.stateRegistration))}${xt('xNome',c.legalName||c.name,60)}${xt('xFant',c.name,60)}<enderEmit>${xt('xLgr',c.street,60)}${xt('nro',c.number||'S/N',60)}${xt('xCpl',c.complement,60)}${xt('xBairro',c.district,60)}<cMun>${cities.emit.code}</cMun>${xt('xMun',cities.emit.name)}${xt('CEP',digits(c.postalCode).length===8?digits(c.postalCode):'')}<UF>${c.state}</UF>${cteFone(c.phone)}</enderEmit><CRT>${crt}</CRT></emit>`;
 const comps=(x.serviceComponents||[]).length?x.serviceComponents.map(p=>[p.description,p.value]):[['FRETE VALOR',x.freight],['OUTROS',x.otherCharges]];
 const vPrest=`<vPrest><vTPrest>${dec(v.total)}</vTPrest><vRec>${dec(v.receivable)}</vRec>${comps.filter(([n,val])=>n&&Number(val)>0).map(([n,val])=>`<Comp>${xt('xNome',n,15)}<vComp>${dec(val)}</vComp></Comp>`).join('')}</vPrest>`;
 const quantities=(x.cargoQuantities||[]).filter(q=>Number(q.quantity)>0).map(q=>`<infQ><cUnid>${(CTE_UNITS.find(([r])=>r.test(String(q.unit||'').trim()))||[,'01'])[1]}</cUnid>${xt('tpMed',q.measureType||q.unit||'PESO BRUTO',20)}<qCarga>${dec(q.quantity,4)}</qCarga></infQ>`);
 if(!quantities.length)quantities.push(`<infQ><cUnid>01</cUnid><tpMed>PESO BRUTO</tpMed><qCarga>${dec(x.weight,4)}</qCarga></infQ>`);
 const infCarga=`<infCarga>${Number(x.cargoValue)>0?`<vCarga>${dec(x.cargoValue)}</vCarga>`:''}${xt('proPred',x.product,60)}${xt('xOutCat',x.cargoCharacteristics,30)}${quantities.join('')}${Number(x.insuredCargoValue)>0?`<vCargaAverb>${dec(x.insuredCargoValue)}</vCargaAverb>`:''}</infCarga>`;
 const infDoc=`<infDoc>${x.documents.filter(d=>(d.docType||'NF-e')==='NF-e').map(d=>`<infNFe><chave>${digits(d.docKey)}</chave>${xt('PIN',digits(d.docPin),9)}</infNFe>`).join('')}</infDoc>`;
 const bills=(x.billing||[]).filter(b=>b.number&&Number(b.value)>0),billTotal=bills.reduce((s,b)=>s+Number(b.value),0);
 const cobr=bills.length?`<cobr><fat>${xt('nFat',bills[0].number,60)}<vOrig>${dec(billTotal)}</vOrig><vLiq>${dec(billTotal)}</vLiq></fat>${bills.map(b=>`<dup>${xt('nDup',b.number,60)}${xt('dVenc',b.due)}<vDup>${dec(b.value)}</vDup></dup>`).join('')}</cobr>`:'';
 const parties=cteParty('rem','enderReme',participant(x,'sender'),cities.sender,true)+(x.expeditor?cteParty('exped','enderExped',participant(x,'expeditor'),cities.expeditor):'')+(x.receiver?cteParty('receb','enderReceb',participant(x,'receiver'),cities.receiver):'')+cteParty('dest','enderDest',participant(x,'recipient'),cities.recipient);
 const qr=`${CTE_QRCODE_URLS[c.state]||CTE_QRCODE_URLS.default}?chCTe=${key}&tpAmb=2`;
 const xml=`<?xml version="1.0" encoding="UTF-8"?><CTe xmlns="http://www.portalfiscal.inf.br/cte"><infCte versao="4.00" Id="CTe${key}">${ide}${complBody?`<compl>${complBody}</compl>`:''}${emit}${parties}${vPrest}<imp><ICMS>${cteIcms(x,v)}</ICMS></imp><infCTeNorm>${infCarga}${infDoc}<infModal versaoModal="4.00"><rodo><RNTRC>${digits(x.rntrc||c.rntrc)}</RNTRC></rodo></infModal>${cobr}</infCTeNorm></infCte><infCTeSupl><qrCodCTe>${xmlText(qr)}</qrCodCTe></infCTeSupl></CTe>`;
 return {xml,key};
}

function cteIssuesHtml(issues){const groups={};issues.forEach(([m,w])=>(groups[w]??=[]).push(m));return Object.entries(groups).map(([w,ms])=>`<div class="xml-issue-group"><strong>${esc(w)}</strong><ul>${ms.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>`).join('')}
async function generateCteXml(x){
 toast('Validando dados e consultando municípios do IBGE…');
 let result;try{result=await buildCteXml(x)}catch(e){return toast(e.message)}
 if(result.issues)return popup('Pendências para gerar o XML',`<p>Corrija os itens abaixo para gerar o XML no layout do CT-e 4.00:</p>${cteIssuesHtml(result.issues)}<div class="modal-actions"><button class="button" id="xml-issues-ok">Entendi</button></div>`,()=>{$('#xml-issues-ok').onclick=()=>workflowDialog.close()});
 downloadFile(`CTe${result.key}.xml`,result.xml,'application/xml');
 x.cteKey=result.key;x.xmlGeneratedAt=new Date().toISOString();if(save())toast('XML gerado em homologação, sem assinatura digital.');
 if(route==='cte'&&!document.body.classList.contains('operation-open'))emissionList();
}
const xmlPrevAction=operationAction;
operationAction=function(x,kind,action){if(action==='xml'&&kind==='cte')return generateCteXml(x);return xmlPrevAction(x,kind,action)};

// Datas das etapas para a linha do tempo.
const xmlPrevPersist=persistDraft;
persistDraft=function(reviewed){if(draft&&route==='cte'){draft.createdAt??=new Date().toISOString();if(reviewed)draft.reviewedAt=new Date().toISOString()}return xmlPrevPersist(reviewed)};

const fmtDate=d=>d?new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
function cteTimelineSteps(x){
 const events=x.simulationEvents||[],ev=a=>events.filter(e=>e.action===a).pop();
 const reviewed=x.status&&x.status!=='Rascunho',issued=['Emissão simulada','Cancelamento simulado'].includes(x.status),cancelled=x.status==='Cancelamento simulado';
 const xmlCurrent=x.xmlGeneratedAt&&(!x.updatedAt||x.xmlGeneratedAt>=x.updatedAt);
 const mdfe=(db.mdfeDrafts||[]).find(m=>(m.linkedCtes||[]).includes(x.id)||(m.documents||[]).some(d=>d.cteId===x.id));
 const steps=[
  {label:'Rascunho criado',done:true,date:x.createdAt||x.issuedAt},
  {label:'Revisão concluída',done:reviewed,date:x.reviewedAt,todo:'Conclua na aba Revisão'},
  {label:'XML gerado',done:!!xmlCurrent,date:xmlCurrent&&x.xmlGeneratedAt,todo:x.xmlGeneratedAt?'Dados alterados: gere o XML novamente':'Menu ⋯ › Baixar XML na lista'},
  {label:'Autorizado pela SEFAZ',done:issued,date:ev('emit')?.date,todo:'Requer certificado A1 e envio à SEFAZ'},
  {label:'Incluído em MDF-e',done:!!mdfe,date:mdfe&&mdfe.updatedAt,note:mdfe?mdfe.reference:'',todo:'Vincule em Emissão de MDF-e'}
 ];
 if(cancelled){steps.forEach(s=>{if(!s.done)s.skipped=true});steps.push({label:'Cancelado',done:true,error:true,date:ev('cancel')?.date,note:ev('cancel')?.reason})}
 const current=steps.findIndex(s=>!s.done&&!s.skipped);if(current>=0)steps[current].current=true;
 return steps;
}
function cteTimeline(x){
 const steps=cteTimelineSteps(x);
 return `<ol class="cte-timeline" aria-label="Etapas do CT-e">${steps.map(s=>{const state=s.error?'error':s.done?'done':s.current?'current':s.skipped?'skipped':'todo';const label={done:'concluída',current:'próxima etapa',todo:'pendente',skipped:'não realizada',error:'concluída'}[state];return `<li class="tl-step tl-${state}" ${s.current?'aria-current="step"':''}><span class="tl-dot" aria-hidden="true">${s.error?'✕':s.done?'✓':''}</span><div class="tl-body"><strong>${esc(s.label)}</strong><span class="sr-only"> (${label})</span><small>${esc(s.done?[fmtDate(s.date),s.note].filter(Boolean).join(' • '):s.skipped?'Não realizada':s.todo||'')}</small></div></li>`}).join('')}</ol>`;
}
const xmlPrevRender=cteRender;
cteRender=function(){xmlPrevRender();const ctx=document.querySelector('.cte-context');if(ctx&&route==='cte')ctx.insertAdjacentHTML('afterend',cteTimeline(draft))};

// Pendências do XML também aparecem na aba Revisão.
const xmlPrevReview=cteReview;
cteReview=function(){xmlPrevReview();const issues=cteXmlIssues(draft);$('#cte-finish').insertAdjacentHTML('beforebegin',`<div class="review-box"><h3>XML no layout SEFAZ (CT-e 4.00)</h3>${issues.length?`<p class="section-help">Para gerar o XML, ainda falta:</p>${cteIssuesHtml(issues)}`:'<p class="badge">Pronto para gerar o XML</p>'}<p class="section-help">Os municípios são conferidos no IBGE na hora de gerar. Depois de concluir a revisão, baixe o XML pelo menu ⋯ da lista. O arquivo sai em homologação e sem assinatura digital.</p></div>`)};
