from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional


# ── Barbeiro ──────────────────────────────

class Barbeiro(BaseModel):
    id: int
    nome: str
    cargo: str
    avatar: str
    avaliacao: float
    total_cortes: int
    especialidades: str
    ativo: bool

    model_config = {"from_attributes": True}


# ── Serviço ───────────────────────────────

class Servico(BaseModel):
    id: int
    nome: str
    descricao: str
    preco: float
    duracao: str
    ativo: bool

    model_config = {"from_attributes": True}


# ── Agendamento ───────────────────────────

class AgendamentoCreate(BaseModel):
    cliente_nome: str
    cliente_tel: str
    cliente_email: Optional[str] = ""
    barbeiro_id: int
    data: date
    horario: str          # formato "HH:MM"
    servico_ids: list[int]

    @field_validator("horario")
    @classmethod
    def validar_horario(cls, v):
        horarios_validos = [
            "08:30","09:00","09:30","10:00","10:30","11:00","11:30",
            "13:00","13:30","14:00","14:30","15:00","15:30",
            "16:00","16:30","17:00","17:30","18:00"
        ]
        if v not in horarios_validos:
            raise ValueError(f"Horário inválido. Use um dos: {horarios_validos}")
        return v

    @field_validator("data")
    @classmethod
    def validar_data(cls, v):
        from datetime import date as d
        if v < d.today():
            raise ValueError("A data não pode ser no passado.")
        if v.weekday() == 6:  # Domingo
            raise ValueError("Não abrimos aos domingos.")
        return v

    @field_validator("servico_ids")
    @classmethod
    def validar_servicos(cls, v):
        if not v:
            raise ValueError("Selecione ao menos um serviço.")
        return v


class ServicoSimples(BaseModel):
    id: int
    nome: str
    preco: float
    model_config = {"from_attributes": True}


class AgendamentoOut(BaseModel):
    id: int
    codigo: str
    cliente_nome: str
    cliente_tel: str
    cliente_email: str
    barbeiro_id: int
    data: date
    horario: str
    cancelado: bool
    servicos: list[ServicoSimples]

    model_config = {"from_attributes": True}
