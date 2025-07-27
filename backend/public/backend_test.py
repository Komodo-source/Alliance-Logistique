import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
#https://backend-logistique-api-latest.onrender.com/db.php
url = "https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {'session_id': '715e2b51c22e09faf0f3e299f8d1ed9ec7ba75255f38e231208cfc3234985c44'}

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
