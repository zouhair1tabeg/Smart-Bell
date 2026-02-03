#include "config.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <RTClib.h>
#include <WiFi.h>
#include <Wire.h>

// Objets globaux
RTC_DS3231 rtc;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Structure pour le planning (Diagramme de Classe)
struct Planning {
  int id;
  String heure;       // Format "HH:MM:SS"
  String joursActifs; // Liste des jours (ex: "1,2,3" pour Lun, Mar, Mer)
  int duree;
};

Planning localSchedule[20];
int scheduleCount = 0;

// Mapping des jours (0=Dimanche, 1=Lundi, ..., 6=Samedi)
const char *daysMap[] = {"Dimanche", "Lundi",    "Mardi", "Mercredi",
                         "Jeudi",    "Vendredi", "Samedi"};

// --- Méthodes du Diagramme de Classe ---

void synchroniserRTC() {
  configTime(gmt_offset_sec, daylight_offset_sec, ntp_server);
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    rtc.adjust(DateTime(timeinfo.tm_year + 1900, timeinfo.tm_mon + 1,
                        timeinfo.tm_mday, timeinfo.tm_hour, timeinfo.tm_min,
                        timeinfo.tm_sec));
    Serial.println("RTC synchronisé via NTP");
  }
}

void fetchScheduleREST() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(api_url);
    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();

#if ARDUINOJSON_VERSION_MAJOR >= 7
      JsonDocument doc;
#else
      DynamicJsonDocument doc(4096);
#endif

      DeserializationError error = deserializeJson(doc, payload);
      if (error) {
        Serial.print("Erreur JSON: ");
        Serial.println(error.c_str());
        return;
      }

      JsonArray arr = doc.as<JsonArray>();
      scheduleCount = 0;
      for (JsonObject obj : arr) {
        if (scheduleCount < 20) {
          localSchedule[scheduleCount].id = obj["id"] | 0;
          localSchedule[scheduleCount].heure = obj["heure"] | "00:00:00";

          JsonArray jours = obj["joursActifs"];
          String joursStr = "";
          for (JsonVariant j : jours) {
            if (joursStr.length() > 0)
              joursStr += ",";
            joursStr += j.as<String>();
          }
          localSchedule[scheduleCount].joursActifs = joursStr;
          localSchedule[scheduleCount].duree = obj["duree"] | 5;
          scheduleCount++;
        }
      }
      Serial.println("Planning synchronisé via REST");
    }
    http.end();
  }
}

void actionnerRelais(int duree) {
  Serial.print("Déclenchement sonnerie pour ");
  Serial.print(duree);
  Serial.println("s");

  digitalWrite(RELAY_PIN, HIGH);
  delay(duree * 1000);
  digitalWrite(RELAY_PIN, LOW);

  String logMsg =
      "{\"action\":\"SONNERIE\", \"source\":\"ESP32\", \"status\":\"SUCCESS\"}";
  mqttClient.publish(topic_logs, logMsg.c_str());
}

void callback(char *topic, byte *payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++)
    message += (char)payload[i];

  Serial.print("Message MQTT: ");
  Serial.println(topic);

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument doc;
#else
  StaticJsonDocument<256> doc;
#endif
  deserializeJson(doc, message);

  if (String(topic) == topic_trigger) {
    int duration = doc["duration"] | 5;
    actionnerRelais(duration);
  } else if (String(topic) == topic_sync) {
    fetchScheduleREST();
  }
}

void verifierHoraire() {
  DateTime now = rtc.now();
  char currentTime[9];
  sprintf(currentTime, "%02d:%02d:%02d", now.hour(), now.minute(),
          now.second());
  int currentDay = now.dayOfTheWeek();
  String currentDayName = daysMap[currentDay];

  for (int i = 0; i < scheduleCount; i++) {
    if (String(currentTime) == localSchedule[i].heure) {
      if (localSchedule[i].joursActifs.indexOf(currentDayName) != -1 ||
          localSchedule[i].joursActifs.indexOf(String(currentDay)) != -1) {
        actionnerRelais(localSchedule[i].duree);
      }
    }
  }
}

void detecterAppuiBouton() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(50);
    if (digitalRead(BUTTON_PIN) == LOW) {
      actionnerRelais(5);
      while (digitalRead(BUTTON_PIN) == LOW)
        ;
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  Wire.begin(SDA_PIN, SCL_PIN);
  if (!rtc.begin()) {
    Serial.println("Erreur RTC !");
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connecté");

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);

  synchroniserRTC();
  fetchScheduleREST();
}

void loop() {
  if (!mqttClient.connected()) {
    if (mqttClient.connect("SmartBellClient", mqtt_user, mqtt_pass)) {
      mqttClient.subscribe(topic_trigger);
      mqttClient.subscribe(topic_sync);
    }
  }
  mqttClient.loop();

  detecterAppuiBouton();
  verifierHoraire();

  delay(1000);
}
