from sqlalchemy import Column, Integer, String, Boolean, Time, DateTime, ForeignKey, Text, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    passwordHash = Column(String, nullable=False)
    role = Column(String, default="admin")

    plannings = relationship("Planning", back_populates="owner")

class Planning(Base):
    __tablename__ = "plannings"
    id = Column(Integer, primary_key=True, index=True)
    heure = Column(Time, nullable=False)
    joursActifs = Column(Text, nullable=False) # Store as comma-separated string for SQLite compatibility
    duree = Column(Integer, default=5)
    isHolidayException = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="plannings")

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action = Column(String, nullable=False)
    source = Column(String, nullable=False)
    message = Column(Text)
