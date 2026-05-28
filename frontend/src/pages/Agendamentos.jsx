import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

function Agendamentos() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [agendamentos, setAgendamentos] = useState([]);
  const [dentistas, setDentistas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroData, setFiltroData] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    cliente_nome: user?.nome || '',
    cliente_tel: '',
    cliente_email: user?.email || '',
    dentista_id: '',
    data: '',
    horario: '',
    servico_ids: []
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    carregarDados();
  }, [filtroData]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [dentistasRes, servicosRes, agendamentosRes, statsRes] = await Promise.all([
        api.get('/dentistas'),
        api.get('/servicos'),
        api.get('/agendamentos' + (filtroData ? `?data=${filtroData}` : '')),
        api.get('/dashboard/stats')
      ]);

      setDentistas(dentistasRes.data);
      setServicos(servicosRes.data);
      setAgendamentos(agendamentosRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
    setLoading(false);
  };

  const handleDentistaChange = async (dentistaId) => {
    setFormData(prev => ({ ...prev, dentista_id: dentistaId, horario: '' }));
    setHorariosDisponiveis([]);

    if (dentistaId && formData.data) {
      try {
        const res = await api.get(`/horarios/${formData.data}?dentista_id=${dentistaId}`);
        setHorariosDisponiveis(res.data.horarios_disponiveis);
      } catch (error) {
        console.error('Erro ao buscar horarios:', error);
      }
    }
  };

  const handleDataChange = async (data) => {
    setFormData(prev => ({ ...prev, data, horario: '' }));
    setHorariosDisponiveis([]);

    if (data && formData.dentista_id) {
      try {
        const res = await api.get(`/horarios/${data}?dentista_id=${formData.dentista_id}`);
        setHorariosDisponiveis(res.data.horarios_disponiveis);
      } catch (error) {
        console.error('Erro ao buscar horarios:', error);
      }
    }
  };

  const handleServicoToggle = (servicoId) => {
    setFormData(prev => ({
      ...prev,
      servico_ids: prev.servico_ids.includes(servicoId)
        ? prev.servico_ids.filter(id => id !== servicoId)
        : [...prev.servico_ids, servicoId]
    }));
  };

  const resetForm = () => {
    setFormData({
      cliente_nome: user?.nome || '',
      cliente_tel: '',
      cliente_email: user?.email || '',
      dentista_id: '',
      data: '',
      horario: '',
      servico_ids: []
    });
    setEditingId(null);
    setHorariosDisponiveis([]);
    setFormError('');
    setFormSuccess('');
  };

  const handleEdit = (agendamento) => {
    setEditingId(agendamento.id);
    setFormData({
      cliente_nome: agendamento.cliente_nome,
      cliente_tel: agendamento.cliente_tel,
      cliente_email: agendamento.cliente_email || '',
      dentista_id: agendamento.dentista_id,
      data: agendamento.data,
      horario: agendamento.horario,
      servico_ids: agendamento.servico_ids
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.dentista_id || !formData.data || !formData.horario || formData.servico_ids.length === 0) {
      setFormError('Preencha todos os campos obrigatorios');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/agendamentos/${editingId}`, formData);
        setFormSuccess('Agendamento atualizado com sucesso!');
      } else {
        await api.post('/agendamentos', formData);
        setFormSuccess('Agendamento realizado com sucesso!');
      }
      setShowForm(false);
      resetForm();
      carregarDados();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Erro ao salvar agendamento');
    }
  };

  const handleCancelar = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      await api.delete(`/agendamentos/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao cancelar:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            <h1 className="text-2xl font-bold text-teal-700">OdontoClip</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Ola, {user?.nome}</span>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              + Novo Agendamento
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-teal-600">{stats.agendamentos_hoje}</div>
              <div className="text-gray-500">Agendamentos Hoje</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.agendamentos_total}</div>
              <div className="text-gray-500">Total Agendado</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-red-600">{stats.agendamentos_cancelados}</div>
              <div className="text-gray-500">Cancelados</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-gray-700 font-medium">Filtrar por data:</label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
            />
            {filtroData && (
              <button
                onClick={() => setFiltroData('')}
                className="text-gray-500 hover:text-gray-700"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agendamentos</h2>
          {agendamentos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado</p>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className={`border rounded-lg p-4 flex justify-between items-center ${
                    agendamento.cancelado ? 'bg-red-50 opacity-60' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agendamento.dentista?.avatar}</span>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {agendamento.cliente_nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agendamento.dentista?.nome} | {agendamento.data?.split('-').reverse().join('/')} as {agendamento.horario}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Servicos: {agendamento.servicos?.map(s => s.nome).join(', ')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Codigo: {agendamento.codigo}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!agendamento.cancelado && (
                      <>
                        <button
                          onClick={() => handleEdit(agendamento)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleCancelar(agendamento.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {agendamento.cancelado && (
                      <span className="text-red-600 font-medium text-sm">Cancelado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                x
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Paciente</label>
                <input
                  type="text"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.cliente_tel}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_tel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dentista</label>
                <select
                  value={formData.dentista_id}
                  onChange={(e) => handleDentistaChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {dentistas.map(d => (
                    <option key={d.id} value={d.id}>{d.avatar} {d.nome} - {d.especialidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleDataChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario</label>
                {formData.data && formData.dentista_id ? (
                  horariosDisponiveis.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {horariosDisponiveis.map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, horario: h }))}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            formData.horario === h
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum horario disponivel</p>
                  )
                ) : (
                  <p className="text-gray-500 text-sm">Selecione data e dentista</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicos</label>
                <div className="space-y-2">
                  {servicos.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.servico_ids.includes(s.id)}
                        onChange={() => handleServicoToggle(s.id)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span className="text-gray-700">{s.nome}</span>
                      <span className="text-gray-500 text-sm">- R$ {s.preco.toFixed(2)} ({s.duracao})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                {editingId ? 'Salvar Alteracoes' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendamentos;
