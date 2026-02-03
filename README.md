# SmartBell - Système de Sonnerie Automatisé

Système complet de gestion de sonnerie scolaire avec interface web et microcontrôleur ESP32.

## 🎯 Fonctionnalités

- ✅ Planification automatique des horaires
- ✅ Déclenchement manuel via interface web
- ✅ Gestion des jours de la semaine
- ✅ Historique des événements (logs)
- ✅ Synchronisation RTC via NTP
- ✅ Communication MQTT et REST API
- ✅ Interface responsive (PC/Tablette)

## 🚀 Démarrage Rapide

### Lancement Automatique
```bash
./start.sh
```

### Lancement Manuel

**Backend:**
```bash
source venv/bin/activate
cd backend
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd admin-frontend
npm run dev
```

**Accès:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Credentials: `admin` / `admin123`

## 📖 Documentation

- [Guide de Lancement Complet](GUIDE_LANCEMENT.md)
- [Spécifications](documentation/specification.md)
- [Analyse Technique](documentation/analysis.md)

## 🏗️ Architecture

```
SmartBell/
├── backend/              # API FastAPI (Python)
├── admin-frontend/       # Interface React + Tailwind
├── firmware/             # Code ESP32 (Arduino)
└── documentation/        # Specs et diagrammes UML
```

## 🛠️ Stack Technique

- **Backend**: Python, FastAPI, SQLAlchemy, MQTT
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Firmware**: ESP32, Arduino, DS3231 RTC
- **Database**: SQLite (dev) / PostgreSQL (prod)

## 📋 Use Cases Implémentés

- [x] UC1 - Authentification
- [x] UC2 - Gestion du planning
- [x] UC3 - Déclenchement manuel
- [x] UC5 - Consultation des logs
- [x] UC7 - Sonnerie automatique (ESP32)

## 🔧 Configuration ESP32

Éditez `firmware/SmartBell/config.h`:
```cpp
static const char *ssid = "VOTRE_SSID";
static const char *password = "VOTRE_PASSWORD";
static const char *mqtt_server = "192.168.1.100";
static const char *api_url = "http://192.168.1.100:8000/api/schedule";
```

## 📦 Installation

### Backend
```bash
pip install -r backend/requirements.txt
cd backend && python init_db.py
```

### Frontend
```bash
cd admin-frontend
npm install
```

### Firmware
Bibliothèques Arduino requises:
- ArduinoJson
- PubSubClient
- RTClib

## 🎓 Développé selon les spécifications UML du Cahier des Charges SmartBell
