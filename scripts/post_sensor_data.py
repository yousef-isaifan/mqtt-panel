#!/usr/bin/env python3
"""
Sensor Data HTTP Poster
Posts temperature data directly to the Next.js API (alternative to MQTT)
"""

import requests
import time
import random
import sys

API_URL = "http://localhost:3000/api/sensor/data"
DEVICE_ID = "temp_living_room"

def post_temperature(temp, unit="celsius"):
    payload = {
        "device_id": DEVICE_ID,
        "temperature": temp,
        "unit": unit
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=5)
        
        if response.status_code == 200:
            print(f"✓ Posted: {temp}°{unit[0].upper()} - Status: {response.status_code}")
            return True
        else:
            print(f"✗ Failed: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("=" * 50)
    print("Sensor Data HTTP Poster")
    print("=" * 50)
    print(f"Posting to: {API_URL}")
    print("Press Ctrl+C to stop\n")
    
    base_temp = 22.0
    
    try:
        while True:
            # Generate realistic temperature
            variation = random.uniform(-1.0, 2.0)
            temperature = round(base_temp + variation, 2)
            
            post_temperature(temperature)
            
            time.sleep(5)  # Post every 5 seconds
            
    except KeyboardInterrupt:
        print("\n\n✓ Stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
