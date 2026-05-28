import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';

const app = express();
app.use(cors());
app.use(express.json());

const users = new Map();
const agendamentos = new Map();
const dentistas = new Map();
const servicos = new Map();

let agendamentoId = 1;

const dentistasIniciais = [
  { id: 1, nome: 'Dra. Maria Silva', especialidade: 'Odontologia Geral', avatar: '🦷', avaliacao: 4.9, total_atendimentos: 2450, sobre: 'CRO-SP 12345', ativo: true },
  { id: 2, nome: 'Dr. Carlos Oliveira', especialidade: 'Ortodontia', avatar: '😁', avaliacao: 4.8, total_atendimentos: 1890, sobre: 'CRO-SP 23456', ativo: true },
];

const servicosIniciais = [
  { id: 1, nome: 'Limpeza e Profilaxia', descricao: 'Limpeza profissional', preco: 120.00, duracao: '40 min', ativo: true },
  { id: 2, nome: 'Consulta de Avaliacao', descricao: 'Avaliacao completa', preco: 150.00, duracao: '30 min', ativo: true },
  { id: 3, nome: 'Restauracao', descricao: 'Restauracao em resina', preco: 180.00, duracao: '40 min', ativo: true },
];

dentistasIniciais.forEach(d => dentistas.set(d.id, d));
servicosIniciais.forEach(s => servicos.set(s.id, s));

const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
];

const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto > 9) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto > 9) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  return true;
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token nao fornecido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido' });
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, cpf, senha } = req.body;
    if (!nome || !email || !cpf || !senha) return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
    if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF invalido' });
    if (users.has(email)) return res.status(400).json({ error: 'E-mail ja cadastrado' });
    const hashedSenha = await bcrypt.hash(senha, 10);
    users.set(email, { nome, email, cpf, senha: hashedSenha });
    res.status(201).json({ message: 'Usuario registrado com sucesso', user: { nome, email } });
  } catch {
    res.status(500).json({ error: 'Erro ao registrar usuario' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha sao obrigatorios' });
    const user = users.get(email);
    if (!user) return res.status(401).json({ error: 'Credenciais invalidas' });
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais invalidas' });
    const token = jwt.sign({ userId: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login realizado com sucesso', token, user: { nome: user.nome, email: user.email } });
  } catch {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.get('/api/profile', authMiddleware, (req, res) => {
  const user = users.get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' });
  res.json({ nome: user.nome, email: user.email, cpf: user.cpf });
});

app.get('/api/dentistas', (req, res) => {
  res.json(Array.from(dentistas.values()).filter(d => d.ativo));
});

app.get('/api/dentistas/:id', (req, res) => {
  const dentista = dentistas.get(parseInt(req.params.id));
  if (!dentista) return res.status(404).json({ error: 'Dentista nao encontrado' });
  res.json(dentista);
});

app.get('/api/servicos', (req, res) => {
  res.json(Array.from(servicos.values()).filter(s => s.ativo));
});

app.get('/api/servicos/:id', (req, res) => {
  const servico = servicos.get(parseInt(req.params.id));
  if (!servico) return res.status(404).json({ error: 'Servico nao encontrado' });
  res.json(servico);
});

app.get('/api/horarios/:data', (req, res) => {
  const { data } = req.params;
  const { dentista_id } = req.query;
  const agendamentosDoDia = Array.from(agendamentos.values()).filter(
    a => a.data === data && (!dentista_id || a.dentista_id === parseInt(dentista_id)) && !a.cancelado
  );
  const horariosOcupados = agendamentosDoDia.map(a => a.horario);
  const horariosLivres = horariosDisponiveis.filter(h => !horariosOcupados.includes(h));
  res.json({ data, dentista_id: dentista_id ? parseInt(dentista_id) : null, horarios_disponiveis: horariosLivres, horarios_ocupados: horariosOcupados });
});

app.get('/api/agendamentos', authMiddleware, (req, res) => {
  const { data, dentista_id } = req.query;
  let lista = Array.from(agendamentos.values());
  if (data) lista = lista.filter(a => a.data === data);
  if (dentista_id) lista = lista.filter(a => a.dentista_id === parseInt(dentista_id));
  lista = lista.map(a => ({ ...a, dentista: dentistas.get(a.dentista_id), servicos: a.servico_ids.map(sid => servicos.get(sid)) }));
  res.json(lista);
});

app.post('/api/agendamentos', authMiddleware, async (req, res) => {
  try {
    const { cliente_nome, cliente_tel, cliente_email, dentista_id, data, horario, servico_ids } = req.body;
    if (!cliente_nome || !cliente_tel || !dentista_id || !data || !horario || !servico_ids || servico_ids.length === 0) {
      return res.status(400).json({ error: 'Todos os campos obrigatorios devem ser preenchidos' });
    }
    if (!dentistas.has(dentista_id)) return res.status(404).json({ error: 'Dentista nao encontrado' });
    const servicosValidos = servico_ids.every(sid => servicos.has(sid));
    if (!servicosValidos) return res.status(404).json({ error: 'Um ou mais servicos nao encontrados' });
    const conflito = Array.from(agendamentos.values()).find(
      a => a.dentista_id === dentista_id && a.data === data && a.horario === horario && !a.cancelado
    );
    if (conflito) return res.status(400).json({ error: 'Horario ja esta reservado para este dentista' });
    const id = agendamentoId++;
    const codigo = 'ODT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const novoAgendamento = { id, codigo, cliente_nome, cliente_tel, cliente_email: cliente_email || '', dentista_id, data, horario, servico_ids, cancelado: false, criado_em: new Date().toISOString() };
    agendamentos.set(id, novoAgendamento);
    res.status(201).json({ message: 'Agendamento realizado com sucesso!', agendamento: { ...novoAgendamento, dentista: dentistas.get(dentista_id), servicos: servico_ids.map(sid => servicos.get(sid)) } });
  } catch {
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.put('/api/agendamentos/:id', authMiddleware, async (req, res) => {
  try {
    const agendamento = agendamentos.get(parseInt(req.params.id));
    if (!agendamento) return res.status(404).json({ error: 'Agendamento nao encontrado' });
    const { cliente_nome, cliente_tel, cliente_email, dentista_id, data, horario, servico_ids } = req.body;
    if (cliente_nome) agendamento.cliente_nome = cliente_nome;
    if (cliente_tel) agendamento.cliente_tel = cliente_tel;
    if (cliente_email !== undefined) agendamento.cliente_email = cliente_email;
    if (dentista_id) agendamento.dentista_id = dentista_id;
    if (data) agendamento.data = data;
    if (horario) agendamento.horario = horario;
    if (servico_ids) agendamento.servico_ids = servico_ids;
    agendamentos.set(parseInt(req.params.id), agendamento);
    res.json({ message: 'Agendamento atualizado com sucesso!', agendamento });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

app.delete('/api/agendamentos/:id', authMiddleware, (req, res) => {
  const agendamento = agendamentos.get(parseInt(req.params.id));
  if (!agendamento) return res.status(404).json({ error: 'Agendamento nao encontrado' });
  agendamento.cancelado = true;
  agendamento.cancelado_em = new Date().toISOString();
  agendamentos.set(parseInt(req.params.id), agendamento);
  res.json({ message: 'Agendamento cancelado com sucesso!' });
});

app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  const lista = Array.from(agendamentos.values());
  const agendamentosHoje = lista.filter(a => a.data === hoje && !a.cancelado).length;
  const agendamentosTotal = lista.filter(a => !a.cancelado).length;
  const agendamentosCancelados = lista.filter(a => a.cancelado).length;
  res.json({ agendamentos_hoje: agendamentosHoje, agendamentos_total: agendamentosTotal, agendamentos_cancelados: agendamentosCancelados, proximos_agendamentos: [] });
});

let authToken = '';
const testEmail = `test${Date.now()}@email.com`;
const testCPF = '52998224725';

beforeAll(async () => {
  await request(app).post('/api/register').send({ nome: 'Teste User', email: testEmail, cpf: testCPF, senha: '123456' });
  const loginRes = await request(app).post('/api/login').send({ email: testEmail, senha: '123456' });
  authToken = loginRes.body.token;
});

describe('Auth - Registro', () => {
  it('deve registrar um novo usuario com sucesso', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ nome: 'Novo User', email: `novo${Date.now()}@email.com`, cpf: '52998224725', senha: '123456' });
    expect(res.status).toBe(201);
    expect(res.body.message).toContain('sucesso');
  });

  it('deve rejeitar registro com campos faltando', async () => {
    const res = await request(app).post('/api/register').send({ nome: 'Teste' });
    expect(res.status).toBe(400);
  });

  it('deve rejeitar registro com CPF invalido', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ nome: 'Teste', email: 'teste@email.com', cpf: '11111111111', senha: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('CPF');
  });

  it('deve rejeitar registro com email duplicado', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ nome: 'Teste', email: testEmail, cpf: '52998224725', senha: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('cadastrado');
  });
});

describe('Auth - Login', () => {
  it('deve fazer login com credenciais validas', async () => {
    const res = await request(app).post('/api/login').send({ email: testEmail, senha: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.nome).toBe('Teste User');
  });

  it('deve rejeitar login com senha errada', async () => {
    const res = await request(app).post('/api/login').send({ email: testEmail, senha: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('deve rejeitar login com email inexistente', async () => {
    const res = await request(app).post('/api/login').send({ email: 'naoexiste@email.com', senha: '123456' });
    expect(res.status).toBe(401);
  });
});

describe('Profile', () => {
  it('deve retornar perfil do usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });
});

describe('Dentistas', () => {
  it('deve listar dentistas ativos', async () => {
    const res = await request(app).get('/api/dentistas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('deve retornar dentista por ID', async () => {
    const res = await request(app).get('/api/dentistas/1');
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Dra. Maria Silva');
    expect(res.body.especialidade).toBe('Odontologia Geral');
  });

  it('deve retornar 404 para dentista inexistente', async () => {
    const res = await request(app).get('/api/dentistas/999');
    expect(res.status).toBe(404);
  });
});

describe('Servicos', () => {
  it('deve listar servicos ativos', async () => {
    const res = await request(app).get('/api/servicos');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body[0].nome).toBe('Limpeza e Profilaxia');
  });

  it('deve retornar servico por ID', async () => {
    const res = await request(app).get('/api/servicos/2');
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Consulta de Avaliacao');
  });

  it('deve retornar 404 para servico inexistente', async () => {
    const res = await request(app).get('/api/servicos/999');
    expect(res.status).toBe(404);
  });
});

describe('Horarios Disponiveis', () => {
  it('deve retornar horarios para uma data', async () => {
    const res = await request(app).get('/api/horarios/2026-06-01');
    expect(res.status).toBe(200);
    expect(res.body.horarios_disponiveis).toBeDefined();
    expect(res.body.horarios_disponiveis.length).toBeGreaterThan(0);
  });

  it('deve filtrar horarios por dentista', async () => {
    const res = await request(app).get('/api/horarios/2026-06-01?dentista_id=1');
    expect(res.status).toBe(200);
    expect(res.body.dentista_id).toBe(1);
  });
});

describe('Agendamentos CRUD', () => {
  let agendamentoId;

  it('deve criar um agendamento', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cliente_nome: 'Joao Paciente',
        cliente_tel: '(11) 99999-0000',
        cliente_email: 'joao@email.com',
        dentista_id: 1,
        data: '2026-06-15',
        horario: '09:00',
        servico_ids: [1, 2]
      });
    expect(res.status).toBe(201);
    expect(res.body.agendamento.codigo).toContain('ODT-');
    agendamentoId = res.body.agendamento.id;
  });

  it('deve rejeitar agendamento com campos faltando', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ cliente_nome: 'Teste' });
    expect(res.status).toBe(400);
  });

  it('deve rejeitar agendamento em horario ocupado', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cliente_nome: 'Outro Paciente',
        cliente_tel: '(11) 88888-0000',
        dentista_id: 1,
        data: '2026-06-15',
        horario: '09:00',
        servico_ids: [1]
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('reservado');
  });

  it('deve listar agendamentos do usuario', async () => {
    const res = await request(app)
      .get('/api/agendamentos')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve listar agendamentos filtrados por data', async () => {
    const res = await request(app)
      .get('/api/agendamentos?data=2026-06-15')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('deve atualizar um agendamento', async () => {
    const res = await request(app)
      .put(`/api/agendamentos/${agendamentoId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ cliente_tel: '(11) 77777-0000' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('atualizado');
  });

  it('deve retornar 401 sem autenticacao para agendamentos', async () => {
    const res = await request(app).get('/api/agendamentos');
    expect(res.status).toBe(401);
  });

  it('deve cancelar um agendamento', async () => {
    const res = await request(app)
      .delete(`/api/agendamentos/${agendamentoId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('cancelado');
  });

  it('deve retornar 404 ao cancelar agendamento inexistente', async () => {
    const res = await request(app)
      .delete('/api/agendamentos/99999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Dashboard Stats', () => {
  it('deve retornar estatisticas', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('agendamentos_hoje');
    expect(res.body).toHaveProperty('agendamentos_total');
    expect(res.body).toHaveProperty('agendamentos_cancelados');
  });
});
