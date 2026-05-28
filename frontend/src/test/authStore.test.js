import { describe, it, expect } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve iniciar com usuario nao autenticado', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('deve fazer logout corretamente', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ nome: 'Teste', email: 'test@email.com' }));
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('deve limpar erro', () => {
    useAuthStore.setState({ error: 'Algum erro' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
