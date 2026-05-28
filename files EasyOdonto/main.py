from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, time
import random, string

from database import SessionLocal, engine, Base
import models, schemas, crud

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BarberKing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─────────────────────────────────────────
#  BARBEIROS
# ─────────────────────────────────────────

@app.get("/barbeiros", response_model=list[schemas.Barbeiro])
def listar_barbeiros(db: Session = Depends(get_db)):
    """Retorna todos os barbeiros ativos."""
    return crud.get_barbeiros(db)

@app.get("/barbeiros/{barbeiro_id}", response_model=schemas.Barbeiro)
def buscar_barbeiro(barbeiro_id: int, db: Session = Depends(get_db)):
    b = crud.get_barbeiro(db, barbeiro_id)
    if not b:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    return b

# ─────────────────────────────────────────
#  DISPONIBILIDADE
# ─────────────────────────────────────────

@app.get("/disponibilidade/{barbeiro_id}/{data}")
def verificar_disponibilidade(barbeiro_id: int, data: date, db: Session = Depends(get_db)):
    """
    Retorna horários disponíveis e ocupados de um barbeiro em uma data.
    Formato da data: YYYY-MM-DD
    """
    b = crud.get_barbeiro(db, barbeiro_id)
    if not b:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")

    todos_horarios = [
        "08:30","09:00","09:30","10:00","10:30","11:00","11:30",
        "13:00","13:30","14:00","14:30","15:00","15:30",
        "16:00","16:30","17:00","17:30","18:00"
    ]

    agendados = crud.get_horarios_ocupados(db, barbeiro_id, data)

    slots = [
        {
            "horario": h,
            "disponivel": h not in agendados
        }
        for h in todos_horarios
    ]

    return {
        "barbeiro_id": barbeiro_id,
        "data": str(data),
        "dia_semana": data.strftime("%A"),
        "slots": slots
    }

# ─────────────────────────────────────────
#  SERVIÇOS
# ─────────────────────────────────────────

@app.get("/servicos", response_model=list[schemas.Servico])
def listar_servicos(db: Session = Depends(get_db)):
    """Retorna todos os serviços disponíveis."""
    return crud.get_servicos(db)

# ─────────────────────────────────────────
#  AGENDAMENTOS
# ─────────────────────────────────────────

@app.post("/agendamentos", response_model=schemas.AgendamentoOut, status_code=201)
def criar_agendamento(payload: schemas.AgendamentoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo agendamento.
    Valida se o horário ainda está disponível antes de salvar.
    """
    # Verificar se o barbeiro existe
    b = crud.get_barbeiro(db, payload.barbeiro_id)
    if not b:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")

    # Verificar se o horário está disponível
    ocupados = crud.get_horarios_ocupados(db, payload.barbeiro_id, payload.data)
    if payload.horario in ocupados:
        raise HTTPException(
            status_code=409,
            detail=f"Horário {payload.horario} já está ocupado para este barbeiro nesta data."
        )

    # Verificar se os serviços existem
    for sid in payload.servico_ids:
        if not crud.get_servico(db, sid):
            raise HTTPException(status_code=404, detail=f"Serviço {sid} não encontrado")

    agendamento = crud.criar_agendamento(db, payload)
    return agendamento

@app.get("/agendamentos/{codigo}", response_model=schemas.AgendamentoOut)
def buscar_agendamento(codigo: str, db: Session = Depends(get_db)):
    """Busca um agendamento pelo código de confirmação."""
    ag = crud.get_agendamento_por_codigo(db, codigo)
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return ag

@app.delete("/agendamentos/{codigo}", status_code=200)
def cancelar_agendamento(codigo: str, db: Session = Depends(get_db)):
    """Cancela um agendamento pelo código."""
    ag = crud.get_agendamento_por_codigo(db, codigo)
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    crud.cancelar_agendamento(db, ag)
    return {"mensagem": f"Agendamento {codigo} cancelado com sucesso."}

@app.get("/agendamentos/barbeiro/{barbeiro_id}", response_model=list[schemas.AgendamentoOut])
def agendamentos_do_barbeiro(barbeiro_id: int, data: date | None = None, db: Session = Depends(get_db)):
    """Lista agendamentos de um barbeiro, com filtro opcional por data."""
    return crud.get_agendamentos_barbeiro(db, barbeiro_id, data)
