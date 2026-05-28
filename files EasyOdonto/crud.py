from sqlalchemy.orm import Session
from datetime import date
import random, string

import models, schemas


def _gerar_codigo() -> str:
    """Gera código único no formato BK-XXXX."""
    chars = string.ascii_uppercase + string.digits
    return "BK-" + "".join(random.choices(chars, k=6))


# ── Barbeiros ──────────────────────────────

def get_barbeiros(db: Session):
    return db.query(models.Barbeiro).filter(models.Barbeiro.ativo == True).all()

def get_barbeiro(db: Session, barbeiro_id: int):
    return db.query(models.Barbeiro).filter(models.Barbeiro.id == barbeiro_id).first()


# ── Serviços ───────────────────────────────

def get_servicos(db: Session):
    return db.query(models.Servico).filter(models.Servico.ativo == True).all()

def get_servico(db: Session, servico_id: int):
    return db.query(models.Servico).filter(models.Servico.id == servico_id).first()


# ── Disponibilidade ────────────────────────

def get_horarios_ocupados(db: Session, barbeiro_id: int, data: date) -> list[str]:
    """Retorna lista de horários já agendados (não cancelados) para um barbeiro em uma data."""
    agendamentos = (
        db.query(models.Agendamento)
        .filter(
            models.Agendamento.barbeiro_id == barbeiro_id,
            models.Agendamento.data == data,
            models.Agendamento.cancelado == False,
        )
        .all()
    )
    return [ag.horario for ag in agendamentos]


# ── Agendamentos ───────────────────────────

def criar_agendamento(db: Session, payload: schemas.AgendamentoCreate) -> models.Agendamento:
    # Gerar código único
    codigo = _gerar_codigo()
    while db.query(models.Agendamento).filter(models.Agendamento.codigo == codigo).first():
        codigo = _gerar_codigo()

    # Buscar serviços
    servicos = [
        db.query(models.Servico).filter(models.Servico.id == sid).first()
        for sid in payload.servico_ids
    ]

    ag = models.Agendamento(
        codigo=codigo,
        cliente_nome=payload.cliente_nome,
        cliente_tel=payload.cliente_tel,
        cliente_email=payload.cliente_email or "",
        barbeiro_id=payload.barbeiro_id,
        data=payload.data,
        horario=payload.horario,
        servicos=servicos,
    )
    db.add(ag)
    db.commit()
    db.refresh(ag)
    return ag

def get_agendamento_por_codigo(db: Session, codigo: str):
    return db.query(models.Agendamento).filter(models.Agendamento.codigo == codigo).first()

def cancelar_agendamento(db: Session, agendamento: models.Agendamento):
    agendamento.cancelado = True
    db.commit()

def get_agendamentos_barbeiro(db: Session, barbeiro_id: int, data: date | None = None):
    q = db.query(models.Agendamento).filter(
        models.Agendamento.barbeiro_id == barbeiro_id,
        models.Agendamento.cancelado == False,
    )
    if data:
        q = q.filter(models.Agendamento.data == data)
    return q.order_by(models.Agendamento.data, models.Agendamento.horario).all()
