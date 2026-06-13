# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Comandas do Zé** — sistema de gerenciamento de pedidos para restaurantes. Composto por dois projetos separados:

- **Frontend** (este repo): React SPA em `C:\Dev\comandas_app`
- **Backend API**: FastAPI Python em `C:\Users\peter\OneDrive\Documentos\Pet\Sistemas De Informação\Desenvolvimento de Sistemas\Comandas_api`

Todos os nomes de domínio, variáveis e componentes estão em **português**.

## Commands

### Frontend

Todos os comandos devem ser executados a partir do diretório `frontend/`:

```bash
npm run dev      # Servidor de desenvolvimento com HMR (Vite)
npm run build    # Build de produção
npm run lint     # ESLint
npm run preview  # Preview do build de produção
```

Não há testes configurados no projeto.

### Backend API

Executar a partir do diretório `src/` da API:

```bash
# Ativar virtual environment (Windows)
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Rodar em desenvolvimento
cd src
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Rodar com Docker (MySQL incluso)
cd src
docker-compose up -d
```

Documentação interativa disponível em `http://localhost:8000/docs` (Swagger) e `/redoc` quando a API está rodando.

## Architecture

### Stack

- **React 19** + **Vite 8** (JSX, sem TypeScript)
- **React Router DOM 7** com lazy loading e Suspense
- **Material-UI (MUI) 9** + Emotion para estilos
- **React Hook Form 7** para formulários
- **Axios 1.16** com interceptors para autenticação JWT
- **react-imask** para máscaras de CPF e telefone

### Estrutura de camadas (`frontend/src/`)

```
config/       → apiConfig.js: todos os endpoints da API centralizados
services/     → Camada HTTP: api.js (instância Axios) + um arquivo por entidade
context/      → AuthContext.jsx: estado global de autenticação (JWT + refresh)
routes/       → Router.jsx: definição de rotas com PrivateRoute/RestrictedRoute
hooks/        → useValidationRules.js, useMasks.js
utils/        → showSnackbar(), showConfirm() via CustomEvent
pages/        → Um arquivo por tela (lista ou formulário)
components/
  common/     → Componentes reutilizáveis (ActionButtons, Pagination, Navbar)
  forms/      → Formulários específicos (LoginForm)
constants/    → Enums (comandaStatus)
theme.js      → Tema MUI: primária slate (#1e293b), secundária amber (#f59e0b)
```

### Autenticação

`AuthContext.jsx` gerencia o ciclo de vida do JWT:
- Tokens (`access_token` + `refresh_token`) armazenados em `sessionStorage`
- O interceptor de resposta em `services/api.js` captura erros 401 e faz refresh automático antes de retentar a requisição
- Hook `useAuth()` para consumir o contexto em qualquer componente

### API e configuração de ambiente

A API backend roda em `https://localhost:8443`. O Vite faz proxy de `/api` para esse destino durante o desenvolvimento.

Variáveis configuráveis em `frontend/.env`:

```
VITE_API_BASE_URL=    # Padrão: /api
VITE_API_TIMEOUT=     # Padrão: 15000ms
VITE_PROXY_TARGET=    # Padrão: https://localhost:8443
VITE_PROXY_SECURE=    # false para dev (ignora SSL auto-assinado)
```

### Padrões de página

**Formulários** (`pages/*Form.jsx`):
- React Hook Form com `Controller` + campos MUI
- Modo determinado pela URL: `?opr=view`, `?opr=edit`, ou sem `opr` (criação)
- Em edição, envia apenas os campos alterados (`dirtyFields`)
- Feedback ao usuário via `showSnackbar()` (CustomEvent → componente global)

**Listas** (`pages/*List.jsx`):
- Tabela MUI com paginação e filtros
- Exclusão precedida de diálogo de confirmação via `showConfirm()`
- Ações de visualizar/editar/excluir via `ActionButtons`

### Entidades do domínio

`Funcionário` → `Cliente` → `Produto` → `Comanda` (com itens de consumo) → `Recebimento`

Todos os endpoints estão declarados em `frontend/src/config/apiConfig.js`.

---

## Backend API (FastAPI Python)

Localização: `C:\Users\peter\OneDrive\Documentos\Pet\Sistemas De Informação\Desenvolvimento de Sistemas\Comandas_api`

### Stack do Backend

- **FastAPI 0.135** + **Uvicorn** (dev) / **Hypercorn** (prod, suporta QUIC/HTTP3)
- **SQLAlchemy 2.0** async com `AsyncSession`
- **MySQL 8** em produção (Docker) / SQLite em dev local
- **Pydantic v2** para validação e schemas
- **python-jose** para JWT HS256 + **bcrypt** para senhas
- **SlowAPI** para rate limiting

### Estrutura do Backend (`src/`)

```
main.py              → Entry point: lifespan (cria tabelas no startup), middlewares, routers
settings.py          → Leitura das variáveis de ambiente via .env
domain/schemas/      → Schemas Pydantic por entidade (Create, Update, Response)
infra/
  database.py        → Engines SQLAlchemy, sessions (síncrona e assíncrona), cria_tabelas()
  security.py        → Geração/validação de JWT, hash bcrypt
  dependencies.py    → Dependências FastAPI: get_current_user(), require_group()
  rate_limit.py      → Configuração do SlowAPI com 5 níveis de limite
  middleware/        → IPAccessMiddleware (controle de CORS/IP)
  orm/               → Modelos SQLAlchemy (um arquivo por tabela tb_*)
routers/             → Endpoints REST por entidade (um arquivo por router)
services/            → AuditoriaService: registra todas as ações no BD
enums/               → tiposPagamentosEnum
```

### Autenticação no Backend

- Login via `POST /auth/login` com CPF + senha
- Retorna `access_token` (15 min) e `refresh_token` (7 dias)
- Renovação via `POST /auth/refresh`
- Todas as rotas protegidas usam `Depends(get_current_active_user)` ou `Depends(require_group([n]))`
- Tabelas criadas automaticamente no startup via `Base.metadata.create_all()`

### Grupos de usuários

| Grupo | Perfil |
|-------|--------|
| 1 | Admin (acesso total) |
| 2 | Balcão (pedidos) |
| 3 | Caixa (pagamentos) |

### Variáveis de ambiente do backend (`src/.env`)

```
DB_SGDB=mysql        # sqlite, mysql ou mssql
DB_HOST=db
DB_PORT=3307
DB_NAME=comandas_db
SECRET_KEY=...       # Chave JWT
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
PORT=8443
CORS_ORIGINS=*
```

### Rate Limiting

5 níveis configuráveis via `.env`: `critical` (5/min), `restrictive` (20/min), `moderate` (100/min), `low` (200/min), `default` (50/min). Aplicado por decorator `@limiter.limit(get_rate_limit("nivel"))` em cada endpoint.

### Auditoria

Todo CREATE, UPDATE, DELETE e LOGIN é registrado em `tb_auditoria` via `AuditoriaService`, incluindo IP, user-agent, dados anteriores e novos.
