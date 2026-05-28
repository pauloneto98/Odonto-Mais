# 🔧 DentalFlow - Snippets de Código Prontos

Copie e cole estes códigos no seu projeto!

---

## BACKEND - Python/FastAPI

### 1️⃣ Validar CPF (Copiar para `app/utils/cpf.py`)

```python
def validar_cpf(cpf: str) -> bool:
    """
    Valida CPF usando o algoritmo dos dígitos verificadores.
    Retorna True se válido, False caso contrário.
    """
    # Remove formatação
    cpf = cpf.replace(".", "").replace("-", "").strip()
    
    # Verifica se tem 11 dígitos
    if len(cpf) != 11 or not cpf.isdigit():
        return False
    
    # CPFs com todos os dígitos iguais são inválidos
    if cpf == cpf[0] * 11:
        return False
    
    # Calcula primeiro dígito verificador
    soma1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto1 = soma1 % 11
    digito1 = 0 if resto1 < 2 else 11 - resto1
    
    if int(cpf[9]) != digito1:
        return False
    
    # Calcula segundo dígito verificador
    soma2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto2 = soma2 % 11
    digito2 = 0 if resto2 < 2 else 11 - resto2
    
    if int(cpf[10]) != digito2:
        return False
    
    return True

# USO:
# from app.utils.cpf import validar_cpf
# if validar_cpf("111.444.777-35"):
#     print("CPF válido!")
```

---

### 2️⃣ Hash de Senha (Copiar para `app/utils/security.py`)

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Transforma senha em hash com bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara senha com hash"""
    return pwd_context.verify(plain_password, hashed_password)

# USO:
# senha_hash = hash_password("minha_senha_123")
# if verify_password("minha_senha_123", senha_hash):
#     print("Senha correta!")
```

---

### 3️⃣ JWT Token (Copiar para `app/utils/jwt.py`)

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.config import settings

def criar_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def verificar_token(token: str) -> Optional[dict]:
    """Verifica e decodifica JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# USO:
# token = criar_access_token({"sub": "usuario_id_123"})
# payload = verificar_token(token)
```

---

### 4️⃣ Modelo de Usuário com SQLAlchemy

```python
# Copiar para app/models/usuario.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

class RoleEnum(str, enum.Enum):
    PACIENTE = "paciente"
    DENTISTA = "dentista"
    ADMIN = "admin"

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf = Column(String(11), unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.PACIENTE)
    
    ativo = Column(Boolean, default=True)
    email_verificado = Column(Boolean, default=False)
    
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    agendamentos = relationship("Agendamento", back_populates="usuario")
```

---

### 5️⃣ Endpoint de Login

```python
# Copiar para app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.usuario import Usuario
from app.utils.security import verify_password, hash_password
from app.utils.jwt import criar_access_token
from app.utils.cpf import validar_cpf
from pydantic import BaseModel, EmailStr

router = APIRouter()

class LoginRequest(BaseModel):
    cpf: str
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Autentica usuário com CPF e senha"""
    
    # 1. Validar CPF
    if not validar_cpf(request.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )
    
    # 2. Procurar usuário
    cpf_limpo = request.cpf.replace(".", "").replace("-", "")
    usuario = db.query(Usuario).filter(Usuario.cpf == cpf_limpo).first()
    
    # 3. Validar credenciais
    if not usuario or not verify_password(request.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos"
        )
    
    # 4. Gerar token
    access_token = criar_access_token({"sub": str(usuario.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/register")
def register(request: LoginRequest, db: Session = Depends(get_db)):
    """Registra novo usuário"""
    
    # Validações
    if not validar_cpf(request.cpf):
        raise HTTPException(status_code=400, detail="CPF inválido")
    
    cpf_limpo = request.cpf.replace(".", "").replace("-", "")
    
    if db.query(Usuario).filter(Usuario.cpf == cpf_limpo).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
    
    # Criar usuário
    novo_usuario = Usuario(
        cpf=cpf_limpo,
        email=request.email,
        nome=request.nome,
        senha_hash=hash_password(request.senha)
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return {"mensagem": "Usuário criado com sucesso", "usuario_id": novo_usuario.id}
```

---

## FRONTEND - React/JavaScript

### 1️⃣ Componente de Login

```javascript
// Copiar para src/components/LoginForm.jsx

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginForm({ onSuccess }) {
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const formatarCPF = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11)
    if (numeros.length <= 3) return numeros
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          senha
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.detail || 'Erro ao fazer login')
        return
      }

      localStorage.setItem('token', data.access_token)
      toast.success('Login realizado!')
      onSuccess(data)
    } catch (error) {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={cpf}
        onChange={(e) => setCpf(formatarCPF(e.target.value))}
        placeholder="000.000.000-00"
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha"
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

---

### 2️⃣ Axios Client com Interceptor

```javascript
// Copiar para src/services/api.js

import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
})

// Interceptor: Adiciona token a cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: Trata erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

---

### 3️⃣ Zustand Store para Auth

```javascript
// Copiar para src/store/authStore.js

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      token: null,

      setUsuario: (usuario) => set({ usuario }),
      setToken: (token) => set({ token }),

      login: (usuario, token) => {
        set({ usuario, token })
        localStorage.setItem('token', token)
      },

      logout: () => {
        set({ usuario: null, token: null })
        localStorage.removeItem('token')
      },

      isAutenticado: () => {
        const state = useAuthStore.getState()
        return state.token !== null
      }
    }),
    { name: 'auth-store' }
  )
)

export default useAuthStore
```

---

### 4️⃣ Componente Protected Route

```javascript
// Copiar para src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const isAutenticado = useAuthStore((state) => state.isAutenticado())

  if (!isAutenticado()) {
    return <Navigate to="/login" replace />
  }

  return children
}
```

---

### 5️⃣ Hook useApi (Fetch com Loading)

```javascript
// Copiar para src/hooks/useApi.js

import { useState, useEffect } from 'react'
import apiClient from '../services/api'

export function useApi(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(url)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// USO:
// const { data: agendamentos, loading } = useApi('/agendamentos')
// if (loading) return <p>Carregando...</p>
```

---

### 6️⃣ Tailwind Classes Úteis

```html
<!-- Buttons -->
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Entrar
</button>

<!-- Cards -->
<div class="bg-white rounded-lg shadow p-6 space-y-4">
  <h2 class="text-xl font-bold">Título</h2>
  <p class="text-gray-600">Conteúdo</p>
</div>

<!-- Inputs -->
<input 
  type="text"
  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  placeholder="Digite aqui"
/>

<!-- Loading Spinner -->
<div class="animate-spin">
  <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
</div>

<!-- Alert -->
<div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
  ℹ️ Mensagem informativa
</div>

<!-- Grid Responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Cards aqui -->
</div>
```

---

## TESTES

### 1️⃣ Teste de CPF (Python)

```python
# Copiar para tests/test_cpf.py

import pytest
from app.utils.cpf import validar_cpf

def test_cpf_valido():
    assert validar_cpf("111.444.777-35") == True
    assert validar_cpf("11144477735") == True

def test_cpf_invalido():
    assert validar_cpf("000.000.000-00") == False
    assert validar_cpf("111.111.111-11") == False
    assert validar_cpf("123.456.789-00") == False

def test_cpf_formato_invalido():
    assert validar_cpf("123") == False
    assert validar_cpf("abc.def.ghi-jk") == False
```

---

### 2️⃣ Teste de Login (Python)

```python
# Copiar para tests/test_auth.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_invalido():
    response = client.post("/api/v1/auth/login", json={
        "cpf": "000.000.000-00",
        "senha": "password"
    })
    assert response.status_code == 400

def test_login_valido(db):
    # Primeiro registra um usuário
    client.post("/api/v1/auth/register", json={
        "cpf": "111.444.777-35",
        "email": "test@example.com",
        "nome": "Test User",
        "senha": "password123"
    })
    
    # Depois tenta login
    response = client.post("/api/v1/auth/login", json={
        "cpf": "111.444.777-35",
        "senha": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## UTILIDADES

### 1️⃣ Formatar Data (JavaScript)

```javascript
// Copiar para src/utils/formatters.js

export function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR')
}

export function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR')
}

export function formatarDataHora(data) {
  return `${formatarData(data)} ${formatarHora(data)}`
}

export function formatarTelefone(tel) {
  const numeros = tel.replace(/\D/g, '')
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

// USO:
// formatarData("2024-01-15") // 15/01/2024
// formatarTelefone("11987654321") // (11) 98765-4321
```

---

### 2️⃣ Constantes (JavaScript)

```javascript
// Copiar para src/utils/constants.js

export const TIPOS_CONSULTA = [
  { label: 'Consulta Geral', value: 'consulta_geral' },
  { label: 'Limpeza', value: 'limpeza' },
  { label: 'Tratamento', value: 'tratamento' },
  { label: 'Extração', value: 'extracao' }
]

export const STATUS_AGENDAMENTO = [
  { label: 'Agendado', value: 'agendado', color: 'blue' },
  { label: 'Confirmado', value: 'confirmado', color: 'green' },
  { label: 'Cancelado', value: 'cancelado', color: 'red' },
  { label: 'Realizado', value: 'realizado', color: 'gray' }
]

export const HORARIO_FUNCIONAMENTO = {
  segunda: { abre: '08:00', fecha: '18:00' },
  terca: { abre: '08:00', fecha: '18:00' },
  quarta: { abre: '08:00', fecha: '18:00' },
  quinta: { abre: '08:00', fecha: '18:00' },
  sexta: { abre: '08:00', fecha: '17:00' },
  sabado: { abre: '09:00', fecha: '13:00' }
}
```

---

## DICAS DE DEBUG

### Backend

```python
# Print para debug
print(f"DEBUG: {variavel}")

# Logs estruturados
import logging
logger = logging.getLogger(__name__)
logger.info("Mensagem informativa")
logger.error("Erro:", exc_info=True)

# Inspecionar objeto
import pprint
pprint.pprint(objeto.__dict__)
```

### Frontend

```javascript
// Console logs
console.log('DEBUG:', variavel)
console.error('ERRO:', erro)
console.table(array_de_objetos)

// Browser DevTools
// F12 -> Console -> Digite variáveis direto
```

---

**Boa sorte! 🚀 Use estes snippets para acelerar o desenvolvimento!**
