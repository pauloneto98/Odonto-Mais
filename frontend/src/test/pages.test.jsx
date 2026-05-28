import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import { useAuthStore } from '../store/authStore';

const renderWithRouter = (Component) => {
  return render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false, error: null, loading: false });
});

describe('Login Page', () => {
  it('deve renderizar formulario de login', () => {
    renderWithRouter(Login);
    expect(screen.getByText('OdontoClip')).toBeInTheDocument();
    expect(screen.getByText('Faca login para continuar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve ter link para registro', () => {
    renderWithRouter(Login);
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
  });

  it('deve ter campo de senha', () => {
    renderWithRouter(Login);
    const senhaInput = screen.getByPlaceholderText('••••••••');
    expect(senhaInput).toBeInTheDocument();
    expect(senhaInput.type).toBe('password');
  });

  it('deve atualizar campos ao digitar', () => {
    renderWithRouter(Login);
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    expect(emailInput.value).toBe('test@email.com');
  });
});

describe('Register Page', () => {
  it('deve renderizar formulario de registro', () => {
    renderWithRouter(Register);
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument();
  });

  it('deve ter link para login', () => {
    renderWithRouter(Register);
    expect(screen.getByText('Fazer login')).toBeInTheDocument();
  });

  it('deve ter botao de cadastro', () => {
    renderWithRouter(Register);
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('deve formatar CPF corretamente', () => {
    renderWithRouter(Register);
    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    fireEvent.change(cpfInput, { target: { value: '52998224725' } });
    expect(cpfInput.value).toBe('529.982.247-25');
  });

  it('deve ter campo de email', () => {
    renderWithRouter(Register);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
  });
});

describe('Dashboard Page', () => {
  it('deve renderizar dashboard com dados do usuario', () => {
    useAuthStore.setState({
      user: { nome: 'Dr. Teste', email: 'dr@test.com' },
      isAuthenticated: true
    });
    renderWithRouter(Dashboard);
    expect(screen.getByText('Bem-vindo, Dr. Teste!')).toBeInTheDocument();
    expect(screen.getByText('dr@test.com')).toBeInTheDocument();
  });

  it('deve ter link para agendamentos', () => {
    useAuthStore.setState({
      user: { nome: 'Dr. Teste', email: 'dr@test.com' },
      isAuthenticated: true
    });
    renderWithRouter(Dashboard);
    expect(screen.getByText('Gerenciar Agendamentos')).toBeInTheDocument();
  });

  it('deve ter botao de logout', () => {
    useAuthStore.setState({
      user: { nome: 'Dr. Teste', email: 'dr@test.com' },
      isAuthenticated: true
    });
    renderWithRouter(Dashboard);
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });
});
