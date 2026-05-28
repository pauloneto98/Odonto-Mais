import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

const users = new Map();
const agendamentos = new Map();
const dentistas = new Map();
const servicos = new Map();

let agendamentoId = 1;
let dentistaId = 1;
let servicoId = 1;

const dentistasIniciais = [
  { id: 1, nome: 'Dra. Maria Silva', especialidade: 'Odontologia Geral', avatar: '🦷', avaliacao: 4.9, total_atendimentos: 2450, sobre: 'CRO-SP 12345 - Graduada pela USP, especialista em clínica geral', ativo: true },
  { id: 2, nome: 'Dr. Carlos Oliveira', especialidade: 'Ortodontia', avatar: '😁', avaliacao: 4.8, total_atendimentos: 1890, sobre: 'CRO-SP 23456 - Especialista em ortodontia e ortopedia facial', ativo: true },
  { id: 3, nome: 'Dra. Ana Santos', especialidade: 'Endodontia', avatar: '🦷', avaliacao: 4.7, total_atendimentos: 1354, sobre: 'CRO-SP 34567 - Especialista em endodontia (tratamento de canal)', ativo: true },
  { id: 4, nome: 'Dr. Pedro Costa', especialidade: 'Periodontia', avatar: '😁', avaliacao: 4.9, total_atendimentos: 2100, sobre: 'CRO-SP 45678 - Especialista em periodontia e implantes', ativo: true },
];

const servicosIniciais = [
  { id: 1, nome: 'Limpeza e Profilaxia', descricao: 'Limpeza profissional com remoção de tártaro e polimento', preco: 120.00, duracao: '40 min', ativo: true },
  { id: 2, nome: 'Consulta de Avaliação', descricao: 'Avaliação completa da saúde bucal com diagnóstico', preco: 150.00, duracao: '30 min', ativo: true },
  { id: 3, nome: 'Restauração', descricao: 'Restauração em resina composta (por dente)', preco: 180.00, duracao: '40 min', ativo: true },
  { id: 4, nome: 'Tratamento de Canal', descricao: 'Tratamento endodôntico completo', preco: 800.00, duracao: '60 min', ativo: true },
  { id: 5, nome: 'Clareamento Dental', descricao: 'Clareamento a laser com resultados imediatos', preco: 600.00, duracao: '90 min', ativo: true },
  { id: 6, nome: 'Extracao Dentaria', descricao: 'Extracao simples com anestesia local', preco: 350.00, duracao: '45 min', ativo: true },
  { id: 7, nome: 'Avaliacao Ortodontica', descricao: 'Consulta para avaliacao de necessidade de aparelho', preco: 200.00, duracao: '40 min', ativo: true },
  { id: 8, nome: 'Aplicacao de Fluor', descricao: 'Aplicacao topica de fluor para prevencao de caries', preco: 80.00, duracao: '20 min', ativo: true },
];

dentistasIniciais.forEach(d => dentistas.set(d.id, d));
servicosIniciais.forEach(s => servicos.set(s.id, s));

app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token nao fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido' });
  }
};

const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto > 9) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto > 9) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
};

const gerarCodigoAgendamento = () => {
  return 'ODT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

app.post('/api/register', async (req, res) => {
  try {
    const { nome, email, cpf, senha } = req.body;

    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({ error: 'CPF invalido' });
    }

    if (users.has(email)) {
      return res.status(400).json({ error: 'E-mail ja cadastrado' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);

    users.set(email, {
      nome,
      email,
      cpf,
      senha: hashedSenha
    });

    console.log('Usuario registrado:', email);

    res.status(201).json({
      message: 'Usuario registrado com sucesso',
      user: { nome, email }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuario' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha sao obrigatorios' });
    }

    const user = users.get(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const token = jwt.sign({ userId: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.get('/api/profile', authMiddleware, (req, res) => {
  const user = users.get(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuario nao encontrado' });
  }

  res.json({
    nome: user.nome,
    email: user.email,
    cpf: user.cpf
  });
});

app.get('/api/dentistas', (req, res) => {
  const lista = Array.from(dentistas.values()).filter(d => d.ativo);
  res.json(lista);
});

app.get('/api/dentistas/:id', (req, res) => {
  const dentista = dentistas.get(parseInt(req.params.id));
  if (!dentista) {
    return res.status(404).json({ error: 'Dentista nao encontrado' });
  }
  res.json(dentista);
});

app.get('/api/servicos', (req, res) => {
  const lista = Array.from(servicos.values()).filter(s => s.ativo);
  res.json(lista);
});

app.get('/api/servicos/:id', (req, res) => {
  const servico = servicos.get(parseInt(req.params.id));
  if (!servico) {
    return res.status(404).json({ error: 'Servico nao encontrado' });
  }
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

  res.json({
    data,
    dentista_id: dentista_id ? parseInt(dentista_id) : null,
    horarios_disponiveis: horariosLivres,
    horarios_ocupados: horariosOcupados
  });
});

app.get('/api/agendamentos', authMiddleware, (req, res) => {
  const { data, dentista_id } = req.query;

  let lista = Array.from(agendamentos.values());

  if (data) {
    lista = lista.filter(a => a.data === data);
  }
  if (dentista_id) {
    lista = lista.filter(a => a.dentista_id === parseInt(dentista_id));
  }

  lista = lista.map(a => ({
    ...a,
    dentista: dentistas.get(a.dentista_id),
    servicos: a.servico_ids.map(sid => servicos.get(sid))
  }));

  res.json(lista);
});

app.get('/api/agendamentos/:id', authMiddleware, (req, res) => {
  const agendamento = agendamentos.get(parseInt(req.params.id));

  if (!agendamento) {
    return res.status(404).json({ error: 'Agendamento nao encontrado' });
  }

  res.json({
    ...agendamento,
    dentista: dentistas.get(agendamento.dentista_id),
    servicos: agendamento.servico_ids.map(sid => servicos.get(sid))
  });
});

app.post('/api/agendamentos', authMiddleware, async (req, res) => {
  try {
    const { cliente_nome, cliente_tel, cliente_email, dentista_id, data, horario, servico_ids } = req.body;

    if (!cliente_nome || !cliente_tel || !dentista_id || !data || !horario || !servico_ids || servico_ids.length === 0) {
      return res.status(400).json({ error: 'Todos os campos obrigatorios devem ser preenchidos' });
    }

    if (!dentistas.has(dentista_id)) {
      return res.status(404).json({ error: 'Dentista nao encontrado' });
    }

    const servicosValidos = servico_ids.every(sid => servicos.has(sid));
    if (!servicosValidos) {
      return res.status(404).json({ error: 'Um ou mais servicos nao encontrados' });
    }

    const conflito = Array.from(agendamentos.values()).find(
      a => a.dentista_id === dentista_id && a.data === data && a.horario === horario && !a.cancelado
    );

    if (conflito) {
      return res.status(400).json({ error: 'Horario ja esta reservado para este dentista' });
    }

    const id = agendamentoId++;
    const codigo = gerarCodigoAgendamento();

    const novoAgendamento = {
      id,
      codigo,
      cliente_nome,
      cliente_tel,
      cliente_email: cliente_email || '',
      dentista_id,
      data,
      horario,
      servico_ids,
      cancelado: false,
      criado_em: new Date().toISOString()
    };

    agendamentos.set(id, novoAgendamento);

    console.log(`Novo agendamento criado: ${codigo} - ${cliente_nome} com ${dentistas.get(dentista_id)?.nome} em ${data} as ${horario}`);

    res.status(201).json({
      message: 'Agendamento realizado com sucesso!',
      agendamento: {
        ...novoAgendamento,
        dentista: dentistas.get(dentista_id),
        servicos: servico_ids.map(sid => servicos.get(sid))
      }
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.put('/api/agendamentos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = agendamentos.get(parseInt(id));

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento nao encontrado' });
    }

    const { cliente_nome, cliente_tel, cliente_email, dentista_id, data, horario, servico_ids } = req.body;

    if (cliente_nome) agendamento.cliente_nome = cliente_nome;
    if (cliente_tel) agendamento.cliente_tel = cliente_tel;
    if (cliente_email !== undefined) agendamento.cliente_email = cliente_email;
    if (dentista_id) agendamento.dentista_id = dentista_id;
    if (data) agendamento.data = data;
    if (horario) agendamento.horario = horario;
    if (servico_ids) agendamento.servico_ids = servico_ids;

    agendamentos.set(parseInt(id), agendamento);

    res.json({
      message: 'Agendamento atualizado com sucesso!',
      agendamento: {
        ...agendamento,
        dentista: dentistas.get(agendamento.dentista_id),
        servicos: agendamento.servico_ids.map(sid => servicos.get(sid))
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

app.delete('/api/agendamentos/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const agendamento = agendamentos.get(parseInt(id));

  if (!agendamento) {
    return res.status(404).json({ error: 'Agendamento nao encontrado' });
  }

  agendamento.cancelado = true;
  agendamento.cancelado_em = new Date().toISOString();

  agendamentos.set(parseInt(id), agendamento);

  res.json({ message: 'Agendamento cancelado com sucesso!' });
});

app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];

  const lista = Array.from(agendamentos.values());

  const agendamentosHoje = lista.filter(a => a.data === hoje && !a.cancelado).length;
  const agendamentosTotal = lista.filter(a => !a.cancelado).length;
  const agendamentosCancelados = lista.filter(a => a.cancelado).length;

  const proximosAgendamentos = lista
    .filter(a => !a.cancelado && a.data >= hoje)
    .sort((a, b) => new Date(a.data + 'T' + a.horario) - new Date(b.data + 'T' + b.horario))
    .slice(0, 5)
    .map(a => ({
      ...a,
      dentista: dentistas.get(a.dentista_id),
      servicos: a.servico_ids.map(sid => servicos.get(sid))
    }));

  res.json({
    agendamentos_hoje: agendamentosHoje,
    agendamentos_total: agendamentosTotal,
    agendamentos_cancelados: agendamentosCancelados,
    proximos_agendamentos: proximosAgendamentos
  });
});

app.listen(PORT, () => {
  console.log(`OdontoClip Backend rodando em http://localhost:${PORT}`);
});

export { app, users, agendamentos, dentistas, servicos, agendamentoId, dentistaId, servicoId };
