import requests
import json

url = "http://127.0.0.1:8000/api/chatbot/message/"
headers = {"Content-Type": "application/json"}
data = {"message": "Hello, how are you?"}

def main():
    try:
        response = requests.post(url, json=data, headers=headers)
        print("Status:", response.status_code)
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Error:", str(e))


if __name__ == "__main__":
    main()
