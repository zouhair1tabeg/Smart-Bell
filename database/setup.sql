-- ############################################################################
-- # Nom du Projet : SmartBell
-- # Description  : Script de création de la base de données PostgreSQL
-- # Auteur       : Antigravity (Expert SQL)
-- ############################################################################

-- Extension pour la gestion des mots de passe (facultatif si géré par l'app)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Table des Utilisateurs (Administrateurs)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stocke le hash (BCrypt/Argon2)
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superuser')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Table des Profils de Sonnerie (ex: Hiver, Examens, Standard)
CREATE TABLE IF NOT EXISTS bell_profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Horaires de Planning
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES bell_profiles(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL, -- Heure précise de la sonnerie
    duration_seconds INTEGER NOT NULL DEFAULT 5 CHECK (duration_seconds > 0),
    days_of_week INTEGER[] NOT NULL, -- Tableau d'entiers [0-6] (0=Dimanche)
    is_enabled BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id)
);

-- 4. Table des Jours Fériés et Exceptions (Calendrier spécial)
CREATE TABLE IF NOT EXISTS holidays (
    id SERIAL PRIMARY KEY,
    holiday_date DATE UNIQUE NOT NULL,
    label VARCHAR(100),
    is_recurring BOOLEAN DEFAULT false -- Si vrai, seule la date (mois/jour) compte
);

-- 5. Table des Unités de Contrôle (ESP32) 
-- Utile pour gérer plusieurs boîtiers si nécessaire
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    mac_address VARCHAR(17) UNIQUE NOT NULL,
    label VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    last_seen TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT false,
    firmware_version VARCHAR(20)
);

-- 6. Table des Logs d'Activité (Historique)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    device_id INTEGER REFERENCES devices(id),
    action VARCHAR(100) NOT NULL, -- ex: 'TRIGGER_AUTO', 'TRIGGER_MANUAL'
    status VARCHAR(20),            -- ex: 'SUCCESS', 'ERROR'
    message TEXT
);

-- Index pour optimiser les performances
CREATE INDEX idx_schedules_time ON schedules(scheduled_time);
CREATE INDEX idx_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_holidays_date ON holidays(holiday_date);

-- ############################################################################
-- # Exemples d'insertion de base
-- ############################################################################

-- Insertion d'un profil par défaut
INSERT INTO bell_profiles (name, description, is_active) 
VALUES ('Standard', 'Emploi du temps classique de l''année scolaire', true);

-- Exemple de sonnerie de 8h00 du Lundi (1) au Vendredi (5)
-- INSERT INTO schedules (profile_id, scheduled_time, duration_seconds, days_of_week) 
-- VALUES (1, '08:00:00', 5, ARRAY[1, 2, 3, 4, 5]);
