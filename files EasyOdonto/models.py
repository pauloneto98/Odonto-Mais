from sqlalchemy import Column, Integer, String, Date, Boolean, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# Tabela de associação entre Agendamento e Serviço (muitos-para-muitos)
agendamento_servico = Table(
    "agendamento_servico",
    Base.metadata,
    Column("agendamento_id", Integer, ForeignKey("agendamentos.id"), primary_key=True),
    Column("servico_id", Integer, ForeignKey("servicos.id"), primary_key=True),
)


class Barbeiro(Base):
    __tablename__ = "barbeiros"

    id        = Column(Integer, primary_key=True, index=True)
    nome      = Column(String(100), nullable=False)
    cargo     = Column(String(100), default="Barber")
    avatar    = Column(String(10), default="✂")
    avaliacao = Column(Float, default=5.0)
    total_cortes = Column(Integer, default=0)
    especialidades = Column(String(300), default="")  # separadas por vírgula
    ativo     = Column(Boolean, default=True)

    agendamentos = relationship("Agendamento", back_populates="barbeiro")


class Servico(Base):
    __tablename__ = "servicos"

    id        = Column(Integer, primary_key=True, index=True)
    nome      = Column(String(100), nullable=False)
    descricao = Column(String(200), default="")
    preco     = Column(Float, nullable=False)
    duracao   = Column(String(20), default="30 min")
    ativo     = Column(Boolean, default=True)


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id          = Column(Integer, primary_key=True, index=True)
    codigo      = Column(String(20), unique=True, index=True, nullable=False)
    cliente_nome = Column(String(150), nullable=False)
    cliente_tel  = Column(String(30), nullable=False)
    cliente_email = Column(String(150), default="")
    barbeiro_id  = Column(Integer, ForeignKey("barbeiros.id"), nullable=False)
    data        = Column(Date, nullable=False)
    horario     = Column(String(10), nullable=False)  # "14:30"
    cancelado   = Column(Boolean, default=False)

    barbeiro  = relationship("Barbeiro", back_populates="agendamentos")
    servicos  = relationship("Servico", secondary=agendamento_servico)
