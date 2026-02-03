# Documentation SmartBell

Bienvenue dans la documentation du projet **SmartBell**, un système automatisé de sonnerie scolaire.

## Sommaire

1. [Cahier des Charges](specification.md)
2. [Diagrammes UML](diagrams/)
   - [Cas d'Utilisation](diagrams/use_case.puml)
   - [Diagramme de Classes](diagrams/class_diagram.puml)
   - [Diagramme de Séquence](diagrams/sequence.puml)
   - [Diagramme d'Activité](diagrams/activity.puml)
   - [Diagramme de Déploiement](diagrams/deployment.puml)
   - [Diagramme d'État](diagrams/state.puml)
3. [Base de Données](../database/README.md)

## Présentation du Projet

SmartBell est conçu pour automatiser les sonneries scolaires en utilisant une interface web moderne et un microcontrôleur ESP32. Le système est fiable, sécurisé et capable de fonctionner de manière autonome même en cas de perte de connexion internet grâce à son module RTC (Real Time Clock).

## Architecture

Le système repose sur une architecture répartie :
- **Frontend** : Interface d'administration (React/Vue).
- **Backend** : Serveur de gestion et API.
- **Microcontrôleur** : Unité physique de commande (ESP32).
- **Communication** : Protocole MQTT pour une réactivité maximale.
