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
