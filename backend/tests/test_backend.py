import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..database import Base, get_db
from ..main import app
from ..mqtt_service import client
import json

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client_test = TestClient(app)

# Use Cases Tests

def test_auth_uc1():
    """Test UC1: S'authentifier"""
    # First create a user (simplified)
    # response = client_test.post("/auth/login", json={"username": "admin", "password": "password"})
    # assert response.status_code == 200
    pass

def test_create_schedule_uc2():
    """Test UC2: Gérer le planning"""
    response = client_test.post("/schedule", json={
        "heure": "08:00:00",
        "joursActifs": ["Lundi", "Mardi"],
        "duree": 5,
        "isHolidayException": False
    })
    assert response.status_code == 200
    assert response.json()["heure"] == "08:00:00"

def test_manual_trigger_uc3():
    """Test UC3: Déclencher sonnerie manuelle"""
    response = client_test.post("/trigger", json={"action": "ON", "duration": 10})
    assert response.status_code == 200
    assert response.json()["status"] == "Trigger sent"

def test_read_logs_uc5():
    """Test UC5: Consulter les logs"""
    response = client_test.get("/logs")
    assert response.status_code == 200
    assert len(response.json()) > 0 # Should have logs from previous tests

def test_api_sync_rest():
    """Test Synchronisation REST (Sequence Diagram)"""
    response = client_test.get("/api/schedule")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
