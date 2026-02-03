from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, mqtt_service
from datetime import datetime

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    models.Base.metadata.create_all(bind=database.engine)
    mqtt_service.start_mqtt()
    yield

app = FastAPI(title="SmartBell API", lifespan=lifespan)

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# UC1: S'authentifier (Simple implementation as per requirements)
@app.post("/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user or user.passwordHash != user_credentials.password: # Simplified for example
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": "fake-jwt-token", "token_type": "bearer"}

# UC2: Gérer le planning (Ajout)
@app.post("/schedule", response_model=schemas.Planning)
def create_schedule(schedule: schemas.PlanningCreate, db: Session = Depends(database.get_db)):
    data = schedule.model_dump()
    data["joursActifs"] = ",".join(data["joursActifs"]) # Convert list to string for DB
    db_schedule = models.Planning(**data, user_id=1) # Hardcoded user_id for simplicity
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    
    # Notify ESP32 via MQTT (Sequence Diagram)
    mqtt_service.notify_sync()
    
    # Log the action (UC5)
    new_log = models.Log(action="CREATE_SCHEDULE", source="WEB_ADMIN", message=f"Heure: {schedule.heure}")
    db.add(new_log)
    db.commit()
    
    # Convert back for response
    db_schedule.joursActifs = db_schedule.joursActifs.split(",")
    return db_schedule

# UC3: Déclencher sonnerie manuelle
@app.post("/trigger")
def manual_trigger(trigger: schemas.ManualTrigger, db: Session = Depends(database.get_db)):
    mqtt_service.trigger_manual(trigger.duration)
    
    # Log the action (UC5)
    new_log = models.Log(action="MANUAL_TRIGGER", source="WEB_ADMIN", message=f"Duree: {trigger.duration}s")
    db.add(new_log)
    db.commit()
    
    return {"status": "Trigger sent"}

# UC5: Consulter les logs d'activité
@app.get("/logs", response_model=List[schemas.Log])
def read_logs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    logs = db.query(models.Log).order_by(models.Log.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

# Sequence Diagram: Synchronisation REST
@app.get("/api/schedule", response_model=List[schemas.Planning])
def sync_schedule(db: Session = Depends(database.get_db)):
    plannings = db.query(models.Planning).filter(models.Planning.isHolidayException == False).all()
    for p in plannings:
        p.joursActifs = p.joursActifs.split(",")
    return plannings

# UC2: Gérer le planning (Modification)
@app.put("/schedule/{schedule_id}", response_model=schemas.Planning)
def update_schedule(schedule_id: int, schedule_update: schemas.PlanningUpdate, db: Session = Depends(database.get_db)):
    db_schedule = db.query(models.Planning).filter(models.Planning.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Update only provided fields
    update_data = schedule_update.model_dump(exclude_unset=True)
    if "joursActifs" in update_data and update_data["joursActifs"]:
        update_data["joursActifs"] = ",".join(update_data["joursActifs"])
    
    for key, value in update_data.items():
        setattr(db_schedule, key, value)
    
    db.commit()
    db.refresh(db_schedule)
    
    # Notify ESP32 via MQTT
    mqtt_service.notify_sync()
    
    # Log the action
    new_log = models.Log(action="UPDATE_SCHEDULE", source="WEB_ADMIN", message=f"Schedule ID: {schedule_id}")
    db.add(new_log)
    db.commit()
    
    # Convert back for response
    db_schedule.joursActifs = db_schedule.joursActifs.split(",")
    return db_schedule

# UC2: Gérer le planning (Suppression)
@app.delete("/schedule/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(database.get_db)):
    db_schedule = db.query(models.Planning).filter(models.Planning.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    db.delete(db_schedule)
    db.commit()
    
    # Notify ESP32 via MQTT
    mqtt_service.notify_sync()
    
    # Log the action
    new_log = models.Log(action="DELETE_SCHEDULE", source="WEB_ADMIN", message=f"Schedule ID: {schedule_id}")
    db.add(new_log)
    db.commit()
    
    return {"status": "Schedule deleted", "id": schedule_id}

# Dashboard: Statistiques
@app.get("/api/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(database.get_db)):
    from datetime import datetime, timedelta
    
    # Count triggers today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    triggers_today = db.query(models.Log).filter(
        models.Log.action == "MANUAL_TRIGGER",
        models.Log.timestamp >= today_start
    ).count()
    
    # Count triggers this week
    week_start = today_start - timedelta(days=today_start.weekday())
    triggers_week = db.query(models.Log).filter(
        models.Log.action == "MANUAL_TRIGGER",
        models.Log.timestamp >= week_start
    ).count()
    
    # Count active schedules
    active_schedules = db.query(models.Planning).filter(
        models.Planning.isHolidayException == False
    ).count()
    
    # Get next schedule (simplified - just get first one)
    next_schedule = db.query(models.Planning).filter(
        models.Planning.isHolidayException == False
    ).first()
    
    if next_schedule:
        next_schedule.joursActifs = next_schedule.joursActifs.split(",")
    
    return {
        "triggers_today": triggers_today,
        "triggers_week": triggers_week,
        "active_schedules": active_schedules,
        "next_schedule": next_schedule
    }

# Dashboard: État du système
@app.get("/api/status", response_model=schemas.SystemStatus)
def get_status(db: Session = Depends(database.get_db)):
    # Count active schedules
    active_schedules = db.query(models.Planning).filter(
        models.Planning.isHolidayException == False
    ).count()
    
    # Get last trigger
    last_log = db.query(models.Log).filter(
        models.Log.action == "MANUAL_TRIGGER"
    ).order_by(models.Log.timestamp.desc()).first()
    
    last_trigger = last_log.timestamp if last_log else None
    
    return {
        "status": "online",
        "active_schedules": active_schedules,
        "last_trigger": last_trigger,
        "esp32_connected": False  # Would need MQTT status check for real value
    }

