import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
#https://backend-logistique-api-latest.onrender.com/db.php
url = "http://127.0.0.1:8000/get_user_info.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {"type": "client","session_id" : "2b2c3c745bf3f29c4275c317561261323d523d5e690c448b875bd507a9781d96" }

# En-têtes HTTP
headers = {
    "Content-Type": "application/json",
}

# Envoi de la requête POST avec les données JSON
response = requests.post(url, headers=headers, json=payload)

# Affichage de la réponse du serveur
print(f"Status Code: {response.status_code}")
print("Réponse JSON:")
print(" ")
try:
    print(response.json())
except json.JSONDecodeError:
    print(response.text)
