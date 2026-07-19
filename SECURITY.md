---
name: security-guardrails
description: Regras estritas de segurança para o desenvolvimento do Bullet Journal Planner.
---

# Diretrizes e Guardrails de Segurança 🛡️

Esta especificação define os guardrails de segurança que devem ser estritamente seguidos por todos os desenvolvedores e assistentes de IA (agentes) ao escrever, refatorar ou sugerir códigos neste projeto.

## 1. NUNCA DEIXE CHAVES FIXAS NO CÓDIGO (No Hardcoded Secrets)

**Regra de Ouro:** Nenhuma credencial (URLs sensíveis, tokens JWT, chaves de API, senhas, chaves privadas, secrets) deve ser incluída diretamente em arquivos `.ts`, `.js`, `.mjs`, `.py`, `.html` ou qualquer outro arquivo rastreado pelo Git.

- **Backend / Scripts Node.js:** Sempre utilize variáveis de ambiente acessando via `process.env`. Arquivos `.env` devem ser mantidos localmente e NUNCA devem ser commitados no controle de versão (garanta que `.env` esteja no `.gitignore`).
- **Frontend Angular/Web:** Variáveis de ambiente como `Supabase URL` e a **chave Anon (pública)** devem ser armazenadas em arquivos `environment.ts` ou gerenciadas pelo sistema de build. 
  - *Atenção:* A chave `service_role` (que tem superpoderes) NUNCA deve chegar ao código frontend.

## 2. Diferenciação de Chaves no Supabase

- **Anon Key (Chave Anônima/Pública):** Pode ser enviada para o cliente/frontend. A segurança dos dados é garantida pelas Políticas de Segurança em Nível de Linha (RLS - Row Level Security) do banco de dados.
- **Service Role Key (Chave Mestra/Secreta):** Tem acesso **IRRESTRITO** ao banco de dados e ignora as políticas RLS. **NUNCA** pode ser exposta no frontend, em repositórios públicos ou compartilhada em chats sem ofuscação. Só deve ser usada em ambientes backend seguros (ex: Edge Functions, Servidores Node.js) via variável de ambiente.

## 3. Prevenção Durante Interações com IA

- Ao pedir para a IA gerar código de autenticação, banco de dados ou integração com API de terceiros, a IA **deve automaticamente:**
  1. Utilizar referências como `process.env.NOME_DA_VARIAVEL` ou `environment.supabaseKey`.
  2. Emitir um alerta para o usuário criar essas variáveis no seu próprio `.env` ou painel de CI/CD.
  3. Rejeitar pedidos que solicitem a inserção explícita de uma chave real no código fonte gerado.

## 4. Práticas de Code Review e Scanning

- Se alguma chave de `service_role` for acidentalmente "vazada", a ação imediata deve ser:
  1. Revogar (Roll) a chave no painel do Supabase.
  2. Atualizar as variáveis de ambiente nos servidores e na máquina local.
  3. Não tentar apenas "deletar do commit", pois o histórico do Git ainda conterá a chave. A revogação é mandatória.

## 5. Implementação de RLS (Row Level Security)

Sempre que criar uma nova tabela no banco de dados (Supabase):
- Habilite RLS (`ALTER TABLE tabela ENABLE ROW LEVEL SECURITY;`).
- Crie políticas claras (Policies) de quem pode realizar `SELECT`, `INSERT`, `UPDATE` e `DELETE`.
- Nunca deixe uma tabela com RLS desativada em produção.

---
**Guia para a IA:** Se você é um agente de IA operando neste projeto, você deve ler este arquivo e obedecer cegamente a estas regras antes de executar comandos ou modificar arquivos.
