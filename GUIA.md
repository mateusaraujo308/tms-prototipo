# Rota TMS — protótipo ajustado pelos quatro vídeos

## Como abrir

1. Extraia o ZIP inteiro para uma pasta.
2. Abra `INICIAR.cmd`. O navegador abre em `http://127.0.0.1:4173`.
3. Mantenha a janela do servidor aberta durante o uso.

O iniciador usa Node.js instalado ou o runtime do Codex no perfil do usuário.
Alternativamente, abra `index.html` diretamente. O endereço e o navegador
determinam onde ficam os dados locais; use sempre o mesmo endereço para continuar.
Não são necessários npm, instalação de dependências ou acesso à internet.

## O que mudou

As cores, marca, painel, tabelas e estrutura lateral do Rota foram preservados.
Os menus agora têm grupos recolhíveis: Cadastros, Frota e Emissões.

**Vídeo `videoplayback.mp4`: CT-e**

- Abas Dados, Remetente, Destinatário, Outros, Informações da carga,
  Serviços e Impostos, Observações e Revisão.
- Botões Anterior / Próximo e navegação pelas setas do teclado nas abas.
- Consulta de participantes na base de clientes e cadastro de participantes reutilizáveis.
- Documentos no remetente: NF-e, nota fiscal, declaração e outros documentos,
  com inclusão, edição, remoção e importação local de XML.
- Carga com quantidades, documentos anteriores, modal rodoviário, seguros,
  produtos perigosos e cobranças.
- Componentes do frete com marcação de base de ICMS e recebimento.
  Cálculo demonstrativo usando alíquota e redução informadas, incluindo ICMS
  no frete quando selecionado. Exemplo: R$ 100 / (1 - 12%) = R$ 113,64.
- Observações do contribuinte e do fisco; revisão e salvamento de rascunhos.

**Vídeo `videoplayback (1).mp4`: veículos**

- RENAVAM, tara, capacidades, eixos, propriedade, tipo de veículo,
  rodado, carroceria, UF e motorista.
- Proprietário selecionado na base de clientes, RNTRC, CIOT e pedágios.
- Cadastro de reboques e vínculos de um ou mais reboques ao veículo de tração.

**Vídeo `videoplayback (2).mp4`: clientes**

- Pessoas jurídicas, físicas e do exterior, dados cadastrais, endereço,
  contatos, e-mails, dados bancários, informações tributárias e observações.
- Clientes podem ser usados como remetente, destinatário, expedidor,
  recebedor, outro tomador e proprietário de veículo.
- Preferências de envio de XML são registradas, sem envio de e-mail.

**Vídeo `videoplayback (3).mp4`: MDF-e**

- Tela única de documentos, motoristas, veículo, reboques, identificação,
  viagem, carga e CIOT.
- Importação de XML de NF-e / CT-e, preenchimento manual de documentos ou
  seleção de CT-e da mesma empresa cadastrados no protótipo.
- Confirmação de locais de descarregamento, edição e remoção de documentos.
- Soma de peso e valor; múltiplos motoristas, reboques e CIOTs.
- Mais opções com seguros, observações, pedágios, lacres, autorizados para
  download, produto predominante e pagamento do frete.
- Prévia, impressão, salvamento e conclusão da revisão.

**Recursos comuns**

- Filtros por texto, situação e data; duplicação de rascunhos.
- Simulação de emissão, cancelamento com motivo e encerramento de MDF-e.
- Exportação JSON e XML demonstrativo, prévia HTML e impressão.
- Backup/restauração em Configurações.
- Salvamento automático ao mudar de página pelo menu; registros ainda em
  preenchimento no CT-e são restaurados ao reabrir o rascunho.

## Limites do protótipo

Os dados ficam somente no navegador. Fechar ou atualizar uma edição sem salvar
pode perder alterações; use Salvar rascunho antes de fechar o navegador.

Não há autenticação de certificados, Receita Federal, consulta de chave na
SEFAZ, autorização fiscal, envio de e-mails, cobrança, nem conexão com as
plataformas mostradas nos vídeos. A leitura de XML apenas extrai dados locais;
não valida assinatura ou autorização do documento. Arquivos XML de até 5 MB
são aceitos; arquivos ZIP com documentos devem ser extraídos antes de importar.

O XML exportado pelo protótipo usa um formato próprio de demonstração e não
pode ser transmitido à SEFAZ. As prévias não são DACTE nem DAMDFE. Os cálculos
servem para validar interação e preenchimento; não aplicam regras tributárias
completas. Emissão real exige um serviço fiscal e integração específica.

## Verificação realizada

Testados no navegador: cadastro de cliente e reboque, vínculo à tração,
busca de participante, documento manual, importação de NF-e XML, troca de
abas com preservação de dados, componentes do frete, ICMS demonstrativo,
seguro, veículo no CT-e, revisão/salvamento do CT-e, documento no MDF-e,
motorista sugerido pelo veículo, seguros e lacres nas opções, prévia e revisão
do MDF-e. A sintaxe dos arquivos JavaScript também foi verificada.
