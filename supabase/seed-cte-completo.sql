-- CT-e com preenchimento completo (Rota TMS).
-- Execute no Supabase: SQL Editor → New query → cole tudo → Run. Pode rodar mais de uma vez.
-- Cria a transportadora "Horizonte Transportes Rodoviários Ltda", três clientes e o CT-e DEMO-CTE-COMPLETO,
-- já revisado e pronto para gerar o XML (CNPJ, CPF e chaves de NF-e com dígito verificador válido).
-- Todos os dados são fictícios.

begin;

-- Transportadora (emitente)
insert into public.company (id, data) values ('demo-xml-emp', '{
 "document": "27.419.385/0001-82",
 "legalName": "Horizonte Transportes Rodoviários Ltda",
 "name": "Horizonte Transportes",
 "registrationDate": "2020-03-10",
 "stateRegistration": "257.418.936",
 "municipalRegistration": "884512",
 "cnae": "4930-2/02",
 "status": "Ativo",
 "postalCode": "89219-510",
 "street": "Rua Dona Francisca",
 "number": "8300",
 "complement": "Galpão 4",
 "district": "Zona Industrial Norte",
 "state": "SC",
 "city": "Joinville",
 "phone": "(47) 3027-5500",
 "contact": "Mariana Costa",
 "contactPhone": "(47) 99812-3344",
 "email": "fiscal@horizontetransportes.com.br",
 "rntrc": "48213579",
 "carrierType": "ETC",
 "specialRegime": "Lucro Presumido",
 "simpleTax": "Não",
 "taxRegime": "Regime normal",
 "timezone": "America/Sao_Paulo",
 "emissionType": "Homologação (demonstração)",
 "financialStatus": "Normal",
 "cteSeriesInside": "1",
 "cteSeriesOutside": "1",
 "mdfeSeries": "1",
 "certificateA1": "Não informado"
}'::jsonb)
on conflict (id) do update set data = excluded.data, updated_at = now();

-- Clientes: remetente, destinatário e recebedor
insert into public.customers (id, data) values ('demo-xml-cli-rem', '{
 "personType": "Jurídica",
 "document": "61.840.572/0001-73",
 "name": "Metalúrgica Tupy Componentes S/A",
 "tradeName": "Tupy Componentes",
 "ie": "254.876.103",
 "phone": "(47) 3441-8000",
 "postalCode": "89227-901",
 "street": "Rua Albano Schmidt",
 "number": "3400",
 "district": "Boa Vista",
 "complement": "Portaria 2",
 "state": "SC",
 "city": "Joinville",
 "email": "expedicao@tupycomponentes.com.br",
 "taxRegime": "Normal"
}'::jsonb)
on conflict (id) do update set data = excluded.data, updated_at = now();

insert into public.customers (id, data) values ('demo-xml-cli-dest', '{
 "personType": "Jurídica",
 "document": "90.531.648/0001-87",
 "name": "Distribuidora Paulista de Autopeças Ltda",
 "tradeName": "DPA Autopeças",
 "ie": "110.042.490.114",
 "phone": "(11) 2915-4700",
 "postalCode": "03178-200",
 "street": "Avenida Salim Farah Maluf",
 "number": "1500",
 "district": "Quarta Parada",
 "complement": "Doca 7",
 "state": "SP",
 "city": "São Paulo",
 "email": "recebimento@dpaautopecas.com.br",
 "taxRegime": "Normal"
}'::jsonb)
on conflict (id) do update set data = excluded.data, updated_at = now();

insert into public.customers (id, data) values ('demo-xml-cli-receb', '{
 "personType": "Jurídica",
 "document": "43.702.519/0001-24",
 "name": "Armazém Logístico Guarulhos Ltda",
 "tradeName": "",
 "ie": "336.512.874.110",
 "phone": "(11) 2404-1100",
 "postalCode": "07220-020",
 "street": "Rodovia Presidente Dutra",
 "number": "225",
 "district": "Bonsucesso",
 "complement": "",
 "state": "SP",
 "city": "Guarulhos",
 "email": "operacao@armazemguarulhos.com.br",
 "taxRegime": "Normal"
}'::jsonb)
on conflict (id) do update set data = excluded.data, updated_at = now();

-- CT-e
insert into public.cte_drafts (id, data) values ('demo-xml-cte-0001', '{
 "reference": "DEMO-CTE-COMPLETO",
 "company": "demo-xml-emp",
 "status": "Rascunho revisado",
 "number": "1001",
 "series": "1",
 "model": "57",
 "cteType": "Normal",
 "service": "Normal",
 "mode": "Rodoviário",
 "payment": "A pagar",
 "printLayout": "Retrato",
 "payer": "Remetente",
 "payerIeIndicator": "1 — Contribuinte ICMS",
 "cfop": "6353",
 "nature": "Prestação de serviço de transporte a estabelecimento comercial",
 "issuedAt": "2026-10-12T14:30",
 "globalized": "Não",
 "receiverPickup": false,
 "pickupDetails": "",
 "issueState": "SC",
 "issueCity": "Joinville",
 "originState": "SC",
 "originCity": "Joinville",
 "destinationState": "SP",
 "destinationCity": "São Paulo",
 "sender": "Metalúrgica Tupy Componentes S/A",
 "senderForeign": false,
 "senderDocument": "61.840.572/0001-73",
 "senderIe": "254.876.103",
 "senderTradeName": "Tupy Componentes",
 "senderPhone": "(47) 3441-8000",
 "senderActivity": "Fabricação de peças automotivas",
 "senderPostalCode": "89227-901",
 "senderStreet": "Rua Albano Schmidt",
 "senderNumber": "3400",
 "senderDistrict": "Boa Vista",
 "senderComplement": "Portaria 2",
 "senderCity": "Joinville",
 "senderState": "SC",
 "senderEmail": "expedicao@tupycomponentes.com.br",
 "senderEmailXml": true,
 "senderContactEmail": "logistica@tupycomponentes.com.br",
 "senderContactXml": true,
 "recipient": "Distribuidora Paulista de Autopeças Ltda",
 "recipientForeign": false,
 "recipientDocument": "90.531.648/0001-87",
 "recipientIe": "110.042.490.114",
 "recipientTradeName": "DPA Autopeças",
 "recipientPhone": "(11) 2915-4700",
 "recipientActivity": "Comércio atacadista de autopeças",
 "recipientPostalCode": "03178-200",
 "recipientStreet": "Avenida Salim Farah Maluf",
 "recipientNumber": "1500",
 "recipientDistrict": "Quarta Parada",
 "recipientComplement": "Doca 7",
 "recipientCity": "São Paulo",
 "recipientState": "SP",
 "recipientEmail": "recebimento@dpaautopecas.com.br",
 "recipientEmailXml": true,
 "receiver": "Armazém Logístico Guarulhos Ltda",
 "receiverForeign": false,
 "receiverDocument": "43.702.519/0001-24",
 "receiverIe": "336.512.874.110",
 "receiverPhone": "(11) 2404-1100",
 "receiverPostalCode": "07220-020",
 "receiverStreet": "Rodovia Presidente Dutra",
 "receiverNumber": "225",
 "receiverDistrict": "Bonsucesso",
 "receiverCity": "Guarulhos",
 "receiverState": "SP",
 "receiverEmail": "operacao@armazemguarulhos.com.br",
 "expeditor": "",
 "otherPayer": "",
 "payerName": "",
 "documents": [
  {
   "docType": "NF-e",
   "docNumber": "48213",
   "docKey": "42261061840572000173550010000482131817987473",
   "docDate": "2026-10-12",
   "docCfop": "6101",
   "docWeight": "1850",
   "docValue": "18450.00",
   "docEdi": "EDI-48213",
   "docControl": "PED-8213",
   "docPin": "",
   "docNcm": "8708.99.90"
  },
  {
   "docType": "NF-e",
   "docNumber": "48214",
   "docKey": "42261061840572000173550010000482141818066662",
   "docDate": "2026-10-12",
   "docCfop": "6101",
   "docWeight": "920",
   "docValue": "9320.50",
   "docEdi": "EDI-48214",
   "docControl": "PED-8214",
   "docPin": "",
   "docNcm": "8708.99.90"
  }
 ],
 "cargoValue": "27770.50",
 "product": "Peças automotivas fundidas",
 "insuredCargoValue": "27770.50",
 "container": "",
 "containerSeal": "",
 "cargoCharacteristics": "Carga paletizada",
 "transportCharacteristics": "Carga seca",
 "serviceCharacteristics": "Entrega fracionada",
 "weight": "2770",
 "invoiceReference": "",
 "cargoQuantities": [
  {
   "quantity": "2770",
   "unit": "KG",
   "measureType": "PESO BRUTO",
   "alternate": false,
   "description": ""
  },
  {
   "quantity": "18",
   "unit": "UN",
   "measureType": "PALETES",
   "alternate": false,
   "description": ""
  }
 ],
 "serviceComponents": [
  {
   "description": "FRETE PESO",
   "value": "1850.00",
   "taxBase": true,
   "receivable": true
  },
  {
   "description": "GRIS",
   "value": "83.31",
   "taxBase": true,
   "receivable": true
  },
  {
   "description": "PEDAGIO",
   "value": "96.40",
   "taxBase": false,
   "receivable": true
  },
  {
   "description": "TDE",
   "value": "120.00",
   "taxBase": true,
   "receivable": true
  }
 ],
 "freight": "1850.00",
 "otherCharges": "299.71",
 "serviceValue": "2149.71",
 "receivableValue": "2149.71",
 "includeIcms": false,
 "icmsCst": "00 — Tributação normal",
 "icmsRate": "12",
 "icmsReduction": "",
 "icmsBase": 2053.31,
 "icmsValue": 246.4,
 "taxClassification": "",
 "donation": false,
 "PISCst": "01",
 "PISBase": "2149.71",
 "PISRate": "0.65",
 "COFINSCst": "01",
 "COFINSBase": "2149.71",
 "COFINSRate": "3",
 "rntrc": "48213579",
 "deliveryForecast": "2026-10-15",
 "ciot": "",
 "fullLoad": false,
 "cteVehicles": [
  {
   "id": "demo-veic-1",
   "plate": "RLX4E21",
   "state": "SC",
   "renavam": "01234567890",
   "ownership": "Próprio",
   "type": "Tração",
   "body": "Fechada / Baú"
  }
 ],
 "cteDrivers": [
  {
   "id": "demo-mot-1",
   "name": "Carlos Eduardo Oliveira",
   "document": "529.982.247-25",
   "license": "04512378965"
  }
 ],
 "insurance": [
  {
   "responsible": "Emitente",
   "insurer": "Porto Seguro Companhia de Seguros Gerais",
   "insurerDocument": "33.164.982/0001-06",
   "policy": "0553.21.000123",
   "endorsement": "AV-2026-778812"
  }
 ],
 "previous": [],
 "dangerous": [],
 "billing": [
  {
   "number": "FAT-2026-1001",
   "value": "2149.71",
   "due": "2026-11-11"
  }
 ],
 "operationNotes": "Entregar em horário comercial, das 8h às 17h. Agendamento obrigatório pelo telefone (11) 2915-4700.",
 "taxpayerNotes": [
  {
   "identifier": "PEDIDO",
   "description": "Pedido de compra DPA 4500098123"
  },
  {
   "identifier": "AGENDAMENTO",
   "description": "Doca 7 - senha 5521"
  }
 ],
 "fiscalNotes": [
  {
   "identifier": "BASE_LEGAL",
   "description": "ICMS conforme RICMS/SC"
  }
 ],
 "linkedCtes": [],
 "simulationEvents": [],
 "createdAt": "2026-10-12T17:20:00.000Z",
 "reviewedAt": "2026-10-12T17:45:00.000Z",
 "updatedAt": "2026-10-12T17:45:00.000Z"
}'::jsonb)
on conflict (id) do update set data = excluded.data, updated_at = now();

commit;
