import requests
import json
import time

url = "http://127.0.0.1:8000/api/auth/register/"
ts = int(time.time())
payload = {
    "name": f"Patient User {ts}",
    "username": f"patient_{ts}",
    "email": f"patient_{ts}@example.com",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "role": "patient",
    "phone_number": "1234567890",
    "address": "Test Address"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
