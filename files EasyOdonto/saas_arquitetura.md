# DentalFlow - SaaS Odontológico Profissional

## 📋 VISÃO GERAL

**Objetivo**: Plataforma de agendamento odontológico para um consultório, com dashboard administrativo, gestão de pacientes e sistema de pagamento.

**Timeline**: 6+ meses
**Escopo**: Single-tenant (um consultório por conta)
**Modelo**: SaaS - Monthly subscription

---

## 🏗️ ARQUITETURA TÉCNICA

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ├─ Dashboard Paciente (agendamento)                    │
│  ├─ Dashboard Dentista (gestão)                         │
│  └─ Admin (faturamento, relatórios)                     │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────────────┐
│            BACKEND (FastAPI + Python)                    │
│  ├─ API REST (autenticação, agendamentos)               │
│  ├─ Websockets (notificações em tempo real)             │
│  ├─ Background jobs (lembretes, relatórios)             │
│  └─ Integração pagamento (Stripe/Mercado Pago)          │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
┌───▼──┐  ┌─────▼──┐  ┌──────▼────┐  ┌─────▼────┐
│  DB  │  │ Redis  │  │  Storage  │  │ Email    │
│ Psql │  │ Cache  │  │  (S3/GCS) │  │ Service  │
└──────┘  └────────┘  └───────────┘  └──────────┘
```

---

## 🛠️ STACK RECOMENDADO

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Banco de dados**: PostgreSQL (relacional, confiável)
- **Cache**: Redis (sessões, cache de dados)
- **ORM**: SQLAlchemy
- **Autenticação**: JWT + Refresh tokens
- **Background jobs**: Celery + Redis (lembretes de consultas)
- **Pagamento**: Stripe ou Mercado Pago SDK
- **Email**: SendGrid ou Mailgun
- **Validação**: Pydantic

### Frontend
- **Framework**: React 18+
- **Estado global**: Zustand ou Context API
- **UI Components**: Shadcn/ui ou Material-UI
- **HTTP Client**: Axios ou Fetch
- **Form validation**: React Hook Form
- **Styling**: Tailwind CSS
- **Calendar**: React Big Calendar ou FullCalendar
- **Notificações**: Toast (react-hot-toast)

### Infraestrutura
- **VCS**: GitHub/GitLab
- **CI/CD**: GitHub Actions
- **Containerização**: Docker
- **Orquestração**: Docker Compose (desenvolvimento), Kubernetes (production)
- **Hosting Backend**: AWS EC2 / DigitalOcean / Railway / Render
- **Hosting Frontend**: Vercel / Netlify / AWS S3 + CloudFront
- **Banco de dados**: AWS RDS / DigitalOcean Managed Database
- **Email SMTP**: SendGrid
- **Pagamento**: Stripe (recomendado para Brasil)

---

## 📁 ESTRUTURA DO PROJETO

```
dental-flow/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Entrada da aplicação
│   │   ├── config.py               # Variáveis de ambiente
│   │   ├── dependencies.py         # Injeção de dependências
│   │   ├── middleware.py           # CORS, rate limiting, etc
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py         # Login, registro, refresh token
│   │   │   │   ├── pacientes.py    # CRUD pacientes
│   │   │   │   ├── agendamentos.py # CRUD agendamentos
│   │   │   │   ├── dentistas.py    # Perfil, horários disponíveis
│   │   │   │   ├── pagamentos.py   # Webhook Stripe
│   │   │   │   └── relatorios.py   # Dados para dashboard
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── usuario.py          # User, Dentista, Admin
│   │   │   ├── paciente.py         # Paciente
│   │   │   ├── agendamento.py      # Agendamento
│   │   │   ├── pagamento.py        # Pagamento
│   │   │   └── audit_log.py        # Histórico de ações
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── usuario.py          # Pydantic models
│   │   │   ├── paciente.py
│   │   │   ├── agendamento.py
│   │   │   └── pagamento.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py     # Lógica de autenticação
│   │   │   ├── agendamento_service.py
│   │   │   ├── pagamento_service.py  # Integração Stripe
│   │   │   ├── email_service.py    # Envio de emails
│   │   │   └── notificacao_service.py
│   │   │
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── database.py         # Conexão PostgreSQL
│   │   │   ├── session.py          # Session manager
│   │   │   └── migrations/         # Alembic migrations
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── security.py         # Hash, JWT
│   │   │   ├── validators.py       # Validação CPF, email
│   │   │   └── constants.py        # Constantes da app
│   │   │
│   │   └── tasks/
│   │       ├── __init__.py
│   │       ├── email_tasks.py      # Tasks Celery
│   │       └── notification_tasks.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_agendamentos.py
│   │   └── test_pagamentos.py
│   │
│   ├── .env.example                # Template de variáveis
│   ├── requirements.txt            # Dependências Python
│   ├── Dockerfile                  # Imagem Docker
│   ├── docker-compose.yml          # Serviços locais
│   ├── alembic.ini                 # Migrações DB
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AgendamentosPage.jsx
│   │   │   ├── PacientesPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── 404Page.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegistroForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── Agendamentos/
│   │   │   │   ├── CalendarView.jsx
│   │   │   │   ├── AgendamentoForm.jsx
│   │   │   │   ├── AgendamentoCard.jsx
│   │   │   │   └── CancelamentoModal.jsx
│   │   │   │
│   │   │   ├── Pacientes/
│   │   │   │   ├── PacientesList.jsx
│   │   │   │   ├── PacienteForm.jsx
│   │   │   │   └── PacienteDetails.jsx
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── Loading.jsx
│   │   │       ├── ErrorBoundary.jsx
│   │   │       └── Toast.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   ├── useNotification.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── agendamentoService.js
│   │   │   ├── pacienteService.js
│   │   │   └── pagamentoService.js
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js     # Zustand store
│   │   │   ├── agendamentoStore.js
│   │   │   └── notificationStore.js
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   │
│   │   └── styles/
│   │       ├── tailwind.config.js
│   │       └── globals.css
│   │
│   ├── package.json
│   ├── .env.example
│   ├── vite.config.js
│   └── README.md
│
├── docker-compose.yml         # Desenvolvimento
├── .github/
│   └── workflows/
│       ├── backend-tests.yml
│       ├── frontend-build.yml
│       └── deploy.yml
│
└── README.md                  # Documentação geral
```

---

## 📅 ROADMAP (6+ MESES)

### FASE 1: MVP Básico (Mês 1-2)
**Objetivo**: Funcionalidades mínimas viáveis

- [x] Setup projeto (estrutura, Docker, banco de dados)
- [x] Autenticação (login/registro com CPF)
- [x] CRUD Agendamentos (criar, editar, deletar)
- [x] CRUD Pacientes (cadastro básico)
- [x] Calendar simples (visualizar horários)
- [x] API REST funcional
- [x] Validação de dados
- [x] Deploy local (Docker Compose)

**Saída**: Você consegue agendar uma consulta e o dentista vê no calendário

---

### FASE 2: Dashboard & UX (Mês 2-3)
**Objetivo**: Interface profissional e intuitiva

- [ ] Dashboard do dentista (visão geral, próximas consultas)
- [ ] Dashboard do paciente (meus agendamentos)
- [ ] Calendar avançado (drag-drop, cores por tipo)
- [ ] Formulário de paciente (anamnese básica)
- [ ] Notificações (toast, email preview)
- [ ] Responsividade mobile
- [ ] Loading states e error handling
- [ ] Dark mode (bônus)

**Saída**: Interface bonita, profissional, usável

---

### FASE 3: Pagamento (Mês 3-4)
**Objetivo**: Monetização e fluxo de pagamento

- [ ] Integração Stripe (ou Mercado Pago)
- [ ] Checkout simples
- [ ] Webhook Stripe (confirmação pagamento)
- [ ] Invoice/recibo automático
- [ ] Histórico de pagamentos
- [ ] Teste de pagamento (modo teste Stripe)

**Saída**: Você consegue cobrar pelos agendamentos

---

### FASE 4: Notificações & Emails (Mês 4-5)
**Objetivo**: Automação e comunicação

- [ ] Envio de email confirmação de agendamento
- [ ] Lembretes automáticos (24h antes)
- [ ] Cancelamento automático de consultas antigas
- [ ] SMS (opcional, mais complexo)
- [ ] Template de emails profissional
- [ ] Test de emails em staging

**Saída**: Pacientes recebem lembretes automaticamente

---

### FASE 5: Admin & Relatórios (Mês 5-6)
**Objetivo**: Gerenciamento e insights

- [ ] Painel admin (lista de usuários, permissões)
- [ ] Relatórios básicos (faturamento, pacientes por mês)
- [ ] Exportar dados (PDF, Excel)
- [ ] Logs de auditoria (quem fez o quê)
- [ ] Backup automático
- [ ] Métricas no dashboard (agendamentos, receita)

**Saída**: Você tem visibilidade total do consultório

---

### FASE 6: Production & Scale (Mês 6+)
**Objetivo**: Deploy profissional e pronto para produção

- [ ] Deploy em servidor real (AWS, DigitalOcean, etc)
- [ ] SSL/HTTPS automático
- [ ] CI/CD automatizado (GitHub Actions)
- [ ] Monitoramento (Sentry, DataDog)
- [ ] Testes automatizados (80%+ cobertura)
- [ ] Documentação API (Swagger)
- [ ] Rate limiting, segurança
- [ ] Cache Redis otimizado

**Saída**: Sistema robusto em produção

---

### FASE 7+: Features Avançadas (Mês 6+)
**Opcional (conforme feedback)**

- [ ] Multi-dentista (vários dentistas no mesmo consultório)
- [ ] Integração Google Calendar
- [ ] Agendamento online por link público
- [ ] Prontuário eletrônico (PEP)
- [ ] WhatsApp/Telegram notificações
- [ ] App mobile nativa (React Native)
- [ ] Integração com softwares de gestão existentes

---

## 🔐 CHECKLIST DE SEGURANÇA

### Autenticação & Autorização
- [ ] Senhas hasheadas com bcrypt (nunca plain text)
- [ ] JWT com refresh tokens
- [ ] CSRF protection
- [ ] Rate limiting (brute force protection)
- [ ] 2FA (opcional, mas recomendado)

### Dados
- [ ] Criptografia em transit (HTTPS/TLS)
- [ ] Criptografia em repouso (dados sensíveis)
- [ ] LGPD compliance (consentimento, direito ao esquecimento)
- [ ] Backup automático
- [ ] Logs de auditoria

### API
- [ ] Input validation (Pydantic)
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention
- [ ] CORS configurado
- [ ] Rate limiting por IP/usuário

### Infraestrutura
- [ ] Environment variables (nunca hardcoded)
- [ ] Secrets management
- [ ] Firewall/VPC configurado
- [ ] WAF (Web Application Firewall)
- [ ] Monitoramento de logs

---

## 💰 CUSTOS ESTIMADOS (Monthly)

| Serviço | Plano | Custo |
|---------|-------|-------|
| Hosting Backend | DigitalOcean App | $12 |
| Database | DigitalOcean Managed DB | $15 |
| Frontend Hosting | Vercel | FREE |
| Email | SendGrid (100 emails/dia) | FREE |
| Pagamento | Stripe (2.9% + fee) | Por transação |
| Monitoramento | Sentry Free | FREE |
| Domínio | Namecheap | $9/ano |
| **TOTAL** | | **~$30-50/mês** |

*Obs: Para começar, você pode usar tudo local. Depois, conforme crescer, migra para cloud.*

---

## 🚀 PRÓXIMAS AÇÕES

1. **Setup inicial** (Dia 1-2)
   - Criar repositório GitHub
   - Setup backend com FastAPI
   - Setup frontend com React/Vite
   - Docker Compose local

2. **Banco de dados** (Dia 2-3)
   - Criar models (Usuario, Agendamento, Paciente)
   - Migrações com Alembic
   - Seeds (dados de teste)

3. **Autenticação** (Dia 3-4)
   - Login com CPF
   - Validação CPF real
   - JWT implementation

4. **API CRUD** (Dia 5-7)
   - Endpoints agendamentos
   - Endpoints pacientes
   - Testes básicos

5. **Frontend Login** (Dia 7-10)
   - Tela de login
   - Integração com API
   - Protected routes

Continua conforme progride...

---

## 📚 REFERÊNCIAS & RECURSOS

### Documentação Oficial
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/docs/
- Stripe: https://stripe.com/docs

### Cursos Recomendados
- FastAPI + PostgreSQL (YouTube: Code With Lewis)
- React Hooks (Scrimba)
- Full Stack Web Development (FreeCodeCamp)

### Ferramentas
- Postman/Insomnia (testar API)
- pgAdmin (gerenciar banco)
- VS Code (editor)
- Docker Desktop (containerização local)

### Comunidades
- Stack Overflow
- Dev.to
- GitHub Discussions

---

## 📞 SUPORTE & DÚVIDAS

Qualquer dúvida ao longo do desenvolvimento, temos:
1. Documentação deste arquivo
2. Código estruturado e comentado
3. Examples do FastAPI/React
4. Stack Overflow como backup

**Vamos começar!** 🚀
