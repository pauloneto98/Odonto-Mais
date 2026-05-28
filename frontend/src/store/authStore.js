import { create } from 'zustand';
import { authService } from '../services/api';

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  login: async (email, senha) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, senha);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (nome, email, cpf, senha) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(nome, email, cpf, senha);
      set({ loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao registrar';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
