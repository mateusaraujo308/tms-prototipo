// Central operacional de integrações. Consulta apenas o status do servidor de loopback.
routes.push(['integrations', '◈', 'Integrações']);
navIcons.integrations = '<path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/><path d="M3 12h2m14 0h2"/>';

const renderBeforeIntegrations = render;
render = function () {
  renderBeforeIntegrations();
  if (route === 'integrations') renderIntegrations();
};

function integrationPill(text, state = 'pending') {
  return `<span class="integration-pill integration-${state}"><i aria-hidden="true"></i>${esc(text)}</span>`;
}

function renderIntegrations() {
  $('#main').innerHTML = `<div class="integration-page">
    <section class="integration-hero">
      <div class="integration-hero-copy">
        <span class="integration-kicker">CONTROLE DE CONEXÕES</span>
        <div class="integration-title-row"><h1>Integrações</h1><span class="environment-tag">HOMOLOGAÇÃO</span></div>
        <p>Veja o que já está preparado, o que falta configurar e quais passos continuam bloqueados antes de qualquer teste fiscal.</p>
      </div>
      <button class="button integration-refresh" id="integration-refresh" type="button"><span aria-hidden="true">↻</span> Atualizar diagnóstico</button>
    </section>

    <div id="integration-runtime-status" class="integration-runtime" role="status" aria-live="polite">
      <span class="integration-runtime-dot"></span><span>Conferindo apenas a API local…</span>
    </div>
    ${window.ROTA_READONLY_OFFLINE ? `<div class="integration-safety integration-security" role="alert"><span aria-hidden="true">!</span><div><strong>Banco indisponível — alterações não serão salvas.</strong><p>${esc(window.ROTA_DB_CONNECTION_ERROR || 'A conexão com o Supabase falhou.')} A central técnica continua disponível porque o diagnóstico é local e somente leitura.</p></div></div>` : ''}

    <div class="integration-grid">
      <section class="panel integration-card integration-card-sefaz">
        <div class="integration-card-head"><div class="integration-brand-mark" aria-hidden="true">S</div><div><span class="integration-eyebrow">DOCUMENTOS FISCAIS</span><h2>SEFAZ</h2></div>${integrationPill('Sem transmissão')}</div>
        <p>O CT-e pode gerar uma estrutura XML preliminar em <code>tpAmb=2</code>. A autorização real ainda não está habilitada. O MDF-e XML e a validação XSD vigente permanecem pendentes.</p>
        <div class="integration-checklist">
          <div><span class="integration-check done">1</span><span><strong>Preparação do CT-e</strong><small>Gerador local disponível; XML sem assinatura.</small></span>${integrationPill('Parcial', 'info')}</div>
          <div><span class="integration-check">2</span><span><strong>Validação XSD atual</strong><small>Pacote oficial da revisão corrente não está conectado.</small></span>${integrationPill('Pendente')}</div>
          <div><span class="integration-check">3</span><span><strong>Certificado e assinatura</strong><small>Certificado A1 ainda não configurado no backend.</small></span>${integrationPill('Pendente')}</div>
          <div><span class="integration-check">4</span><span><strong>Web Service da UF</strong><small>UF, credenciamento e endpoints precisam ser confirmados.</small></span>${integrationPill('Bloqueado', 'blocked')}</div>
        </div>
        <a class="integration-text-link" href="https://dfe-portal.svrs.rs.gov.br/Cte/Documentos" target="_blank" rel="noopener noreferrer">Documentação CT-e oficial <span aria-hidden="true">↗</span></a>
        <a class="integration-text-link" href="https://dfe-portal.svrs.rs.gov.br/mdfe/Documentos" target="_blank" rel="noopener noreferrer">Documentação MDF-e oficial <span aria-hidden="true">↗</span></a>
      </section>

      <section class="panel integration-card integration-card-repom">
        <div class="integration-card-head"><div class="integration-brand-mark repom-mark" aria-hidden="true">R</div><div><span class="integration-eyebrow">PAGAMENTO ELETRÔNICO DE FRETE</span><h2>Repom Frete</h2></div>${integrationPill('QA identificado', 'info')}</div>
        <p>Existe documentação pública para a API Repom Frete 3.0 no ambiente QA. O acesso depende das credenciais, do parceiro e das permissões da sua conta Repom.</p>
        <div class="integration-facts">
          <div><span>Ambiente documentado</span><strong>QA · API v3</strong></div>
          <div><span>Autenticação descrita</span><strong>Token Bearer</strong></div>
          <div><span>Chamada enviada</span><strong id="repom-call-state">Não</strong></div>
          <div><span>Operações de escrita</span><strong>Desativadas</strong></div>
        </div>
        <p class="integration-callout"><strong>Segurança:</strong> nenhum usuário, senha, token ou código de parceiro foi configurado no navegador. Esta tela não chama a Repom.</p>
        <a class="integration-text-link" href="https://qa.repom.com.br/Repom.Frete.WebAPI/HelpApi/index" target="_blank" rel="noopener noreferrer">Abrir Swagger Repom QA <span aria-hidden="true">↗</span></a>
      </section>
    </div>

    <section class="panel integration-next">
      <div class="integration-next-head"><div><span class="integration-eyebrow">PRÓXIMAS ETAPAS TÉCNICAS</span><h2>O caminho até um teste controlado</h2></div><span class="integration-lock" aria-hidden="true">▣</span></div>
      <div class="integration-roadmap">
        <article><span>01</span><h3>Empresa e UF</h3><p>Confirmar CNPJ emitente, inscrição estadual, UF autorizadora e credenciamento de homologação.</p></article>
        <article><span>02</span><h3>Validação fiscal</h3><p>Aplicar schemas e regras oficiais vigentes; o layout-base sozinho não garante aceitação.</p></article>
        <article><span>03</span><h3>Serviço privado</h3><p>Hospedar o backend fora do GitHub Pages, com certificado e segredos fora dos arquivos públicos.</p></article>
        <article><span>04</span><h3>Testes autorizados</h3><p>Validar primeiro em QA/homologação, com dados de teste e autorização específica para cada chamada.</p></article>
      </div>
    </section>

    <div class="integration-safety" role="note"><span aria-hidden="true">!</span><div><strong>Este ambiente não transmite documentos nem altera operações externas.</strong><p>Os status “simulados” são registros locais. Não representam protocolo, autorização da SEFAZ, CIOT registrado ou cancelamento efetuado.</p></div></div>
    <div class="integration-safety integration-security" role="note"><span aria-hidden="true">!</span><div><strong>Não use este protótipo com dados reais de clientes.</strong><p>O banco atual é compartilhado entre visitantes e ainda não aplica isolamento por empresa/usuário. Antes de abrir o acesso a clientes, implemente autenticação, permissões e políticas RLS por organização.</p></div></div>
    <p class="integration-doc-link"><a href="https://github.com/mateusaraujo308/tms-prototipo/blob/feature/homologacao-sefaz-repom/docs/INTEGRACAO-SEFAZ-REPOM.md" target="_blank" rel="noopener noreferrer">Ler requisitos, limitações e fontes técnicas deste branch <span aria-hidden="true">↗</span></a></p>
  </div>`;
  $('#integration-refresh').onclick = refreshIntegrationStatus;
  refreshIntegrationStatus();
}

async function refreshIntegrationStatus() {
  const box = $('#integration-runtime-status');
  if (!box) return;
  box.innerHTML = '<span class="integration-runtime-dot"></span><span>Conferindo apenas a API local…</span>';
  try {
    const response = await fetch('/api/integrations/status', { method: 'GET', cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('API local indisponível');
    const status = await response.json();
    const uf = status.sefaz.issuerUfConfigured ? `UF ${esc(status.sefaz.issuerUf)}` : 'UF não configurada';
    const certificate = status.sefaz.certificateReady ? 'certificado detectado' : 'certificado não configurado';
    const repom = status.repom.credentialsConfigured ? 'credenciais QA detectadas' : 'credenciais QA não configuradas';
    box.innerHTML = `<span class="integration-runtime-dot"></span><span>Diagnóstico local atualizado: ${uf} · ${certificate} · Repom: ${esc(repom)}. Nenhuma chamada externa foi feita.</span>`;
    $('#repom-call-state').textContent = status.repom.apiCallMade ? 'Sim' : 'Não';
  } catch {
    box.innerHTML = '<span class="integration-runtime-dot integration-runtime-offline"></span><span>API local indisponível. O GitHub Pages publica arquivos estáticos e não executa o servidor de integração.</span>';
  }
}

render();
