# Guia de Deploy no Netlify (Integração Contínua com GitHub)

Este guia orienta o processo de deploy do **BuJo Focus** no Netlify utilizando a integração contínua (CI/CD) com o GitHub, garantindo que cada atualização no branch principal seja automaticamente compilada e publicada.

---

## 📋 Pré-requisitos

1. **Conta no GitHub** com o repositório do projeto hospedado.
2. **Conta no Netlify** (pode ser criada usando o login do próprio GitHub).
3. **Credenciais do Supabase** (para configurar as variáveis de ambiente).

---

## ⚙️ Configuração de Variáveis de Ambiente (.env)

O projeto precisa das seguintes chaves de ambiente para realizar chamadas de API ao banco de dados Supabase. Estas chaves devem ser cadastradas nas configurações do site no Netlify:

| Nome da Variável | Descrição | Origem no Supabase |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL de conexão com a API do Supabase | *Settings > API > Project URL* |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima para requisições no cliente | *Settings > API > Project API keys > anon (public)* |

> [!NOTE]
> A variável `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` listada no arquivo `.env` local é usada para autenticação via Google. **Ela não deve ser colocada no Netlify**, mas sim cadastrada diretamente no painel do Supabase em *Authentication > Providers > Google*, conforme as regras de fluxo do próprio Supabase.

---

## 🚀 Passo a Passo do Deploy

### Passo 1: Importar o Projeto no Netlify
1. Faça login no painel do [Netlify](https://app.netlify.com/).
2. Clique no botão **"Add new site"** e selecione **"Import an existing project"**.
3. Selecione o provedor **GitHub**.
4. Autorize a conexão do Netlify com a sua conta GitHub (se necessário).
5. Escolha o repositório `bullet-journal-planner` (ou o nome do seu repositório).

### Passo 2: Configurar as Definições de Build
Na tela de configurações de deploy do Netlify, defina os seguintes parâmetros:

- **Branch to deploy:** `main` (ou o branch de produção configurado)
- **Base directory:** *Deixe em branco* (raiz do projeto)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Passo 3: Cadastrar as Variáveis de Ambiente
1. Ainda na tela de configuração de build, clique no botão **"Advanced build settings"** ou vá em **"Environment variables"**.
2. Adicione as seguintes chaves de ambiente:
   - Chave: `VITE_SUPABASE_URL` | Valor: *[Sua URL do Supabase]*
   - Chave: `VITE_SUPABASE_ANON_KEY` | Valor: *[Sua Chave Anon do Supabase]*
3. Clique em **"Deploy site"**.

---

## 🔄 Roteamento SPA (Single Page Application)

Para garantir que rotas internas do React (como `/daily_log`, `/settings`, etc.) não retornem erro **404** ao recarregar a página diretamente no navegador, o projeto inclui um arquivo de configuração de redirecionamento no diretório público:

- Arquivo: [public/_redirects](../public/_redirects)
- Conteúdo:
  ```text
  /*    /index.html   200
  ```

Este arquivo instrui o Netlify a direcionar todas as requisições de rota para o `index.html`, permitindo que o roteador do React manipule as páginas no lado do cliente.

---

## 🔍 Verificação pós-deploy

Após a conclusão da build pelo Netlify:
1. Acesse a URL gerada pelo Netlify (ex: `https://nome-do-site.netlify.app`).
2. Abra as ferramentas de desenvolvedor do navegador (F12) e verifique se há erros no console relacionados à conexão com o Supabase.
3. Navegue entre as abas e recarregue a página (F5) para validar se o roteamento está funcionando sem erros de 404.
