# ✅ DentalFlow - Checklist de Desenvolvimento

## 📊 Visão Geral do Progresso

**Fase Atual**: Fase 1 - MVP Básico (Mês 1-2)  
**Status**: Pronto para Começar 🚀  
**Próximo Marco**: Setup Completo + Login Funcionando

---

## 🏗️ FASE 0: Setup Inicial (Semana 1)

Prepara o ambiente para desenvolvimento

- [ ] **Criar estrutura de pastas**
  - [ ] Pasta `dental-flow/`
  - [ ] Pasta `backend/` com venv
  - [ ] Pasta `frontend/`
  - [ ] `.gitignore` configurado

- [ ] **Backend**
  - [ ] Python 3.11+ instalado
  - [ ] Virtual environment criado
  - [ ] Dependências instaladas (requirements.txt)
  - [ ] `.env` configurado
  - [ ] `app/main.py` criado e rodando

- [ ] **Frontend**
  - [ ] Node.js + npm instalado
  - [ ] Projeto Vite criado
  - [ ] Dependências instaladas
  - [ ] `tailwindcss` configurado
  - [ ] `npm run dev` funcionando

- [ ] **Git**
  - [ ] Repositório criado
  - [ ] `.gitignore` pronto
  - [ ] Primeiro commit

**Estimado**: 2-3 horas

---

## 🔐 FASE 1: Autenticação (Semana 1-2)

Implementa login seguro com CPF e senha

### Backend

- [ ] **Models de Database**
  - [ ] Model `Usuario` criado
  - [ ] Campos: CPF, email, nome, senha_hash, role, criado_em
  - [ ] Índices e constraints corretos
  - [ ] Relacionamentos estabelecidos

- [ ] **Segurança**
  - [ ] Hash de senhas com bcrypt
  - [ ] JWT implementation
  - [ ] Validação de CPF real (algoritmo dos dígitos)
  - [ ] Rate limiting (brute force protection)

- [ ] **Endpoints de Autenticação**
  - [ ] `POST /api/v1/auth/register` - Cadastro
  - [ ] `POST /api/v1/auth/login` - Login
  - [ ] `POST /api/v1/auth/refresh` - Renovar token
  - [ ] `GET /api/v1/auth/me` - Perfil do usuário

- [ ] **Testes Backend**
  - [ ] Teste registro com CPF válido/inválido
  - [ ] Teste login com credenciais corretas/incorretas
  - [ ] Teste tokens JWT
  - [ ] Teste refresh token

### Frontend

- [ ] **Páginas**
  - [ ] Página de login criada
  - [ ] Página de registro criada
  - [ ] Validação de formulários

- [ ] **Estado Global**
  - [ ] Zustand store para autenticação
  - [ ] Persistência em localStorage
  - [ ] Logout funcional

- [ ] **Integração API**
  - [ ] Axios client configurado
  - [ ] Interceptor para token
  - [ ] Handleamento de erros 401

- [ ] **Proteção de Rotas**
  - [ ] ProtectedRoute component
  - [ ] Redirecionamento para login
  - [ ] Salvamento de token

### QA

- [ ] Testar registro completo
- [ ] Testar login com CPF válido
- [ ] Testar login com CPF inválido
- [ ] Testar logout
- [ ] Testar refresh token
- [ ] Testar proteção de rotas

**Estimado**: 3-4 dias

---

## 📅 FASE 2: Agendamentos (Semana 2-3)

Implementa criação e visualização de agendamentos

### Backend

- [ ] **Model Agendamento**
  - [ ] Campos: id, usuario_id, data_hora, tipo_consulta, status, notas
  - [ ] Enum de status (agendado, confirmado, cancelado)
  - [ ] Timestamp (criado_em, atualizado_em)

- [ ] **Endpoints CRUD**
  - [ ] `GET /api/v1/agendamentos` - Listar agendamentos do usuário
  - [ ] `GET /api/v1/agendamentos/{id}` - Detalhe de agendamento
  - [ ] `POST /api/v1/agendamentos` - Criar agendamento
  - [ ] `PUT /api/v1/agendamentos/{id}` - Editar agendamento
  - [ ] `DELETE /api/v1/agendamentos/{id}` - Cancelar agendamento

- [ ] **Lógica de Negócio**
  - [ ] Validação de horários (não sobrepor)
  - [ ] Horário mínimo (ex: 30 min antes do fechamento)
  - [ ] Cancelamento com antecedência mínima
  - [ ] Filtros (por status, por data, por paciente)

- [ ] **Validações**
  - [ ] Verificar permissões (paciente vê seus agendamentos)
  - [ ] Verificar horários conflitantes
  - [ ] Validar tipos de consulta

### Frontend

- [ ] **Páginas**
  - [ ] Página de agendamentos criada
  - [ ] Formulário de novo agendamento
  - [ ] Modal de edição

- [ ] **Componentes**
  - [ ] Lista de agendamentos
  - [ ] Card de agendamento
  - [ ] Formulário com validation
  - [ ] Modal de confirmação (cancelamento)

- [ ] **Estado**
  - [ ] Zustand store para agendamentos
  - [ ] Ações: listar, criar, editar, deletar
  - [ ] Loading e error states

- [ ] **UI/UX**
  - [ ] Filtros (status, data)
  - [ ] Sorting (próximos agendamentos primeiro)
  - [ ] Empty state quando não há agendamentos

### QA

- [ ] Criar novo agendamento
- [ ] Editar agendamento existente
- [ ] Cancelar agendamento
- [ ] Validar horários conflitantes
- [ ] Listar agendamentos por data
- [ ] Testar permissões

**Estimado**: 3-4 dias

---

## 👥 FASE 3: Pacientes (Semana 3)

Implementa gestão de dados de pacientes

### Backend

- [ ] **Model Paciente**
  - [ ] Campos: id, usuario_id, telefone, endereco, data_nascimento
  - [ ] Relacionamento com Usuario
  - [ ] Histórico de alterações

- [ ] **Endpoints CRUD**
  - [ ] `GET /api/v1/pacientes` - Listar
  - [ ] `GET /api/v1/pacientes/{id}` - Detalhe
  - [ ] `POST /api/v1/pacientes` - Criar
  - [ ] `PUT /api/v1/pacientes/{id}` - Editar
  - [ ] `DELETE /api/v1/pacientes/{id}` - Deletar

- [ ] **Validações**
  - [ ] Telefone válido (formato)
  - [ ] Data de nascimento válida
  - [ ] Endereco obrigatório

### Frontend

- [ ] **Páginas**
  - [ ] Página de pacientes
  - [ ] Formulário de paciente
  - [ ] Detalhes de paciente

- [ ] **Componentes**
  - [ ] Tabela de pacientes
  - [ ] Formulário com validation
  - [ ] Ações (editar, deletar)

- [ ] **Busca e Filtros**
  - [ ] Busca por nome
  - [ ] Ordenação por data
  - [ ] Paginação

### QA

- [ ] CRUD completo de pacientes
- [ ] Validação de dados
- [ ] Busca funcional
- [ ] Permissões

**Estimado**: 2-3 dias

---

## 📊 FASE 4: Dashboard (Semana 4)

Implementa visão geral do sistema

### Backend

- [ ] **Endpoints de Dashboard**
  - [ ] `GET /api/v1/dashboard/stats` - Estatísticas gerais
  - [ ] `GET /api/v1/dashboard/proximos-agendamentos` - Próximas 5 consultas
  - [ ] `GET /api/v1/dashboard/pacientes-recentes` - Últimos pacientes
  - [ ] `GET /api/v1/dashboard/faturamento-mes` - Receita do mês

### Frontend

- [ ] **Componentes**
  - [ ] Cards de estatísticas
  - [ ] Gráfico de agendamentos
  - [ ] Lista de próximas consultas
  - [ ] Informações do consultório

- [ ] **Layout**
  - [ ] Navbar com menu
  - [ ] Sidebar com navegação
  - [ ] Breadcrumbs

### QA

- [ ] Dashboard carrega dados corretamente
- [ ] Estatísticas são precisas
- [ ] Layout responsivo

**Estimado**: 2-3 dias

---

## 💳 FASE 5: Pagamento com Stripe (Semana 5)

Implementa sistema de cobrança

### Backend

- [ ] **Integração Stripe**
  - [ ] Account Stripe criado
  - [ ] Secret key configurado
  - [ ] Model Pagamento criado

- [ ] **Endpoints**
  - [ ] `POST /api/v1/pagamentos/criar-checkout` - Iniciar pagamento
  - [ ] `POST /api/v1/pagamentos/webhook` - Webhook do Stripe
  - [ ] `GET /api/v1/pagamentos/historico` - Histórico de pagamentos

- [ ] **Webhook Stripe**
  - [ ] Receber confirmação de pagamento
  - [ ] Atualizar status do agendamento
  - [ ] Enviar recibo por email

### Frontend

- [ ] **Componentes**
  - [ ] Botão de pagamento
  - [ ] Redirect para Stripe Checkout
  - [ ] Confirmação de pagamento

- [ ] **Fluxo**
  - [ ] Após agendar, opção de pagar
  - [ ] Redireção para Stripe
  - [ ] Confirmação na volta

### QA

- [ ] Teste em modo de teste do Stripe
- [ ] Validar webhook
- [ ] Testar fluxo completo

**Estimado**: 3-4 dias

---

## 📧 FASE 6: Notificações & Emails (Semana 6)

Implementa automação de comunicação

### Backend

- [ ] **Integração Email**
  - [ ] SendGrid ou similar configurado
  - [ ] Templates de email criados
  - [ ] Celery para background tasks

- [ ] **Emails Automáticos**
  - [ ] Confirmação de agendamento
  - [ ] Lembretes (24h antes)
  - [ ] Recibo de pagamento
  - [ ] Confirmação de registro

- [ ] **Background Jobs**
  - [ ] Task para enviar lembretes
  - [ ] Agendador (Celery Beat)
  - [ ] Logs de envios

### Frontend

- [ ] **Preferências**
  - [ ] Opção de receber lembretes
  - [ ] Histórico de notificações

### QA

- [ ] Teste envio de emails
- [ ] Teste lembretes automáticos
- [ ] Validar templates

**Estimado**: 2-3 dias

---

## 🔒 FASE 7: Segurança & Testes (Semana 7)

Implementa testes e segurança

### Backend

- [ ] **Testes Unitários**
  - [ ] Testes de autenticação
  - [ ] Testes de agendamentos
  - [ ] Testes de validação

- [ ] **Testes de Integração**
  - [ ] API endpoints
  - [ ] Database
  - [ ] Fluxos completos

- [ ] **Segurança**
  - [ ] SQL injection prevention
  - [ ] XSS prevention
  - [ ] CSRF protection
  - [ ] Rate limiting
  - [ ] Validação de input

### Frontend

- [ ] **Testes**
  - [ ] Testes de componentes
  - [ ] Testes de integração
  - [ ] Testes E2E (opcional)

- [ ] **Performance**
  - [ ] Bundle size optimization
  - [ ] Lazy loading
  - [ ] Caching

### QA

- [ ] Cobertura de testes >80%
- [ ] Sem avisos de segurança
- [ ] Performance adequada

**Estimado**: 3-4 dias

---

## 🚀 FASE 8: Deploy & Production (Semana 8)

Prepara para produção

### Infraestrutura

- [ ] **Database**
  - [ ] PostgreSQL em produção
  - [ ] Backup automático
  - [ ] Migrations rodadas

- [ ] **Backend**
  - [ ] Dockerfile pronto
  - [ ] CI/CD configurado
  - [ ] Health checks
  - [ ] Logs centralizados

- [ ] **Frontend**
  - [ ] Build production otimizado
  - [ ] CDN configurado
  - [ ] HTTPS ativo

- [ ] **Hosting**
  - [ ] Servidor escolhido (DigitalOcean, AWS, etc)
  - [ ] Domínio apontado
  - [ ] SSL certificate

- [ ] **Monitoramento**
  - [ ] Error tracking (Sentry)
  - [ ] Analytics
  - [ ] Logs
  - [ ] Alertas

### QA

- [ ] Teste completo em produção
- [ ] Teste de performance
- [ ] Teste de segurança
- [ ] Disaster recovery

**Estimado**: 3-4 dias

---

## 📈 FASE 9: Features Avançadas (Mês 2-3+)

Melhorias e escalabilidade

- [ ] Multi-dentista
- [ ] Integração Google Calendar
- [ ] Link público para agendamento
- [ ] Prontuário eletrônico (PEP)
- [ ] Relatórios avançados
- [ ] App mobile
- [ ] WhatsApp/Telegram notificações

---

## 📊 RESUMO DE PROGRESSO

```
Fase 0 (Setup)           ░░░░░░░░░░ 0%
Fase 1 (Autenticação)    ░░░░░░░░░░ 0%
Fase 2 (Agendamentos)    ░░░░░░░░░░ 0%
Fase 3 (Pacientes)       ░░░░░░░░░░ 0%
Fase 4 (Dashboard)       ░░░░░░░░░░ 0%
Fase 5 (Pagamento)       ░░░░░░░░░░ 0%
Fase 6 (Emails)          ░░░░░░░░░░ 0%
Fase 7 (Testes)          ░░░░░░░░░░ 0%
Fase 8 (Deploy)          ░░░░░░░░░░ 0%

PROGRESSO TOTAL:         ░░░░░░░░░░ 0%
```

---

## 🎯 Dicas para Sucesso

1. **Faça commits frequentes** - A cada feature funcionando
2. **Teste enquanto desenvolve** - Não deixe para o final
3. **Documente o código** - Seus comentários são seus amigos
4. **Use branches** - Git flow (feature/, bugfix/, etc)
5. **Comunique progresso** - Célula ou stakeholder
6. **Tome breaks** - Desenvolver é uma maratona

---

## 📞 Suporte

Qualquer dúvida:
1. Consulte a documentação (GUIA_PRATICO_COMECO.md)
2. Verifique a arquitetura (saas_arquitetura.md)
3. Stack Overflow
4. Comunidades

---

**Você consegue! 💪🚀**

Última atualização: Hoje  
Próximo review: Após Fase 1
