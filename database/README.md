# Structure de la Base de Données (PostgreSQL)

Ce document détaille le schéma relationnel conçu pour le système **SmartBell**.

## Dictionnaire des Données

### 1. Table `users`
Stocke les informations d'authentification pour l'interface d'administration.
- `id` : Clef primaire.
- `username` : Identifiant unique.
- `password_hash` : Hachage sécurisé du mot de passe.
- `role` : Niveau d'accès (admin, superuser).

### 2. Table `bell_profiles`
Permet de basculer rapidement entre différents types de planification.
- `name` : Nom du profil (ex: "Examen", "Hiver").
- `is_active` : Indique si ce profil est celui actuellement utilisé par les ESP32.

### 3. Table `schedules`
Définit les heures exactes des sonneries.
- `scheduled_time` : L'heure (format HH:MM:SS).
- `days_of_week` : Un tableau d'entiers (ex: `ARRAY[1,2,3,4,5]` pour la semaine).
- `duration_seconds` : Durée du signal électrique (relais).

### 4. Table `holidays`
Liste des dates où les sonneries doivent être automatiquement suspendues.
- `holiday_date` : Date de l'exception.

### 5. Table `devices`
Gestion des boîtiers ESP32 connectés.
- `mac_address` : Identifiant physique unique.
- `timezone` : Fuseau horaire pour la gestion du DST.
- `last_seen` : Horodatage du dernier "Ping" ou message LWT.

### 6. Table `activity_logs`
Historique complet pour l'audit et le débogage.
- `timestamp` : Date et heure de l'événement.
- `action` : Type d'événement (Démarrage, Sonnerie, Erreur RTC).

## Schéma SQL
Le script complet est disponible ici : **[setup.sql](setup.sql)**
