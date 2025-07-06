import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
url = "http://127.0.0.1:8000/create_command.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {
  "nom_dmd": "Test",
  "desc_dmd": "Desc",
  "date_fin": "2025-07-05 21:48:51",
  "id_client": 231920,
  "localisation_dmd": "37.4219983;-122.084",
  "produit_contenu": [
    {
      "id_produit": 1,
      "nb_produit": 5
    },
    {
      "id_produit": 4,
      "nb_produit": 3
    }
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
