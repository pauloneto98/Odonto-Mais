import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600">
      <nav className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            <h1 className="text-2xl font-bold text-teal-700">OdontoClip</h1>
          </div>
          <div className="flex gap-4">
            <Link
              to="/agendamentos"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Ir para Agendamentos
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-white mb-6">
              🦷
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Bem-vindo, {user?.nome}!
            </h2>
            <p className="text-gray-500 mb-6">
              Sistema de agendamento OdontoClip
            </p>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-700 mb-4">Dados do usuario:</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Nome</span>
                  <p className="text-gray-800">{user?.nome}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">E-mail</span>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                to="/agendamentos"
                className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Gerenciar Agendamentos
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
