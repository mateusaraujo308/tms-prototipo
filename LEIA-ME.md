# Protótipo local — Rota TMS

Abra INICIAR.cmd e acesse http://127.0.0.1:4173 no navegador. Mantenha a janela aberta durante o uso. A porta 4173 precisa estar disponível. O iniciador usa Node instalado ou o runtime do Codex deste computador.

## O que validar

- Dashboard com totais calculados a partir dos cadastros.
- Empresas, motoristas, modelos e veículos: cadastrar, editar, buscar e excluir.
- Veículos: vínculo obrigatório com modelo, vínculo opcional com motorista e filtro de situação.
- Modelos e motoristas vinculados não podem ser excluídos sem antes alterar os veículos.
- Consultas leva às listas de cadastros; configurações permite restaurar a demonstração.
- CT-e e MDF-e são áreas futuras, sem emissão ou integração fiscal.

Os dados são fictícios e ficam no armazenamento local do navegador. Não há autenticação, servidor de dados, sincronização entre computadores ou integração com GitHub. Use sempre o mesmo endereço e navegador para reencontrar seus cadastros. Limpar dados do navegador pode apagar as alterações. Não use dados pessoais reais.

O README.md original do ZIP foi preservado. Os arquivos desta pasta são a primeira implementação e não foram publicados nem enviados ao repositório.

## Fluxos demonstrativos de CT-e e MDF-e

CT-e: empresa e participantes → trajeto e carga → valores e revisão.
MDF-e: empresa e percurso → veículo e motorista → seleção de rascunhos de CT-e e revisão.

É possível salvar rascunhos incompletos e retomá-los pela lista de cada documento. “Rascunho revisado” indica somente a conclusão do preenchimento demonstrativo. Nenhum XML, chave, autorização, DACTE ou DAMDFE é gerado. As verificações de preenchimento não representam validação fiscal. O MDF-e desta primeira versão considera um veículo principal e um motorista.

O cadastro de empresa usa seções expansíveis. Identificação e endereço/contatos começam abertos. A configuração de certificado usa um exemplo fictício interno, sem ler arquivos reais. O campo de senha não participa do salvamento e é apagado após o teste e ao fechar o formulário.

## CT-e detalhado pelas referências

O CT-e agora usa abas: Detalhes, Documentos, Remetente, Destinatário, Outros, Modal, Informações, Serviços e Impostos, Observações e Revisão. Os campos visíveis nas referências de Detalhes, Documentos, Remetente, Destinatário e Modal foram incorporados. Notas podem ser incluídas, editadas e removidas; veículos e motoristas podem ser vinculados em múltiplos registros. Alterações em notas devem ser adicionadas à lista antes de salvar o rascunho.

As referências não mostraram o conteúdo de Outros, Informações dos Modais, Informações, Serviços e Impostos e Observações. Nessas áreas, foram preservados os campos básicos já existentes, sem presumir regras ou novos campos fiscais. Número, série e chave informados são dados manuais de demonstração, sem autorização fiscal.
