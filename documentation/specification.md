# Cahier des Charges : Système Automatisé de Sonnerie Scolaire (SmartBell)

Ce document définit les spécifications techniques et fonctionnelles pour la conception et le déploiement d'un système de gestion de sonnerie scolaire piloté par une interface web et un microcontrôleur.

## 1. Analyse des Besoins

### Besoins Fonctionnels
* **Planification des horaires** : Interface permettant de définir des emplois du temps hebdomadaires.
* **Gestion des calendriers spéciaux** : Importation de calendriers de jours fériés/vacances.
* **Mode Manuel Forcé** : Bouton "Urgence" sur l'interface **ET** bouton physique sur le boîtier.
* **Configuration de la durée** : Réglage de la durée (ex: 3s pour cours, 10s pour récréation).
* **Système d'alertes** : Notifications en cas de déconnexion ou d'erreur RTC.
* **Mise à jour OTA (Over-The-Air)** : Possibilité de mettre à jour le firmware à distance.

### Besoins Non-Fonctionnels
* **Sécurité** : Authentification Login/Password + MQTT TLS.
* **Réactivité** : Latence minimale via MQTT.
* **Ergonomie** : Interface Responsive (PC/Mobile).
* **Fiabilité** : Fonctionnement autonome (RTC + Stockage local) + Watchdog.
* **Précision Temporelle** : Synchronisation NTP hebdomadaire et gestion automatique de l'heure d'été/hiver (DST).

## 2. Architecture Technique

### Hardware (Système Embarqué)
* **Microcontrôleur** : ESP32 avec Wi-Fi intégré.
* **Module RTC** : DS3231 (Précision cruciale avec pile de secours).
* **Module Relais** : Relais 5V/10A avec optocoupleur.
* **Interfaces physiques** : Bouton poussoir de secours (Override).
* **Alimentation** : 5V stable avec option batterie de secours (UPS léger).

### Software (Stack Technologique)
* **Frontend** : React.js ou Vue.js + Tailwind CSS.
* **Backend** : Node.js (Express) ou Python (FastAPI).
* **Base de données** : SQLite ou PostgreSQL.
* **Communication** : MQTT (Protocole maître) + API REST (Fallback/Sync).

### Communication & Messages
* **Protocole MQTT** :
    * `smartbell/trigger` : Commande manuelle `{"action": "ON", "duration": 5}`.
    * `smartbell/sync` : Notification de mise à jour du planning.
    * `smartbell/logs` : Publication des événements par l'ESP32.
    * `smartbell/status` : Message LWT (Last Will and Testament) pour l'état en ligne.
* **API REST** :
    * `GET /api/schedule` : Utilisé par l'ESP32 au démarrage pour récupérer tout le planning (Pull).

## 3. Spécifications de l'Interface Admin
L'interface est divisée en trois modules principaux :
* **Tableau de Bord** : État (Ligne/Hors ligne), Prochaine sonnerie, Bouton "Déclenchement Immédiat".
* **Gestion des Horaires** : Calendrier, Profils (Hiver/Examen), Gestion des exceptions (Jours fériés).
* **Paramètres** : Gestion admin, Logs, Configuration NTP/Timezone, Mise à jour Firmware.

## 4. Schéma de Fonctionnement (Flux de données)
1. **Démarrage (Startup)** :
    * L'ESP32 se connecte au Wi-Fi.
    * Synchronisation de l'heure via NTP et mise à jour du RTC.
    * Appel API REST `GET /schedule` pour charger le planning en mémoire locale (NVS/Flash).
2. **Fonctionnement Nominal** :
    * L'ESP32 compare chaque seconde l'heure RTC avec le planning local.
    * En cas de correspondance, le relais est activé.
3. **Mise à jour en temps réel** :
    * Si l'admin change un horaire, le serveur publie sur le topic `smartbell/sync`.
    * L'ESP32 reçoit l'alerte et refait un `GET /schedule`.

## 5. Contraintes et Sécurité
* **Autonomie** : En cas de coupure Wi-Fi, l'ESP32 utilise son planning local et son RTC.
* **Gestion DST** : Le firmware intègre une bibliothèque pour calculer le passage à l'heure d'été/hiver selon la zone géographique.
* **Sécurité** : Communication HTTPS pour l'API et TLS pour MQTT. Secrets (SSID, Password) stockés de manière sécurisée (NVS chiffré si possible).
* **Watchdog** : Redémarrage auto en cas de plantage logiciel.
