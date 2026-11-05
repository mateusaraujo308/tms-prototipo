# Preparação de integração — SEFAZ e Repom

## Situação neste branch

Este branch adiciona uma tela de diagnóstico e um endpoint local de status. O diagnóstico é somente leitura: não consulta a SEFAZ, não autentica na Repom, não assina XML e não envia, cancela ou autoriza qualquer operação. A aplicação atual continua sendo um protótipo TMS; a interface de prontidão não significa que uma integração esteja ativa.

O servidor de desenvolvimento local escuta em `127.0.0.1`. O GitHub Pages hospeda somente arquivos estáticos e não executa `server.cjs`; portanto, a tela da URL pública não consegue usar o endpoint local. Para integrações reais, o backend precisa ser hospedado em serviço privado com autenticação e armazenamento de segredos/certificado fora do repositório e fora da pasta pública.

## CT-e e MDF-e

O Portal Nacional/SVRS publica o MOC CT-e 4.00 e pacotes de schemas incrementais. Na consulta de 5 de novembro de 2026, a página listava o pacote CT-e NT 2026.005 e schemas NT 2026.004 RTC v1.01, além das notas técnicas associadas. O gerador CT-e do protótipo produz um arquivo estrutural com `tpAmb=2`, mas não valida o conjunto XSD vigente, não assina e não transmite.

O Portal MDF-e/SVRS publica o MOC 3.00b e os schemas NT 2025.001 v1.04. A NT MDF-e 2026.001 documenta a regra de validação de CIOT para as prestações rodoviárias por conta de terceiros e remuneradas nas condições nela previstas. O protótipo ainda não possui um gerador MDF-e com XML fiscal; exportar o rascunho em JSON não equivale a XML de MDF-e.

A entrada em homologação exige, no mínimo, definir UF autorizadora e CNPJ/inscrição estadual do emitente, obter o credenciamento da empresa no ambiente, confirmar os endpoints/WSDL e schemas ativos daquela UF, integrar validação XSD atualizada, assinar com certificado aceito pelo autorizador, tratar SOAP e respostas/rejeições, persistir protocolo/recibo e controlar numeração/idempotência. Nada disso é ativado pelo endpoint de status.

## Repom Frete

Foi localizado o Swagger público **Repom Frete API 3.0** em `https://qa.repom.com.br/Repom.Frete.WebAPI/HelpApi/index`, com o documento OpenAPI em `/Repom.Frete.WebAPI/v3/swagger`. A especificação declara autenticação por token Bearer no cabeçalho `Authorization`; o endpoint `POST /token` descreve fluxo `password` com campos `username`, `password` e `partner`. O catálogo inclui `POST /Shipping`, consultas de frete/CIOT e operações `POST /Shipping/CIOTAggregate/CancelCIOT` e `/ClosingCIOT`.

Isso comprova que há contrato técnico publicado no host de QA, mas não comprova que a transportadora do usuário tenha contrato, usuário, senha, parceiro, permissão para aquele ambiente ou acesso habilitado. A especificação pública também não fornece esses segredos. O aplicativo não envia nenhuma chamada Repom neste branch. Criar, encerrar ou cancelar operação é ação externa e não será executada sem autorização específica e teste controlado.

## Segurança e prontidão para clientes

A configuração Supabase atual do protótipo concede leitura e gravação a `anon` em tabelas compartilhadas e não implementa isolamento por cliente. Não use dados reais de transportadoras, motoristas, documentos fiscais, contas bancárias ou fretes até substituir esse modelo por autenticação e políticas RLS por organização/usuário. O `anon key` de Supabase não é uma credencial de servidor e não deve ser tratado como mecanismo de autorização.

O arquivo PFX, sua senha, o token Repom, credenciais da empresa e segredos de assinatura nunca devem ser colocados em `public/`, no JavaScript do navegador ou no GitHub. O endpoint `/api/integrations/status` retorna apenas indicadores booleanos e sempre informa `externalCallsMade=false` e `externalWritesEnabled=false`.

## Próximos dados necessários para avançar

- UF autorizadora e confirmação do credenciamento de homologação para o CNPJ emitente.
- Certificado de teste/produção autorizado para homologação, disponibilizado depois em um mecanismo seguro para o backend, nunca no chat ou GitHub.
- Acesso Repom QA da empresa, incluindo confirmação de habilitação do parceiro e escopos da conta, enviado por canal seguro.
- Ambiente privado de backend e hospedagem, pois GitHub Pages não executa as integrações de servidor.

Mesmo após receber esses itens, a primeira ativação deve ocorrer exclusivamente no endpoint de QA/homologação, com documentos de teste e autorização expressa para cada chamada que crie ou altere registros externos.

## Fontes

- [Portal oficial CT-e — documentos, manuais, schemas e notas técnicas](https://dfe-portal.svrs.rs.gov.br/Cte/Documentos)
- [Portal oficial MDF-e/SVRS — documentos, manuais, schemas e notas técnicas](https://dfe-portal.svrs.rs.gov.br/mdfe/Documentos)
- [Swagger UI Repom Frete API 3.0 — ambiente QA](https://qa.repom.com.br/Repom.Frete.WebAPI/HelpApi/index)
- [OpenAPI Repom Frete API 3.0 — ambiente QA](https://qa.repom.com.br/Repom.Frete.WebAPI/v3/swagger)
- [ANTT — CIOT para Todos, perguntas frequentes](https://www.gov.br/antt/pt-br/assuntos/cargas/ciot-para-todos-1/perguntas-frequentes)
