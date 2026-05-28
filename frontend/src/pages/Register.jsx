import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);
  const clearError = useAuthStore((state) => state.clearError);
  const navigate = useNavigate();

  const formatCPF = (value) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  };

  const handleCpfChange = (e) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await register(nome, email, cpf, senha);
      navigate('/login');
    } catch (err) {
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🦷</div>
          <h1 className="text-3xl font-bold text-teal-700">Criar Conta</h1>
          <p className="text-gray-500 mt-2">Preencha os dados para se cadastrar</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              required
              maxLength="14"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Ja tem conta?{' '}
          <Link to="/login" className="text-teal-600 hover:underline font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
