import paho.mqtt.client as mqtt
import json
import os

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_USER = os.getenv("MQTT_USER")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")

TOPIC_TRIGGER = "smartbell/trigger"
TOPIC_SYNC = "smartbell/sync"
TOPIC_LOGS = "smartbell/logs"

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TOPIC_LOGS)

def on_message(client, userdata, msg):
    print(f"Received message on {msg.topic}: {msg.payload.decode()}")
    # Here we would normally save the log to the database
    # But for now we just acknowledge receipt

client.on_connect = on_connect
client.on_message = on_message

def start_mqtt():
    try:
        if MQTT_USER and MQTT_PASSWORD:
            client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        print("MQTT Connected")
    except Exception as e:
        print(f"Failed to connect to MQTT: {e}")

def notify_sync():
    try:
        client.publish(TOPIC_SYNC, json.dumps({"action": "SYNC"}))
    except Exception as e:
        print(f"Failed to publish sync: {e}")

def trigger_manual(duration: int):
    try:
        payload = {"action": "ON", "duration": duration}
        client.publish(TOPIC_TRIGGER, json.dumps(payload))
    except Exception as e:
        print(f"Failed to publish trigger: {e}")
