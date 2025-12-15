#!/usr/bin/env python3
"""
Virtual Smart Light - MQTT Subscriber/Publisher
Simulates a smart light that responds to commands
"""

import json
import time
import paho.mqtt.client as mqtt

# MQTT Configuration
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_USERNAME = "mqttuser"
MQTT_PASSWORD = "mqttpass"

# Topics
LIGHT_STATE_TOPIC = "smarthome/light/living_room/state"
LIGHT_COMMAND_TOPIC = "smarthome/light/living_room/command"
LIGHT_AVAILABILITY_TOPIC = "smarthome/light/living_room/availability"

# Light state
light_state = "OFF"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✓ Connected to MQTT broker")
        # Subscribe to command topic
        client.subscribe(LIGHT_COMMAND_TOPIC)
        print(f"✓ Subscribed to {LIGHT_COMMAND_TOPIC}")
        
        # Publish availability and initial state
        client.publish(LIGHT_AVAILABILITY_TOPIC, "online", retain=True)
        publish_state(client)
    else:
        print(f"✗ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    global light_state
    
    command = msg.payload.decode().upper()
    print(f"\n← Received command: {command}")
    
    if command in ["ON", "OFF"]:
        light_state = command
        publish_state(client)
        print(f"✓ Light turned {light_state}")
    else:
        print(f"✗ Unknown command: {command}")

def publish_state(client):
    payload = json.dumps({
        "state": light_state
    })
    client.publish(LIGHT_STATE_TOPIC, payload, qos=1, retain=True)
    print(f"→ Published state: {light_state}")

def on_disconnect(client, userdata, rc):
    print("✗ Disconnected from MQTT broker")

def main():
    # Create MQTT client
    client = mqtt.Client(client_id="light_living_room")
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    
    # Set last will
    client.will_set(LIGHT_AVAILABILITY_TOPIC, "offline", retain=True)
    
    try:
        # Connect to broker
        print(f"Connecting to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        print("\nLight is ready. Waiting for commands... (Press Ctrl+C to stop)")
        print(f"Current state: {light_state}\n")
        
        # Keep running
        client.loop_forever()
        
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        client.publish(LIGHT_AVAILABILITY_TOPIC, "offline", retain=True)
        client.disconnect()
        print("✓ Light stopped")
    except Exception as e:
        print(f"✗ Error: {e}")
        client.disconnect()

if __name__ == "__main__":
    print("=" * 50)
    print("Virtual Smart Light")
    print("=" * 50)
    main()
