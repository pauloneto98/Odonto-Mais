# 🚀 DentalFlow - Guia Prático de Início

## ⚡ COMEÇAR EM 30 MINUTOS

Siga este guia para ter um MVP funcionando **HOJE**.

---

## PASSO 1: Setup Inicial (10 minutos)

### 1.1 Criar estrutura de pastas

```bash
# Crie a pasta do projeto
mkdir dental-flow
cd dental-flow

# Crie as pastas principais
mkdir backend frontend docs

# Inicialize git
git init
echo "node_modules/" > .gitignore
echo "venv/" >> .gitignore
echo ".env" >> .gitignore
echo "__pycache__/" >> .gitignore
```

### 1.2 Backend - Setup rápido

```bash
cd backend

# Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic bcrypt python-jose

# Copiar arquivo requirements.txt (do guia anterior)
# Copiar .env.example (do guia anterior)
```

### 1.3 Frontend - Setup rápido

```bash
cd ../frontend

# Criar projeto Vite
npm create vite@latest . -- --template react
npm install

# Instalar dependências principais
npm install zustand axios react-hot-toast react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## PASSO 2: Criar o primeiro modelo (Database)

### 2.1 Arquivo: `backend/app/models.py`

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class RoleEnum(str, enum.Enum):
    PACIENTE = "paciente"
    DENTISTA = "dentista"

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf = Column(String(11), unique=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    senha_hash = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.PACIENTE)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

class Agendamento(Base):
    __tablename__ = "agendamentos"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer)
    data_hora = Column(DateTime)
    tipo_consulta = Column(String)
    status = Column(String, default="agendado")
    notas = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

class Paciente(Base):
    __tablename__ = "pacientes"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer)
    telefone = Column(String)
    endereco = Column(String)
    data_nascimento = Column(String)
    criado_em = Column(DateTime, default=datetime.utcnow)
```

---

## PASSO 3: Criar API básica

### 3.1 Arquivo: `backend/app/main.py`

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

# Imports locais
from app.models import Base, Usuario, RoleEnum

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "sua-chave-secreta-aqui")
ALGORITHM = "HS256"

# FastAPI app
app = FastAPI(title="DentalFlow API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ SCHEMAS ============

from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    cpf: str
    email: str
    nome: str

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioResponse(UsuarioBase):
    id: int
    role: str
    criado_em: datetime

class LoginRequest(BaseModel):
    cpf: str
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    usuario: UsuarioResponse

# ============ UTILITIES ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded

def validar_cpf(cpf: str) -> bool:
    cpf = cpf.replace(".", "").replace("-", "")
    if len(cpf) != 11 or not cpf.isdigit():
        return False
    if cpf == cpf[0] * 11:
        return False
    
    soma1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto1 = soma1 % 11
    digito1 = 0 if resto1 < 2 else 11 - resto1
    
    if int(cpf[9]) != digito1:
        return False
    
    soma2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto2 = soma2 % 11
    digito2 = 0 if resto2 < 2 else 11 - resto2
    
    return int(cpf[10]) == digito2

# ============ ROUTES ============

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao DentalFlow!", "version": "0.1.0"}

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    if not validar_cpf(request.cpf):
        raise HTTPException(status_code=400, detail="CPF inválido")
    
    cpf_limpo = request.cpf.replace(".", "").replace("-", "")
    usuario = db.query(Usuario).filter(Usuario.cpf == cpf_limpo).first()
    
    if not usuario or not verify_password(request.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="CPF ou senha incorretos")
    
    token = create_access_token({"sub": str(usuario.id)})
    
    return {
        "access_token": token,
        "usuario": {
            "id": usuario.id,
            "cpf": usuario.cpf,
            "email": usuario.email,
            "nome": usuario.nome,
            "role": usuario.role,
            "criado_em": usuario.criado_em
        }
    }

@app.post("/api/v1/auth/register", response_model=UsuarioResponse)
def register(user: UsuarioCreate, db: Session = Depends(get_db)):
    if not validar_cpf(user.cpf):
        raise HTTPException(status_code=400, detail="CPF inválido")
    
    cpf_limpo = user.cpf.replace(".", "").replace("-", "")
    
    if db.query(Usuario).filter(Usuario.cpf == cpf_limpo).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
    
    db_usuario = Usuario(
        cpf=cpf_limpo,
        email=user.email,
        nome=user.nome,
        senha_hash=hash_password(user.senha),
        role=RoleEnum.PACIENTE
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    
    return db_usuario

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3.2 Arquivo: `backend/.env`

```env
DATABASE_URL=sqlite:///./dental_flow.db
SECRET_KEY=sua-chave-super-secreta-aqui
DEBUG=True
```

---

## PASSO 4: Testa a API

```bash
cd backend

# Ativa venv
source venv/bin/activate  # Linux/Mac

# Roda a API
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# A API estará em: http://localhost:8000
# Docs interativa: http://localhost:8000/docs
```

**Teste no Swagger UI:**
1. Abra: http://localhost:8000/docs
2. Clique em "POST /api/v1/auth/register"
3. Teste o registro com um CPF válido

---

## PASSO 5: Frontend - Tela de Login

### 5.1 Arquivo: `frontend/src/App.jsx`

```javascript
import { useState } from 'react'
import './App.css'

function App() {
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          senha
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Erro ao fazer login')
        return
      }

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      alert(`✓ Login realizado!\nBem-vindo, ${data.usuario.nome}!`)
      setCpf('')
      setSenha('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">🦷 DentalFlow</h1>
          <p className="text-blue-50">Seu agendamento odontológico simplificado</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
```

### 5.2 Arquivo: `frontend/src/index.css`

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
}
```

---

## PASSO 6: Rodando tudo junto

### Terminal 1 - Backend

```bash
cd dental-flow/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2 - Frontend

```bash
cd dental-flow/frontend
npm run dev
```

### Acessar

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

---

## PASSO 7: Testar Login

### Registre um usuário PRIMEIRO

1. Abra http://localhost:8000/docs
2. Procure por "POST /api/v1/auth/register"
3. Clique em "Try it out"
4. Use um CPF válido (ex: `11144477735`)
5. Exemplo de request:

```json
{
  "cpf": "11144477735",
  "email": "test@example.com",
  "nome": "João Silva",
  "senha": "senha123"
}
```

6. Clique em "Execute"

### Faça login no frontend

1. Abra http://localhost:5173
2. Use o CPF e senha que registrou
3. Deve exibir: "✓ Login realizado! Bem-vindo, João Silva!"

---

## ✅ Checklist - Você completou:

- ✅ Backend funcional com autenticação
- ✅ Frontend com tela de login
- ✅ Validação de CPF real
- ✅ Banco de dados (SQLite)
- ✅ API REST básica

---

## 🎯 Próximos passos (para próximas semanas)

### Semana 1
- [x] Setup inicial (VOCÊ FARÁ HOJE)
- [ ] Criar model de Agendamento
- [ ] Implementar CRUD de Agendamentos
- [ ] Tela de agendamentos no frontend

### Semana 2
- [ ] Dashboard com estatísticas
- [ ] Calendar view
- [ ] Listar próximas consultas

### Semana 3
- [ ] Integração Stripe (pagamento)
- [ ] Envio de emails

### Semana 4+
- [ ] Testes
- [ ] Deploy
- [ ] Features avançadas

---

## 🆘 Problemas comuns?

### "ModuleNotFoundError: No module named 'fastapi'"

```bash
# Certifique-se de que ativou o venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstale dependências
pip install -r requirements.txt
```

### "Cannot GET /"

Frontend não encontra backend. Verifique:
- Backend está rodando em http://localhost:8000?
- CORS está configurado?
- Porta 8000 não está ocupada?

### "Error: EADDRINUSE: address already in use :::5173"

Porta 5173 já está em uso. Use outra:

```bash
npm run dev -- --port 5174
```

---

## 📚 Documentação útil

- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Tailwind: https://tailwindcss.com/

---

## 🚀 COMEÇAR AGORA!

Copie os comandos abaixo e execute em sequência:

```bash
# 1. Clone/crie estrutura
mkdir dental-flow && cd dental-flow
mkdir backend frontend

# 2. Setup backend
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic bcrypt python-jose python-dotenv

# 3. Copie os arquivos (main.py, models.py, .env)
# (use os códigos acima)

# 4. Setup frontend
cd ../frontend
npm create vite@latest . -- --template react
npm install zustand axios react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. Copie os arquivos React (App.jsx, index.css)

# 6. Rode tudo!
# Terminal 1:
cd backend && python -m uvicorn app.main:app --reload

# Terminal 2:
cd frontend && npm run dev

# Abra: http://localhost:5173
```

---

**Boa sorte! 🚀 Você vai conseguir!**

Qualquer dúvida, avise! 💪
