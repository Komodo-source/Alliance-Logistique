import requests
import json

# URL de ton backend (change-la par l'URL de ton API)
#https://backend-logistique-api-latest.onrender.com/db.php
url = "http://127.0.0.1:8000/add_fournisseur_product.php"

# Données à envoyer (modifie selon tes besoins)
payload =  {"id_fournisseur":999325,"list_produit":["2","6"],"qte_produit":[100,25],"prix_produit":[100,100]}

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
