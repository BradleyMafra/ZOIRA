# Support Ticket Panel (Render Static Site + API)

Projeto completo com frontend em React (Vite) e backend em Node.js/Express com SQLite.

## Estrutura

```
.
├── backend
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   ├── seed.js
│   └── server.js
└── frontend
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src
        ├── App.jsx
        ├── main.jsx
        ├── components
        │   ├── FormField.jsx
        │   ├── MessageList.jsx
        │   └── StatusBadge.jsx
        ├── pages
        │   ├── AdminDashboard.jsx
        │   ├── AdminLogin.jsx
        │   ├── AdminTicket.jsx
        │   ├── OpenTicket.jsx
        │   └── TicketDetail.jsx
        ├── services
        │   └── api.js
        └── styles
            └── global.css
```

## Rodar localmente

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed # opcional
npm run dev
```

A API ficará em `http://localhost:3001`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A aplicação estará em `http://localhost:5173`.

## Deploy no Render

Se preferir, use o arquivo `render.yaml` na raiz para configurar o deploy automático (Blueprint). Ele já define `rootDir` para `backend` e `frontend`, evitando o erro de `package.json` não encontrado.

### Backend (Web Service)

1. Crie um **Web Service** apontando para o diretório `backend` (defina **Root Directory** como `backend`).
2. Build command: `npm install`
3. Start command: `npm start`
4. Configure as variáveis de ambiente:

```
PORT=3001
FRONTEND_ORIGIN=https://SEU-FRONTEND.onrender.com
ADMIN_USER=Luiz
ADMIN_PASS=MeninoDoTi
SESSION_SECRET=troque-este-segredo
DB_PATH=./data/tickets.db
```

### Frontend (Static Site)

1. Crie um **Static Site** apontando para o diretório `frontend`.
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Variáveis de ambiente:

```
VITE_API_URL=https://SEU-BACKEND.onrender.com
```

## Variáveis de ambiente

### Backend

- `PORT`: porta da API (Render define automaticamente).
- `FRONTEND_ORIGIN`: URL do site estático para CORS.
- `ADMIN_USER`: usuário do admin.
- `ADMIN_PASS`: senha do admin.
- `SESSION_SECRET`: segredo da sessão.
- `DB_PATH`: caminho do SQLite.

### Frontend

- `VITE_API_URL`: URL base da API.

## Notas

- As rotas `/api/admin/*` estão protegidas por cookie de sessão.
- A abertura de ticket gera uma chave de acesso para inserir mensagens pelo usuário.
- O rate limit no endpoint público está configurado para 10 requisições/minuto por IP.
