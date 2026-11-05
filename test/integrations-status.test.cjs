const test = require('node:test');
const assert = require('node:assert/strict');
const { getIntegrationStatus, isRepomQaUrl, REPOM_QA_BASE_URL } = require('../server/integrations/status.cjs');

test('default status is homologation-only and sends no external requests', () => {
  const result = getIntegrationStatus({}, () => false);
  assert.equal(result.externalCallsMade, false);
  assert.equal(result.externalWritesEnabled, false);
  assert.equal(result.sefaz.environment, 'HOMOLOGAÇÃO');
  assert.equal(result.sefaz.transmissionAvailable, false);
  assert.equal(result.sefaz.mdfeXmlBuilderAvailable, false);
  assert.equal(result.repom.qaBaseUrl, REPOM_QA_BASE_URL);
  assert.equal(result.repom.writeOperationsEnabled, false);
  assert.equal(result.repom.apiCallMade, false);
});

test('a production SEFAZ mode is reported as blocked', () => {
  const result = getIntegrationStatus({ ROTA_SEFAZ_ENV: 'producao' }, () => false);
  assert.equal(result.sefaz.environment, 'BLOQUEADO');
  assert.equal(result.sefaz.environmentAllowed, false);
});

test('a certificate is ready only when file and passphrase are both configured', () => {
  const absent = getIntegrationStatus({ ROTA_SEFAZ_PFX_PATH: '/secret/cert.pfx', ROTA_SEFAZ_PFX_PASSWORD: 'secret' }, () => false);
  assert.equal(absent.sefaz.certificateReady, false);
  const present = getIntegrationStatus({ ROTA_SEFAZ_PFX_PATH: '/secret/cert.pfx', ROTA_SEFAZ_PFX_PASSWORD: 'secret' }, () => true);
  assert.equal(present.sefaz.certificateReady, true);
});

test('Repom accepts only HTTPS on its QA API host', () => {
  assert.equal(isRepomQaUrl(REPOM_QA_BASE_URL), true);
  assert.equal(isRepomQaUrl('http://qa.repom.com.br/Repom.Frete.WebAPI/v3'), false);
  assert.equal(isRepomQaUrl('https://api.repom.com.br/Repom.Frete.WebAPI/v3'), false);
  assert.equal(isRepomQaUrl('https://qa.repom.com.br.evil.example/Repom.Frete.WebAPI/v3'), false);
});

test('status output never contains credential values or certificate paths', () => {
  const result = getIntegrationStatus({
    ROTA_SEFAZ_PFX_PATH: '/private/certificate.pfx',
    ROTA_SEFAZ_PFX_PASSWORD: 'never-return-this',
    ROTA_REPOM_USERNAME: 'private-user',
    ROTA_REPOM_PASSWORD: 'private-password',
    ROTA_REPOM_PARTNER: 'private-partner',
  }, () => true);
  const serialized = JSON.stringify(result);
  for (const secret of ['never-return-this', 'private-user', 'private-password', 'private-partner', '/private/certificate.pfx']) {
    assert.equal(serialized.includes(secret), false);
  }
  assert.equal(result.repom.credentialsConfigured, true);
});
