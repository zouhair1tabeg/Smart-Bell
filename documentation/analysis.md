# Rapport d'Analyse Technique : Projet SmartBell

Après analyse détaillée du **Cahier des Charges** et des **Diagrammes UML**, voici les points d'attention, les incohérences logiques et les suggestions d'amélioration.

## 1. Analyse des Incohérences Logiques

### A. Synchronisation du Planning (Push vs Pull)
- **Le problème** : Le cahier des charges mentionne deux options (MQTT temps réel vs Planning local envoyé à 00h00). Le diagramme de séquence montre l'ESP32 vérifiant son planning local (`Heure == Horaire programmé`), ce qui est l'approche la plus robuste. Cependant, si le serveur envoie le planning uniquement à 00h00 et que l'ESP32 est hors-ligne à ce moment précis, il ratera la mise à jour de toute la journée.
- **Solution** : Ajouter une étape au démarrage de l'ESP32 (ou périodiquement) pour "demander" le planning (`GET /schedule`) au serveur si la connexion MQTT est rétablie (Modèle hybride).

### B. Gestion des Jours Fériés
- **Le problème** : Le `diagramme d'activité` montre un test "Jour férié ?". Or, la classe `Planning` dans le diagramme de classes ne contient que `joursActifs`. 
- **Incohérence** : Est-ce que c'est le serveur qui ne crée pas de planning pour les jours fériés, ou est-ce l'ESP32 qui possède une liste de dates à ignorer ? Pour un mode 100% autonome, l'ESP32 doit recevoir cette liste.

### C. Retour d'État (Feedback Loop)
- **Le problème** : Le diagramme de déploiement montre une communication unidirectionnelle entre le Relais et la Cloche.
- **Risque** : Si le relais "colle" (panne matérielle) ou si le fusible de la cloche saute, l'ESP32 et le serveur ne le sauront pas. Il manque un capteur de courant ou un retour d'état facultatif pour confirmer que la cloche a réellement sonné.

## 2. Fonctionnalités et Détails Manquants

### A. Gestion du Temps et Fuseaux Horaires
- **NTP vs RTC** : Le schéma mentionne le DS3231 pour la précision. Cependant, il manque la logique de **changement d'heure été/hiver (DST)**. Si le serveur envoie une heure "locale" et que l'heure RTC dérive, il faut un mécanisme de resynchronisation via NTP (Network Time Protocol) pour corriger le RTC hebdomadairement.
- **Timezone** : L'ESP32 doit-il être configuré avec un offset (ex: GMT+1) ou est-ce le serveur qui gère tout en UTC ? (Recommandation : Tout stocker en UTC et envoyer le timestamp local à l'ESP32).

### B. Spécification des Messages MQTT
Il manque la structure des payloads (charges utiles). Exemples suggérés :
- **Topic `trigger/manual`** : `{"action": "ON", "duration": 5}`
- **Topic `config/update`** : `{"schedule": [...], "server_time": 1704914400}`
- **Topic `logs`** : L'ESP32 devrait publier un "LWT" (Last Will and Testament) pour que le serveur sache immédiatement si l'unité est hors-ligne.

### C. Sécurité et Authentification
- **MQTT** : Le diagramme de déploiement mentionne "MQTT TLS", ce qui est excellent. Cependant, il faut préciser comment l'ESP32 s'authentifie auprès du Broker (Client ID / Username / Password).
- **Stockage local** : En cas de vol du boîtier, les identifiants Wi-Fi et MQTT sont-ils chiffrés dans la mémoire flash (NVS) de l'ESP32 ?

### D. Mode Manuel de Secours
- **Bouton Physique** : En plus de l'interface web, il manque souvent un bouton physique "Override" sur le boitier lui-même pour tester la cloche ou sonner manuellement sans passer par le réseau.

## 3. Synthèse des Recommandations

| Catégorie | Recommandation |
| :--- | :--- |
| **Logiciel** | Implémenter un mécanisme de *Retry* pour la récupération du planning au boot. |
| **Communication** | Définir un format JSON standard pour les messages MQTT. |
| **Maintenance** | Prévoir une fonction **OTA (Over-The-Air)** pour mettre à jour le code de l'ESP32 à distance. |
| **Sécurité** | Utiliser des certificats pour le MQTT TLS et ne pas coder les secrets "en dur". |
| **Fiabilité** | Ajouter une batterie de secours pour l'ESP32 pour qu'il garde l'heure et ses logs même en cas de coupure secteur. |

---
**Note** : Vos diagrammes sont globalement très cohérents. L'ajout d'une logique de "Check-in" au démarrage résoudrait la majeure partie des risques d'autonomie.
