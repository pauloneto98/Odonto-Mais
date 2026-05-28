# Frontend DentalFlow - React + Vite

## Setup Inicial

```bash
# Criar projeto com Vite
npm create vite@latest dental-flow-frontend -- --template react
cd dental-flow-frontend

# Instalar dependências
npm install

# Instalar dependências adicionais (abaixo)
npm install -D tailwindcss postcss autoprefixer
npm install -D zustand axios react-hook-form react-hot-toast
npm install -D react-big-calendar date-fns
npm install -D lucide-react

# Iniciar desenvolvimento
npm run dev
```

---

## package.json (com scripts úteis)

```json
{
  "name": "dental-flow-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.1",
    "react-hook-form": "^7.48.0",
    "react-hot-toast": "^2.4.1",
    "react-big-calendar": "^1.8.5",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.7",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "prettier": "^3.1.0",
    "eslint": "^8.54.0"
  }
}
```

---

## vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

---

## tailwind.config.js

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#06b6d4',
        accent: '#f59e0b',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
```

---

## .env.example

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=DentalFlow
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
```

---

## src/main.jsx

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

## src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

---

## src/App.jsx

```javascript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AgendamentosPage from './pages/AgendamentosPage'
import PacientesPage from './pages/PacientesPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="/pacientes" element={<PacientesPage />} />
        </Route>
        
        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      <Toaster position="top-right" />
    </>
  )
}

export default App
```

---

## src/store/authStore.js

```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      setUsuario: (usuario) => set({ usuario }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (cpf, senha) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf, senha })
          })
          
          if (!response.ok) {
            throw new Error('Login falhou')
          }
          
          const data = await response.json()
          set({
            usuario: data.usuario,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false
          })
          
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          return false
        }
      },

      logout: () => set({ usuario: null, accessToken: null, refreshToken: null }),

      isAutenticado: () => {
        const state = useAuthStore.getState()
        return state.accessToken !== null
      }
    }),
    {
      name: 'auth-storage',
      storage: localStorage
    }
  )
)

export default useAuthStore
```

---

## src/services/api.js

```javascript
import axios from 'axios'
import useAuthStore from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para lidar com erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

---

## src/services/authService.js

```javascript
import apiClient from './api'

const authService = {
  login: async (cpf, senha) => {
    const response = await apiClient.post('/auth/login', { cpf, senha })
    return response.data
  },

  register: async (cpf, email, nome, senha) => {
    const response = await apiClient.post('/auth/register', {
      cpf,
      email,
      nome,
      senha
    })
    return response.data
  },

  refresh: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken
    })
    return response.data
  },

  me: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  }
}

export default authService
```

---

## src/components/Auth/ProtectedRoute.jsx

```javascript
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

function ProtectedRoute({ children }) {
  const { isAutenticado } = useAuthStore()

  if (!isAutenticado()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
```

---

## src/components/Layout/Layout.jsx

```javascript
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
```

---

## src/components/Layout/Navbar.jsx

```javascript
import { LogOut, User, Settings } from 'lucide-react'
import useAuthStore from '../../store/authStore'

function Navbar() {
  const { usuario, logout } = useAuthStore()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">DentalFlow</div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Olá, {usuario?.nome}</span>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <Settings size={20} className="text-gray-600" />
        </button>
        <button
          onClick={() => {
            logout()
            window.location.href = '/login'
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <LogOut size={20} className="text-red-600" />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
```

---

## src/components/Layout/Sidebar.jsx

```javascript
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Users, Home, BarChart3 } from 'lucide-react'

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/agendamentos', label: 'Agendamentos', icon: Calendar },
    { path: '/pacientes', label: 'Pacientes', icon: Users },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">🦷 DentalFlow</h1>
      </div>

      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              location.pathname === path
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
```

---

## src/pages/LoginPage.jsx

```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const cpfLimpo = cpf.replace(/\D/g, '')

    const success = await login(cpfLimpo, senha)

    if (success) {
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } else {
      toast.error('CPF ou senha incorretos')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">🦷 DentalFlow</h1>
          <p className="text-blue-50">Seu agendamento odontológico simplificado</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CPF
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
```

---

## src/pages/DashboardPage.jsx

```javascript
import { Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'

function DashboardPage() {
  const { usuario } = useAuthStore()

  const stats = [
    { label: 'Próximas Consultas', value: '3', icon: Calendar, color: 'blue' },
    { label: 'Pacientes Cadastrados', value: '24', icon: Users, color: 'green' },
    { label: 'Taxa de Presença', value: '92%', icon: TrendingUp, color: 'purple' },
    { label: 'Avisos', value: '2', icon: AlertCircle, color: 'orange' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Bem-vindo, {usuario?.nome}! 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600',
          }

          return (
            <div key={stat.label} className="bg-white rounded-lg p-6 shadow">
              <div className={`inline-block p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon size={24} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mt-4">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Consultas</h2>
        <p className="text-gray-600">Nenhuma consulta próxima no momento.</p>
      </div>
    </div>
  )
}

export default DashboardPage
```

---

## src/pages/NotFoundPage.jsx

```javascript
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
```

---

## Próximas etapas:

1. **Implementar agendamentos** (listar, criar, editar)
2. **Implementar pacientes** (CRUD completo)
3. **Calendar view** (visualizar horários)
4. **Integração com backend** (conectar APIs)
5. **Testes** (Jest + React Testing Library)

Quer que eu continue?
