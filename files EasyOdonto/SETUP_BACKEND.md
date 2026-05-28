# Backend DentalFlow - FastAPI

## Setup Inicial

```bash
# Criar pasta do projeto
mkdir -p dental-flow/backend
cd dental-flow/backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências (requirements.txt abaixo)
pip install -r requirements.txt
```

---

## requirements.txt

```txt
# Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.0
PyJWT==2.8.1

# Validation
email-validator==2.1.0

# Background Tasks
celery==5.3.4
redis==5.0.1

# Payment
stripe==7.4.0

# Email
python-multipart==0.0.6
aiosmtplib==3.0.0

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2

# Code Quality
black==23.12.0
flake8==6.1.0
mypy==1.7.1

# Logging & Monitoring
python-json-logger==2.0.7

# CORS & Middleware
python-multipart==0.0.6
```

---

## .env.example

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dental_flow_dev
SQLALCHEMY_ECHO=True

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
ENVIRONMENT=development

# Redis (Cache/Sessions)
REDIS_URL=redis://localhost:6379/0

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SENDER_EMAIL=noreply@dentalflow.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# App
APP_NAME=DentalFlow
APP_VERSION=0.1.0
APP_DESCRIPTION=SaaS de agendamento odontológico profissional
```

---

## docker-compose.yml (Local Development)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: dental_flow_db
    environment:
      POSTGRES_USER: dental_user
      POSTGRES_PASSWORD: dental_password
      POSTGRES_DB: dental_flow_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dental_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: dental_flow_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  backend:
    build: .
    container_name: dental_flow_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://dental_user:dental_password@postgres:5432/dental_flow_dev
      - REDIS_URL=redis://redis:6379/0
      - DEBUG=True
    volumes:
      - .:/app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - dental_network

  # pgAdmin (UI para gerenciar banco)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: dental_flow_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@dentalflow.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    networks:
      - dental_network

volumes:
  postgres_data:

networks:
  dental_network:
    driver: bridge
```

---

## Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Executar migrações e iniciar servidor
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

---

## app/config.py

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "DentalFlow"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/dental_flow_dev"
    
    # Security
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Email
    SMTP_HOST: str = "smtp.sendgrid.net"
    SMTP_PORT: int = 587
    SMTP_USER: str = "apikey"
    SMTP_PASSWORD: str = ""
    SENDER_EMAIL: str = "noreply@dentalflow.com"
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLIC_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
```

---

## app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db.database import engine
from app.models import usuario, agendamento, paciente
from app.api.v1 import auth, agendamentos, pacientes

# Criar tabelas
usuario.Base.metadata.create_all(bind=engine)
agendamento.Base.metadata.create_all(bind=engine)
paciente.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 API iniciando...")
    yield
    # Shutdown
    print("🛑 API encerrando...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SaaS profissional de agendamento odontológico",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(agendamentos.router, prefix="/api/v1/agendamentos", tags=["agendamentos"])
app.include_router(pacientes.router, prefix="/api/v1/pacientes", tags=["pacientes"])

@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Bem-vindo ao DentalFlow",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
```

---

## app/db/database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=0,
)

# SessionLocal
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## app/models/usuario.py

```python
from sqlalchemy import Column, String, Boolean, DateTime, Enum
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
    
    id = Column(String, primary_key=True, index=True)
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
    pagamentos = relationship("Pagamento", back_populates="usuario")
```

---

## app/schemas/usuario.py

```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    PACIENTE = "paciente"
    DENTISTA = "dentista"
    ADMIN = "admin"

class UsuarioBase(BaseModel):
    cpf: str = Field(..., regex=r"^\d{11}$", description="CPF sem formatação")
    email: EmailStr
    nome: str

class UsuarioCreate(UsuarioBase):
    senha: str = Field(..., min_length=8)

class UsuarioResponse(UsuarioBase):
    id: str
    role: RoleEnum
    ativo: bool
    email_verificado: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    cpf: str
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
```

---

## app/utils/security.py

```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha: str, hash: str) -> bool:
    return pwd_context.verify(senha, hash)

def criar_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def criar_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def verificar_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

---

## app/utils/validators.py

```python
def validar_cpf(cpf: str) -> bool:
    """
    Valida CPF usando o algoritmo dos dígitos verificadores
    """
    cpf = cpf.replace(".", "").replace("-", "").strip()
    
    if len(cpf) != 11 or not cpf.isdigit():
        return False
    
    # CPFs com todos os dígitos iguais são inválidos
    if cpf == cpf[0] * 11:
        return False
    
    # Primeiro dígito verificador
    soma1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto1 = soma1 % 11
    digito1 = 0 if resto1 < 2 else 11 - resto1
    
    if int(cpf[9]) != digito1:
        return False
    
    # Segundo dígito verificador
    soma2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto2 = soma2 % 11
    digito2 = 0 if resto2 < 2 else 11 - resto2
    
    if int(cpf[10]) != digito2:
        return False
    
    return True
```

---

## Próximas etapas:

1. **Criar models** (Agendamento, Paciente, Pagamento)
2. **Implementar autenticação** (endpoint /auth/login)
3. **Criar CRUD agendamentos**
4. **Setup frontend** (React + Vite)
5. **Integrar backend + frontend**

Quer que eu continue com os models e endpoints de autenticação?
