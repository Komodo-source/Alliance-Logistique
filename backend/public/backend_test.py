import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
url = "http://127.0.0.1:8000/recup_commande_cli.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {
  "id_client": 231920,
}

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
