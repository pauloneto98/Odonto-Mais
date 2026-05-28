# OdontoClip - Resumo do Projeto

## O que e
Sistema web completo de agendamento para clinica odontologica (clique-e-veja).

## Stack
- **Backend**: Node.js + Express + JWT (auth) + bcryptjs + CORS
- **Frontend**: React 18 + Vite + TailwindCSS + Zustand (state) + Axios + React Router
- **Testes**: Vitest + Supertest (backend) + @testing-library/react (frontend)
- **Git**: GitFlow (branches: main, develop)

## Estrutura
```
C:\Odonto\
  backend/
    server.js          # API REST completa
    test/api.test.js   # 27 testes de API
    package.json
  frontend/
    src/
      pages/
        Login.jsx         # Tela de login
        Register.jsx      # Cadastro com validacao CPF
        Dashboard.jsx     # Painel do usuario
        Agendamentos.jsx  # CRUD completo de agendamentos
      services/api.js     # Axios com interceptors (JWT)
      store/authStore.js  # Zustand (auth state)
      test/
        authStore.test.js # 3 testes do store
        pages.test.jsx    # 12 testes de componentes
    index.html
    vite.config.js    # Config com proxy /api -> :3000
  .gitignore
```

## Funcionalidades implementadas
1. **Auth**: Registro (CPF validado), Login, JWT, Logout, Profile
2. **Dentistas**: 4 profissionais com especialidade, avatar, CRO, avaliacao
3. **Servicos**: 8 procedimentos (Limpeza R$120, Restauracao R$180, Canal R$800, Clareamento R$600, etc.)
4. **Agendamentos CRUD**: Criar, listar, editar, cancelar com codigo unico (ODT-XXXXXX)
5. **Selecao**: Dentista -> Data -> Horario (slots 30min, 08:00-17:30) -> Servicos (multipla escolha)
6. **Verificacao de conflito**: Impede duplo agendamento no mesmo horario/dentista
7. **Dashboard**: Stats (hoje, total, cancelados) + proximos agendamentos
8. **Filtro**: Filtrar agendamentos por data

## Dados iniciais
### Dentistas
| ID | Nome | Especialidade |
|----|------|---------------|
| 1 | Dra. Maria Silva | Odontologia Geral |
| 2 | Dr. Carlos Oliveira | Ortodontia |
| 3 | Dra. Ana Santos | Endodontia |
| 4 | Dr. Pedro Costa | Periodontia |

### Servicos
| ID | Nome | Preco | Duracao |
|----|------|-------|---------|
| 1 | Limpeza e Profilaxia | R$120 | 40min |
| 2 | Consulta de Avaliacao | R$150 | 30min |
| 3 | Restauracao | R$180 | 40min |
| 4 | Tratamento de Canal | R$800 | 60min |
| 5 | Clareamento Dental | R$600 | 90min |
| 6 | Extracao Dentaria | R$350 | 45min |
| 7 | Avaliacao Ortodontica | R$200 | 40min |
| 8 | Aplicacao de Fluor | R$80 | 20min |

## Endpoints da API
| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | /api/register | Nao | Registro de usuario |
| POST | /api/login | Nao | Login (retorna JWT) |
| GET | /api/profile | Sim | Perfil do usuario |
| GET | /api/dentistas | Nao | Lista dentistas |
| GET | /api/dentistas/:id | Nao | Dentista por ID |
| GET | /api/servicos | Nao | Lista servicos |
| GET | /api/servicos/:id | Nao | Servico por ID |
| GET | /api/horarios/:data | Nao | Horarios disponiveis |
| GET | /api/agendamentos | Sim | Lista agendamentos |
| POST | /api/agendamentos | Sim | Criar agendamento |
| PUT | /api/agendamentos/:id | Sim | Atualizar agendamento |
| DELETE | /api/agendamentos/:id | Sim | Cancelar agendamento |
| GET | /api/dashboard/stats | Sim | Estatisticas |

## Testes
- **42 testes** todos passando
- Backend: auth, dentistas, servicos, horarios, agendamentos CRUD, dashboard
- Frontend: authStore (logout, clearError), pages (Login, Register, Dashboard renderizacao)

## Como rodar
```bash
# Backend (porta 3000)
cd backend && npm install && npm run dev

# Frontend (porta 5173)
cd frontend && npm install && npm run dev

# Testes
cd backend && npm test
cd frontend && npm test
```

## Git / GitHub
- Repo: https://github.com/pauloneto98/Odonto-Mais
- Branches: `main` (producao), `develop` (desenvolvimento)
- Estrategia: GitFlow

## Cores / Tema
- Gradiente principal: teal-500 -> blue-600
- Accent: teal-600/700
- Logo: emoji 🦷
- Nome do app: **OdontoClip**

## Pendencias / Proximos passos
- [ ] Banco de dados real (SQLite/PostgreSQL) em vez de Map em memoria
- [ ] CRUD de dentistas/servicos (criar/editar/deletar pelo admin)
- [ ] Painel administrativo
- [ ] Envio de email/SMS de confirmacao
- [ ] Calendario visual
- [ ] Relatorios
- [ ] Deploy
