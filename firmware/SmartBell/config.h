#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
static const char *ssid = "VOTRE_SSID";
static const char *password = "VOTRE_PASSWORD";

// MQTT Configuration
static const char *mqtt_server = "192.168.0.140"; // IP du Broker
static const int mqtt_port = 1883;
static const char *mqtt_user = "";
static const char *mqtt_pass = "";
static const char *topic_trigger = "smartbell/trigger";
static const char *topic_sync = "smartbell/sync";
static const char *topic_logs = "smartbell/logs";

// API REST Backend
static const char *api_url = "http://192.168.0.140:8000/api/schedule";

// Hardware PINs
#define RELAY_PIN 22  // GPIO pour piloter le relais
#define BUTTON_PIN 23 // GPIO pour le bouton poussoir
#define SDA_PIN 19    // I2C SDA pour le RTC
#define SCL_PIN 18    // I2C SCL pour le RTC

// Time settings
static const char *ntp_server = "pool.ntp.org";
static const long gmt_offset_sec = 3600;     // GMT+1
static const int daylight_offset_sec = 3600; // DST logic

#endif
