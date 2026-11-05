const fs = require('node:fs');
const path = require('node:path');

const REPOM_QA_BASE_URL = 'https://qa.repom.com.br/Repom.Frete.WebAPI/v3';
const VALID_UFS = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRepomQaUrl(value) {
  try {
    const url = new URL(value || REPOM_QA_BASE_URL);
    return url.protocol === 'https:'
      && url.hostname === 'qa.repom.com.br'
      && url.pathname.startsWith('/Repom.Frete.WebAPI/v3');
  } catch {
    return false;
  }
}

/**
 * Returns a safe readiness summary only. This module intentionally performs no
 * network calls and never returns secret values or local certificate paths.
 */
function getIntegrationStatus(env = process.env, exists = fs.existsSync) {
  const uf = String(env.ROTA_SEFAZ_UF || '').trim().toUpperCase();
  const envMode = String(env.ROTA_SEFAZ_ENV || 'homologacao').trim().toLowerCase();
  const pfxPath = String(env.ROTA_SEFAZ_PFX_PATH || '').trim();
  const certificateFilePresent = Boolean(pfxPath && exists(path.resolve(pfxPath)));
  const certificateReady = certificateFilePresent && hasValue(env.ROTA_SEFAZ_PFX_PASSWORD);
  const repomUrl = String(env.ROTA_REPOM_BASE_URL || REPOM_QA_BASE_URL).trim();
  const repomQaOnly = isRepomQaUrl(repomUrl);
  const repomCredentialsPresent = hasValue(env.ROTA_REPOM_USERNAME)
    && hasValue(env.ROTA_REPOM_PASSWORD)
    && hasValue(env.ROTA_REPOM_PARTNER);

  return {
    checkedAt: new Date().toISOString(),
    externalCallsMade: false,
    externalWritesEnabled: false,
    sefaz: {
      environment: envMode === 'homologacao' ? 'HOMOLOGAÇÃO' : 'BLOQUEADO',
      environmentAllowed: envMode === 'homologacao',
      issuerUf: VALID_UFS.has(uf) ? uf : null,
      issuerUfConfigured: VALID_UFS.has(uf),
      certificateFilePresent,
      certificateReady,
      cteXmlBuilderAvailable: true,
      cteXsdValidated: false,
      mdfeXmlBuilderAvailable: false,
      mdfeXsdValidated: false,
      signatureAvailable: false,
      transmissionAvailable: false,
    },
    repom: {
      apiVersion: '3.0',
      qaBaseUrl: REPOM_QA_BASE_URL,
      configuredTargetIsQa: repomQaOnly,
      credentialsConfigured: repomCredentialsPresent,
      writeOperationsEnabled: false,
      apiCallMade: false,
    },
  };
}

module.exports = { REPOM_QA_BASE_URL, getIntegrationStatus, isRepomQaUrl };
