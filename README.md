# AegisPrev Backend (Node.js)

Reescrita completa do backend original em Java/Spring Boot para **Node.js + Express**,
usando o mesmo banco Postgres/Supabase. Mesmas rotas, mesmo formato de resposta —
o frontend Vue não precisa de nenhuma mudança de lógica, só do `VITE_API_URL`.

## Rodando localmente

```bash
npm install
cp .env.example .env
# edite o .env com sua DATABASE_URL do Supabase e um JWT_SECRET
npm run migrate   # cria as tabelas no banco (idempotente)
npm run dev       # inicia o servidor em modo desenvolvimento
```

## Variáveis de ambiente

Veja `.env.example`. As mais importantes:

- `DATABASE_URL`: string de conexão do Supabase (Settings → Database → Connection string → URI).
- `JWT_SECRET`: precisa ser uma string em **Base64** (mesmo formato do backend Java antigo).
  Gere uma com:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- `CORS_ORIGIN`: URL do seu frontend na Vercel (pode ter várias, separadas por vírgula).

## Deploy no Render

1. Crie um novo "Web Service" no Render apontando para este diretório.
2. Build command: `npm install`
3. Start command: `npm start`
4. Adicione as variáveis de ambiente acima nas configurações do serviço.
5. Rode a migração uma vez (Render → Shell): `npm run migrate`.

**Importante:** como os dados de usuários criados no backend Java antigo usavam
BCrypt (compatível com o `bcryptjs` usado aqui), as senhas continuam funcionando
se você reaproveitar o mesmo banco. Só a tabela `usuario.password` precisa
conter hashes BCrypt (`$2a$...` / `$2b$...`), que é exatamente o que já existia.

## O que mudou em relação ao backend Java

- Mesmas rotas: `/auth/login`, `/medicos`, `/pacientes`, `/consultas`, `/doencas`,
  `/sintomas`, `/admin/...`.
- Mesmo formato de token (JWT HS256, `sub` = email, claim `role`).
- Login com credenciais erradas agora retorna **401** (`{ "message": "..." }`),
  igual ao que já havia sido corrigido no backend Java.
- Erros de validação retornam **400** com um objeto `{ campo: "mensagem" }`.
- Erros inesperados retornam **500** com `{ "message": "Ocorreu um erro interno..." }`
  em vez de vazar stacktrace.

## Estrutura

```
src/
  app.js              -> configuração do Express (CORS, rotas, middlewares)
  server.js           -> ponto de entrada
  db.js               -> pool de conexão Postgres
  schema.sql / migrate.js -> criação das tabelas
  middleware/
    auth.js           -> autenticação JWT + checagem de papéis (equivalente ao @PreAuthorize)
    errorHandler.js   -> tratamento global de erros
  controllers/        -> validam entrada e chamam os services (1 por recurso)
  services/           -> regra de negócio e acesso ao banco (1 por recurso)
  routes/             -> define os endpoints e quem pode acessá-los
```

## Frontend

No projeto Vue, atualize a variável de ambiente `VITE_API_URL` (arquivo `.env`
ou nas configurações do projeto na Vercel) para a URL deste novo backend, por
exemplo `https://aegisprev-node.onrender.com`.
