// Extended company editor. Existing records remain compatible with the original fields.
const companySections = [
  ['empresa','Empresa',[
    ['document','CNPJ','text',true],['legalName','Razão social','text',true],['name','Nome fantasia','text',true],['registrationDate','Data de cadastro','date'],
    ['stateRegistration','Inscrição estadual'],['substituteRegistration','IE de substituto tributário'],['municipalRegistration','Inscrição municipal'],['cnae','CNAE'],['suframa','SUFRAMA'],['status','Status','select',['Ativo','Inativo']]
  ]],
  ['endereco','Endereço e contato',[
    ['postalCode','CEP'],['street','Logradouro'],['number','Número'],['complement','Complemento'],['district','Bairro'],
    ['state','UF','select',['','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']],['city','Município'],
    ['phone','Telefone 1','tel'],['phone2','Telefone 2','tel'],['contact','Contato'],['contactPhone','Telefone do contato','tel'],['email','E-mail principal','email']
  ]],
  ['contador','Contador',[
    ['accountantName','Nome do contador'],['accountantPhone','Telefone do contador','tel'],['accountantCrc','CRC do contador'],['accountant','Escritório / contador vinculado'],['accountantEmail','E-mail do contador','email'],['accountantXml','Enviar XML ao contador automaticamente','checkbox']
  ]],
  ['fiscal','Fiscal e emissão',[
    ['rntrc','RNTRC'],['cotm','COTM'],['specialRegime','Regime Especial','select',['Não informado','Lucro Presumido','Lucro Real','Outro']],['creditPercentage','Percentual de crédito (%)','number'],['simpleTax','Simples Nacional','select',['Não informado','Sim','Não']],['taxRegime','Regime tributário CT-e','select',['Não informado','Simples Nacional','Regime normal','Outro']],
    ['timezone','Fuso horário','select',['America/Sao_Paulo','America/Manaus','America/Rio_Branco','America/Noronha']],['emissionType','Tipo de emissão','select',['Homologação (demonstração)']],['emissionStatus','Status de emissão','select',['Não configurado','Em configuração']],
    ['financialStatus','Status financeiro','select',['Normal','Pendente','Bloqueado']],['carrierType','Tipo do transportador','select',['ETC','TAC','CTC']],['taf','TAF'],['stateRegistryNumber','Nº de registro estadual'],['integrationCode','Código de integração'],
    ['recipientNfe','Utiliza NF-e destinada','checkbox'],['recipientBilling','Gerar cobrança de NF-e destinada','checkbox'],['cteSeriesInside','Série padrão CT-e dentro'],['cteSeriesOutside','Série padrão CT-e fora'],['mdfeSeries','Série padrão MDF-e']
  ]],
  ['certificado','Certificado',[
    ['certificateSeries','Série do certificado'],['certificateStart','Data inicial do certificado','date'],['certificateEnd','Data final do certificado','date'],['certificateA1','Certificado A1','select',['Não informado','Sim','Não']]
  ]],
  ['outros','E-mails e observações',[
    ['operationalEmails','E-mails operacionais (separados por ponto e vírgula)'],['operationalXml','Enviar XML operacional automaticamente','checkbox'],['administrativeEmails','E-mails administrativos (separados por ponto e vírgula)'],['administrativeXml','Enviar XML administrativo automaticamente','checkbox'],['adminCompany','Empresa administradora'],['notes','Observações','textarea'],['statusLog','Log de status / anotações','textarea']
  ]]
];
function companyField([key,label,type='text',options],record){
  const required=options===true;const value=record[key]??'';
  let control;
  if(type==='checkbox')return `<label class="check-field"><input type="checkbox" name="${key}" ${value===true?'checked':''}>${label}</label>`;
  if(type==='select')control=`<select name="${key}">${options.map(option=>`<option value="${esc(option)}" ${option===value?'selected':''}>${esc(option||'Selecione')}</option>`).join('')}</select>`;
  else if(type==='textarea')control=`<textarea name="${key}" rows="3" maxlength="2000">${esc(value)}</textarea>`;
  else control=`<input name="${key}" type="${type}" value="${esc(value)}" ${required?'required':''} maxlength="200" ${type==='number'?'min="0" max="100" step="0.01"':''}>`;
  return `<label class="${type==='textarea'?'wide-field':''}">${label}${required?' *':''}${control}</label>`;
}
const baseOpenForm=openForm;
openForm=function(id){
  $('#dialog').classList.toggle('company-dialog',route==='company');
  $('#form').noValidate=route==='company';
  if(route!=='company')return baseOpenForm(id);
  editing=id||null;
  const stored=db.company.find(record=>record.id===id)||{};
  const record={...stored,legalName:stored.legalName??stored.name??''};
  $('#modal-title').textContent=id?'Editar empresa':'Cadastrar empresa';$('#form-error').textContent='';
  $('#fields').innerHTML=`<p class="company-intro">Dados de demonstração. Campos com * são obrigatórios; os demais podem ser preenchidos aos poucos.</p>${companySections.map(([key,label,fields])=>`<section id="panel-${key}" aria-labelledby="heading-${key}" class="company-panel"><h3 id="heading-${key}">${label}</h3>${['fiscal','contador','outros'].includes(key)?'<p class="section-help">Opções demonstrativas: nenhuma emissão, cobrança ou envio de e-mail será realizado.</p>':''}${key==='empresa'?'<p class="section-help">Preenchimento manual. Consulta de CNPJ ainda não integrada.</p>':''}${key==='certificado'?'<div class="notice"><div><strong>Certificado apenas demonstrativo</strong><p>Não envie certificado real nem informe sua senha. A integração será feita em uma etapa futura.</p></div></div>':''}<div class="form-grid">${fields.map(field=>companyField(field,record)).join('')}${key==='certificado'?'<label>Senha do certificado<input type="password" disabled placeholder="Indisponível no protótipo" autocomplete="off"></label><div class="certificate-upload"><span>Arquivo do certificado</span><button type="button" class="button secondary" disabled>Importação indisponível</button></div>':''}</div></section>`).join('')}`;
  $('#dialog').showModal();
};
const baseSubmit=$('#form').onsubmit;
$('#form').onsubmit=function(event){
  if(route!=='company')return baseSubmit(event);
  event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));
  Object.keys(values).forEach(key=>values[key]=values[key].trim());
  companySections.forEach(([, ,fields])=>fields.forEach(([key,,type])=>{if(type==='checkbox')values[key]=form.elements.namedItem(key).checked}));
  const invalid=Array.from(form.elements).find(field=>field.willValidate&&(!field.validity.valid||(field.required&&!field.value.trim())));
  if(invalid){$('#form-error').textContent='Revise o campo destacado antes de salvar.';invalid.focus();invalid.reportValidity();return}
  if(values.certificateStart&&values.certificateEnd&&values.certificateEnd<values.certificateStart){$('#form-error').textContent='A data final do certificado deve ser igual ou posterior à data inicial.';form.elements.namedItem('certificateEnd').focus();return}
  if(editing){const index=db.company.findIndex(record=>record.id===editing);db.company[index]={...db.company[index],...values}}else db.company.push({id:crypto.randomUUID(),...values});
  const ok=save();$('#dialog').close();render();if(ok)toast('Cadastro da empresa salvo com sucesso.');
};
