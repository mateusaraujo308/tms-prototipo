# Rota TMS — protótipo

Sem dependências npm. Dados armazenados no Supabase e compartilhados entre todos que usam o app. Nenhum documento fiscal real é emitido;
as ações fiscais são demonstrações locais, sem autorização da SEFAZ. O cabeçalho do sistema identifica o ambiente de teste.

## Configurar o Supabase (uma vez)

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**
   para `public/js/supabase-config.js`. Nunca use a chave `service_role`.
4. Abra o app. Se o banco estiver vazio, os dados de demonstração são criados.

Sem login, qualquer pessoa com a URL e a chave anon lê e altera os dados: use apenas dados fictícios. A aplicação não oferece isolamento por cliente e ainda não é adequada para dados reais ou acesso de clientes.
O app precisa de internet. Se duas pessoas editarem o mesmo registro, vale a última gravação.

## Como abrir

1. Extraia o ZIP e abra `INICIAR.cmd`. O navegador abre em http://127.0.0.1:4173.
2. Mantenha a janela do servidor aberta durante o uso.

Alternativa: abrir `public/index.html` diretamente.

Consulte [docs/GUIA.md](docs/GUIA.md) para as instruções completas, os recursos baseados
nos quatro vídeos e os limites da simulação fiscal.

## SEFAZ e Repom

O branch `feature/homologacao-sefaz-repom` inclui uma central de diagnóstico local, testes do endpoint de status e o levantamento do Swagger público Repom QA. Nenhuma chamada à SEFAZ ou à Repom é realizada: não há assinatura, validação XSD completa, autorização fiscal ou operação Repom conectada. Leia [docs/INTEGRACAO-SEFAZ-REPOM.md](docs/INTEGRACAO-SEFAZ-REPOM.md) antes de configurar qualquer acesso.

O servidor local continua vinculado a `127.0.0.1`. Ele aceita, opcionalmente, variáveis `ROTA_*` por processo ou arquivo `.env` local, que é ignorado pelo Git. Nunca guarde certificado, senha, token ou dados reais em arquivos públicos ou no repositório. GitHub Pages não executa o backend.

Execute os testes locais do status com `node --test test/integrations-status.test.cjs`.

## Estrutura

```
INICIAR.cmd      iniciador no Windows
server.cjs       servidor local (serve a pasta public/)
supabase/        SQL das tabelas
docs/GUIA.md     guia de uso
public/
  index.html
  css/           estilos
  js/            scripts; data.js carrega o Supabase e depois os demais em ordem
                 supabase-config.js guarda a URL e a chave anon
```
