import os
from pathlib import Path
from dotenv import load_dotenv
import google.genai as genai

# Load .env from lifeaid_backend directory
env_path = Path('lifeaid_backend/.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('GOOGLE_API_KEY')

try:
    client = genai.Client(api_key=api_key)
    print("Available models:")
    for model in client.models.list():
        print(f"Name: {model.name}, Supported Actions: {model.supported_actions}")
except Exception as e:
    print(f"Error: {e}")
