# 🔔 Guide de Lancement - SmartBell

Ce guide explique comment lancer l'ensemble du système SmartBell (Backend, Frontend, et Firmware).

## 📋 Prérequis

### Backend (Python)
- Python 3.8+
- pip (gestionnaire de paquets Python)

### Frontend (React)
- Node.js 16+
- npm ou yarn

### Firmware (ESP32)
- Arduino IDE ou PlatformIO
- Carte ESP32
- Module RTC DS3231
- Relais 5V

## 🚀 Lancement du Système

### 1️⃣ Backend (API Python FastAPI)

```bash
# Depuis le répertoire racine du projet
cd /Users/zouhair/Desktop/SmartBell

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances (première fois uniquement)
pip install -r backend/requirements.txt

# Initialiser la base de données (première fois uniquement)
cd backend && python init_db.py

# Lancer le serveur backend
cd backend
uvicorn main:app --reload --port 8000
```

**Le backend sera accessible sur:** `http://localhost:8000`

**Credentials par défaut:**
- Username: `admin`
- Password: `admin123`

#### Endpoints API disponibles:
- `POST /auth/login` - Authentification
- `GET /api/schedule` - Récupérer tous les plannings
- `POST /schedule` - Créer un nouveau planning
- `POST /trigger` - Déclencher manuellement la sonnerie
- `GET /logs` - Consulter les logs d'activité

### 2️⃣ Frontend (Interface Admin React)

**Dans un nouveau terminal:**

```bash
# Depuis le répertoire racine
cd /Users/zouhair/Desktop/SmartBell/admin-frontend

# Installer les dépendances (première fois uniquement)
npm install

# Lancer le serveur de développement
npm run dev
```

**L'interface sera accessible sur:** `http://localhost:5173`

#### Fonctionnalités disponibles:
- ✅ **Dashboard** - État du système et déclenchement manuel
- ✅ **Programmation** - Gestion des horaires automatiques
- ✅ **Logs** - Historique des événements

### 3️⃣ Firmware (ESP32)

#### Configuration WiFi et MQTT

Éditez le fichier `firmware/SmartBell/config.h`:

```cpp
// WiFi Configuration
static const char *ssid = "VOTRE_SSID";
static const char *password = "VOTRE_PASSWORD";

// MQTT Configuration
static const char *mqtt_server = "192.168.1.100"; // IP du serveur
static const int mqtt_port = 1883;

// API REST Backend
static const char *api_url = "http://192.168.1.100:8000/api/schedule";
```

#### Téléversement sur l'ESP32

1. Ouvrez `firmware/SmartBell/SmartBell.ino` dans Arduino IDE
2. Sélectionnez la carte: **ESP32 Dev Module**
3. Sélectionnez le port série approprié
4. Cliquez sur **Téléverser**

#### Dépendances Arduino requises:
- `ArduinoJson` (v6 ou v7)
- `PubSubClient` (MQTT)
- `RTClib` (DS3231)
- `WiFi` (inclus avec ESP32)
- `HTTPClient` (inclus avec ESP32)

## 🧪 Tests de Vérification

### Test Backend
```bash
# Test de login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'

# Test récupération planning
curl http://localhost:8000/api/schedule

# Test logs
curl http://localhost:8000/logs
```

### Test Frontend
1. Ouvrez `http://localhost:5173`
2. Connectez-vous avec `admin` / `admin123`
3. Vérifiez que le dashboard s'affiche
4. Testez le déclenchement manuel
5. Créez un nouveau planning
6. Consultez les logs

### Test Firmware (avec ESP32 connecté)
1. Ouvrez le **Moniteur Série** (115200 baud)
2. Vérifiez la connexion WiFi
3. Vérifiez la synchronisation NTP → RTC
4. Vérifiez la récupération du planning via REST
5. Testez le bouton physique (si câblé)

## 🔧 Dépannage

### Backend ne démarre pas
- Vérifiez que le port 8000 n'est pas déjà utilisé
- Vérifiez que l'environnement virtuel est activé
- Réinitialisez la base de données: `rm smartbell.db && python init_db.py`

### Frontend affiche une erreur CORS
- Vérifiez que le backend est bien lancé sur le port 8000
- Le CORS est configuré pour accepter `localhost:5173`

### ESP32 ne se connecte pas au WiFi
- Vérifiez les credentials dans `config.h`
- Vérifiez que l'ESP32 est à portée du réseau
- Utilisez le moniteur série pour voir les messages de debug

### MQTT Connection Failed
- C'est normal si vous n'avez pas de broker MQTT installé
- Le système fonctionne en mode REST uniquement
- Pour installer Mosquitto (broker MQTT):
  ```bash
  brew install mosquitto
  brew services start mosquitto
  ```

## 📁 Structure du Projet

```
SmartBell/
├── backend/              # API Python FastAPI
│   ├── main.py          # Point d'entrée
│   ├── models.py        # Modèles SQLAlchemy
│   ├── schemas.py       # Schémas Pydantic
│   ├── database.py      # Configuration DB
│   ├── mqtt_service.py  # Service MQTT
│   └── init_db.py       # Script d'initialisation
├── admin-frontend/      # Interface React
│   ├── src/
│   │   ├── pages/       # Pages (Login, Dashboard, etc.)
│   │   ├── components/  # Composants réutilisables
│   │   ├── api.js       # Client Axios
│   │   └── AuthContext.jsx
│   └── package.json
├── firmware/            # Code ESP32
│   └── SmartBell/
│       ├── SmartBell.ino
│       └── config.h
└── documentation/       # Spécifications et diagrammes UML
```

## 🎯 Flux de Fonctionnement

1. **Au démarrage de l'ESP32:**
   - Connexion WiFi
   - Synchronisation NTP → RTC
   - Récupération du planning via `GET /api/schedule`

2. **En fonctionnement normal:**
   - L'ESP32 compare l'heure RTC avec le planning local
   - Si correspondance → Active le relais

3. **Déclenchement manuel:**
   - Admin clique sur "SONNER MAINTENANT" dans le frontend
   - Frontend → `POST /trigger` → Backend
   - Backend → Publie sur MQTT `smartbell/trigger`
   - ESP32 reçoit le message → Active le relais

4. **Mise à jour du planning:**
   - Admin crée un horaire dans le frontend
   - Frontend → `POST /schedule` → Backend
   - Backend → Publie sur MQTT `smartbell/sync`
   - ESP32 reçoit → Refait un `GET /api/schedule`

## ✅ Checklist de Démarrage Rapide

- [ ] Backend lancé sur port 8000
- [ ] Frontend lancé sur port 5173
- [ ] Connexion réussie avec admin/admin123
- [ ] Dashboard affiche l'état du système
- [ ] Planning existant visible (08:00 en semaine)
- [ ] ESP32 connecté au WiFi (optionnel pour tester le frontend)
- [ ] RTC synchronisé (optionnel)

## 📞 Support

Pour toute question ou problème, vérifiez:
1. Les logs du backend dans le terminal
2. La console du navigateur (F12) pour le frontend
3. Le moniteur série pour l'ESP32

---

**Développé selon les spécifications UML du Cahier des Charges SmartBell** 🎓
