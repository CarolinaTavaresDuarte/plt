# Plataa - Plataforma de Triagem e Atendimento ao Autista

Esta solução full stack implementa os requisitos funcionais e visuais solicitados para a plataforma Plataa, oferecendo backend com FastAPI, PostgreSQL e frontend em React (Vite).

## Estrutura do projeto

```
backend/   # Aplicação FastAPI, modelos de dados e regras de negócio
frontend/  # Aplicação React responsiva (Vite)
```

## Backend

- Framework: **FastAPI**
- Banco: **PostgreSQL** (host `5200.144.245.124`, porta `5432`, banco `db_grupo05`, usuário `grupo05`, senha `u_grupo05`)
- ORM: SQLAlchemy com três esquemas lógicos (`user_auth`, `specialist_auth`, `test_data`) representando as conexões pedidas.
- Autenticação: JWT com fluxo `OAuth2PasswordBearer`.
- Principais endpoints:
  - `POST /api/v1/auth/register` – cadastro de usuários (responsável ou especialista)
  - `POST /api/v1/auth/token` – login e emissão de token
  - `POST /api/v1/tests/testados` – cadastro de avaliado com consentimento
  - `POST /api/v1/tests/{cpf}/iniciar` – submissão de testes (registra resultado completo + anonimizado)
  - `GET /api/v1/tests/paciente/{cpf}` – dashboard do paciente/responsável
  - `GET /api/v1/tests/especialista/dashboard` – dashboard consolidado do especialista
  - `GET /api/v1/platform/metrics/platform-stats` – métricas de impacto
  - `POST /api/v1/platform/contact/submit` – formulário de contato

### Executando localmente

1. Crie um ambiente virtual e instale as dependências:

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Configure variáveis de ambiente (opcional, pois já existe padrão para o banco informado).

3. Execute o servidor:

```bash
uvicorn app.main:app --reload
```

O backend cria automaticamente os esquemas e tabelas necessários no PostgreSQL durante o evento de startup.

## Frontend

- Framework: **React 18** com **Vite**
- Estilo: CSS customizado mobile-first usando paleta azul (`#007bff`) e branco
- State/data: React Query para chamadas ao backend
- Funcionalidades:
  - Tela inicial com login (modal), identidade visual solicitada e seções institucionais
  - Conteúdo educativo e cards sobre ADOS-2, ADI-R, M-CHAT-R/F, ASSQ, AQ-10
  - Fluxo de cadastro do avaliado com consentimento, seleção de testes por faixa etária e wizard acessível de perguntas
  - Dashboards mockados/dinâmicos para responsáveis e especialistas, incluindo importação de arquivos fictícia
  - Formulário de contato integrado ao endpoint `/api/v1/platform/contact/submit`

### Executando o frontend

```bash
cd frontend
npm install
npm i react-router-dom
npm run dev
```

O Vite inicia em `http://localhost:5173` com proxy configurado para consumo direto do backend (ajuste `VITE_API_BASE_URL` se necessário).

## Observações

- Todos os testes obedecem à regra de unicidade CPF + tipo de teste.
- Resultados completos e registros anonimizados são criados em paralelo.
- O design segue princípios mobile-first, elementos sticky, hero com imagem de fundo sem overlay de cor sólida e efeitos de hover solicitados.

## Licença

Projeto acadêmico/demonstrativo.
