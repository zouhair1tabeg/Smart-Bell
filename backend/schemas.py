# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List, Optional
from datetime import time, datetime

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class PlanningBase(BaseModel):
    heure: time
    joursActifs: List[str]
    duree: int
    isHolidayException: bool = False

class PlanningCreate(PlanningBase):
    pass

class PlanningUpdate(BaseModel):
    heure: Optional[time] = None
    joursActifs: Optional[List[str]] = None
    duree: Optional[int] = None
    isHolidayException: Optional[bool] = None

class Planning(PlanningBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class LogBase(BaseModel):
    action: str
    source: str
    message: Optional[str] = None

class Log(LogBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ManualTrigger(BaseModel):
    action: str = "ON"
    duration: int

class DashboardStats(BaseModel):
    triggers_today: int
    triggers_week: int
    active_schedules: int
    next_schedule: Optional[Planning] = None
    esp32_connected: bool

class SystemStatus(BaseModel):
    status: str  # "online" | "offline"
    active_schedules: int
    last_trigger: Optional[datetime] = None
    esp32_connected: bool

