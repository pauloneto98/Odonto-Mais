"""
Popula o banco com dados iniciais (barbeiros e serviços).
Execute uma vez: python seed.py
"""
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Limpar dados antigos
db.query(models.Barbeiro).delete()
db.query(models.Servico).delete()
db.commit()

# ── Barbeiros ──────────────────────────────
barbeiros = [
    models.Barbeiro(
        nome="Rafael Silva",
        cargo="Master Barber",
        avatar="👨‍🦱",
        avaliacao=4.9,
        total_cortes=312,
        especialidades="Fade,Barba,Degradê",
    ),
    models.Barbeiro(
        nome="Lucas Mendes",
        cargo="Senior Barber",
        avatar="🧔",
        avaliacao=4.8,
        total_cortes=201,
        especialidades="Navalhado,Pompadour,Social",
    ),
    models.Barbeiro(
        nome="Diego Costa",
        cargo="Barber Specialist",
        avatar="👨‍🦲",
        avaliacao=4.6,
        total_cortes=158,
        especialidades="Afro,Dreads,Skin Fade",
    ),
    models.Barbeiro(
        nome="Matheus Alves",
        cargo="Barber Junior",
        avatar="🧑‍🦱",
        avaliacao=4.5,
        total_cortes=87,
        especialidades="Corte Clássico,Barba",
    ),
]

# ── Serviços ───────────────────────────────
servicos = [
    models.Servico(nome="Corte Masculino",   descricao="Tesoura ou máquina",       preco=45.0, duracao="30 min"),
    models.Servico(nome="Barba Completa",    descricao="Navalhado + hidratação",    preco=35.0, duracao="30 min"),
    models.Servico(nome="Corte + Barba",     descricao="O combo mais pedido",       preco=70.0, duracao="60 min"),
    models.Servico(nome="Toalha Quente",     descricao="Relaxamento facial",        preco=25.0, duracao="15 min"),
    models.Servico(nome="Sobrancelha",       descricao="Design e acabamento",       preco=15.0, duracao="10 min"),
]

db.add_all(barbeiros)
db.add_all(servicos)
db.commit()
db.close()

print("✅ Banco populado com sucesso!")
print(f"   {len(barbeiros)} barbeiros | {len(servicos)} serviços")
