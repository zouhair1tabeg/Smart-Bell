#!/usr/bin/env python3
"""
Script to initialize the SmartBell database with a test user.
"""
import sys
sys.path.insert(0, '/Users/zouhair/Desktop/SmartBell/backend')
from datetime import time

from database import engine, Base, SessionLocal
from models import User, Planning, Log

# Create tables
Base.metadata.create_all(bind=engine)

# Create a session
db = SessionLocal()

# Check if admin user exists
admin = db.query(User).filter(User.username == "admin").first()
if not admin:
    # Create admin user
    admin = User(
        username="admin",
        passwordHash="admin123",  # In production, this should be hashed
        role="admin"
    )
    db.add(admin)
    db.commit()
    print("✅ Admin user created (username: admin, password: admin123)")
else:
    print("✅ Admin user already exists")

# Add a sample schedule
sample_schedule = db.query(Planning).filter(Planning.heure == time(8, 0, 0)).first()
if not sample_schedule:
    sample = Planning(
        heure=time(8, 0, 0),
        joursActifs="Lundi,Mardi,Mercredi,Jeudi,Vendredi",
        duree=5,
        isHolidayException=False,
        user_id=admin.id
    )
    db.add(sample)
    db.commit()
    print("✅ Sample schedule created (08:00 weekdays)")
else:
    print("✅ Sample schedule already exists")

db.close()
print("\n🎉 Database initialized successfully!")
