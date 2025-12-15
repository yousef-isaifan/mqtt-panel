#!/usr/bin/env python3
"""
Virtual Temperature Sensor - MQTT Publisher
Simulates a temperature sensor publishing data to MQTT broker
"""

import json
import time
import random
import paho.mqtt.client as mqtt

# MQTT Configuration
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_USERNAME = "mqttuser"
MQTT_PASSWORD = "mqttpass"

# Topics
TEMP_STATE_TOPIC = "smarthome/sensor/temperature/living_room/state"
TEMP_AVAILABILITY_TOPIC = "smarthome/sensor/temperature/living_room/availability"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✓ Connected to MQTT broker")
        # Publish availability
        client.publish(TEMP_AVAILABILITY_TOPIC, "online", retain=True)
    else:
        print(f"✗ Connection failed with code {rc}")

def on_disconnect(client, userdata, rc):
    print("✗ Disconnected from MQTT broker")

def main():
    # Create MQTT client
    client = mqtt.Client(client_id="temp_sensor_living_room")
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    
    # Set last will (published when client disconnects unexpectedly)
    client.will_set(TEMP_AVAILABILITY_TOPIC, "offline", retain=True)
    
    try:
        # Connect to broker
        print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        
        # Simulate temperature readings
        base_temp = 22.0
        print("\nPublishing temperature readings... (Press Ctrl+C to stop)")
        
        while True:
            # Generate realistic temperature with slight variations
            variation = random.uniform(-0.5, 0.5)
            temperature = round(base_temp + variation, 2)
            
            # Publish as JSON
            payload = json.dumps({
                "temperature": temperature,
                "unit": "celsius"
            })
            
            result = client.publish(TEMP_STATE_TOPIC, payload, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✓ Published: {temperature}°C")
            else:
                print(f"✗ Failed to publish temperature")
            
            time.sleep(5)  # Publish every 5 seconds
            
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        client.publish(TEMP_AVAILABILITY_TOPIC, "offline", retain=True)
        client.loop_stop()
        client.disconnect()
        print("✓ Sensor stopped")
    except Exception as e:
        print(f"✗ Error: {e}")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    print("=" * 50)
    print("Virtual Temperature Sensor")
    print("=" * 50)
    main()
