import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
#https://backend-logistique-api-latest.onrender.com/db.php
url = "http://127.0.0.1:8000/assign.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {
  "nom_dmd": "ohjdjqkj",
  "desc_dmd": "",
  "date_fin": "2025-10-10 20:14:32",
  "id_client": 1,
  "localisation_dmd": "37.4219983;-122.084",
  "produit_contenu": [
    {
      "id_produit": 1,
      "nb_produit": 3
    }
  ],
  "list_fourni": [
    1
  ]
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
