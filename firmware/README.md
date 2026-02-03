# ESP32 Firmware - SmartBell

Ce dossier contient le code source C++ pour le boîtier de contrôle **SmartBell**.

## Composants Matériels requis
- ESP32 (ex: DevKit v1).
- Module RTC DS3231.
- Module Relais 5V (Opto-isolé).
- Bouton poussoir (pour l'override manuel).

## Bibliothèques Arduino requises
Vous devez installer les bibliothèques suivantes via le Gestionnaire de bibliothèques Arduino :
- `PubSubClient` (par Nick O'Leary) - Pour le MQTT.
- `ArduinoJson` (par Benoit Blanchon) - Pour le parsing du planning.
- `RTClib` (par Adafruit) - Pour la gestion du DS3231.

## Configuration
Avant de téléverser le code, modifiez le fichier **[config.h](SmartBell/config.h)** avec :
- Vos identifiants Wi-Fi.
- L'adresse IP de votre Broker MQTT et du serveur Backend.

## Structure du Code
Le code est structuré selon les diagrammes UML :
- **Initialisation** : Connexion Wi-Fi -> Sync NTP -> Sync RTC -> Sync REST (Fetch schedule).
- **Boucle Principale** : Gestion MQTT (Callback) + Vérification horaire auto + Détection bouton manuel.
