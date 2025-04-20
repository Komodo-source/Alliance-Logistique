<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$nom_dmd = $data['nom_dmd'];
$desc_dmd = $data['desc_dmd'];
$localisation_dmd = $data['localisation_dmd'];
$date_fin = $data['date_fin'];
$id_client = $data['id_client'];
$all_inserted = true;

$produit_contenu = $data['produit_contenu']; //json pour les produits

// Requête préparée pour éviter les injections SQL
$stmt = $conn->prepare("INSERT INTO HUB(id_dmd, nom_dmd, desc_dmd, localisation_dmd, date_fin, id_client) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $id, $nom_dmd, $desc_dmd, $localisation_dmd, $date_fin, $id_client);


for(int i=0;i<$produit_contenu.size();i++){
    $stmt2 = $conn->prepare("INSERT INTO CONTENANCE(id_produit, id_dmd, nb_produit, poids_piece_produit)");
    $stmt2->bind_param("ssss", $produit_contenu[i]['id_produit'], $produit_contenu[i]['id_dmd'], $produit_contenu[i]['nb_produit'], $produit_contenu[i]['poids_piece_produit']);
    if(!$stmt2->execute()){
        $all_inserted = false;
    }
}

if ($stmt->execute() && $all_inserted) {
    echo json_encode(['message' => 'Données insérées avec succès']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'insertion']);
}

$stmt->close();
$conn->close();

?>