import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
#https://backend-logistique-api-latest.onrender.com/db.php
url = "https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {'id_client': '774f2d2b1124697dc3fcded0850d76be4a78a89fb996ca672ae1cb111651fffc'}

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
