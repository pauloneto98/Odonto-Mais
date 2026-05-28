from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite para desenvolvimento — troque por PostgreSQL em produção:
# DATABASE_URL = "postgresql://usuario:senha@localhost/barberking"
DATABASE_URL = "sqlite:///./barberking.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # necessário só para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
