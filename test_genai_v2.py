import os
from pathlib import Path
from dotenv import load_dotenv
import google.genai as genai

# Load .env from lifeaid_backend directory
env_path = Path('lifeaid_backend/.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('GOOGLE_API_KEY')

def main():
    print(f"API Key found: {bool(api_key)}")
    if api_key:
        print(f"API Key starts with: {api_key[:5]}...")

    try:
        client = genai.Client(api_key=api_key)
        print("Client initialized successfully")

        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents="Hello",
        )
        print("Response generated successfully")
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
