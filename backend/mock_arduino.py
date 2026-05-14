import paho.mqtt.client as mqtt
import time
import json

broker_address = "192.168.0.140"
port = 1883

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("✅ Mock Arduino connecté au Broker MQTT!")
        # Publier le statut en ligne
        client.publish("smartbell/status", json.dumps({"status": "online"}), retain=True)
        # S'abonner aux déclencheurs
        client.subscribe("smartbell/trigger")
    else:
        print(f"❌ Échec de la connexion: code {rc}")

def on_message(client, userdata, message):
    print(f"🔔 Message reçu sur {message.topic}: {message.payload.decode()}")

client = mqtt.Client(client_id="MockArduinoClient", protocol=mqtt.MQTTv5)
client.on_connect = on_connect
client.on_message = on_message

try:
    print("Tentative de connexion du Mock Arduino...")
    client.connect(broker_address, port, 60)
    client.loop_start()
    
    print("En attente de messages (Laissez tourner pendant que vous regardez le Dashboard)...")
    time.sleep(30) # Garde le mock en ligne pendant 30s
    
    print("Déconnexion du Mock Arduino...")
    client.publish("smartbell/status", json.dumps({"status": "offline"}), retain=True)
    client.loop_stop()
    client.disconnect()
except Exception as e:
    print(f"Erreur: {e}")
