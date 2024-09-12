import requests

def hello():
    print("Hello, World!")
    response = requests.get("https://api.example.com")
    print(f"Status Code: {response.status_code}")