<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nom_dmd'], $data['localisation_dmd'], $data['date_fin'], $data['produit_contenu'])) {
    echo json_encode(['error' => 'Champs manquants']);
    exit;
}

$id = uniqid(); 
$nom_dmd = $data['nom_dmd'];
$desc_dmd = $data['desc_dmd'] ?? "";
$localisation_dmd = $data['localisation_dmd'];
//$loca = $localisation_dmd["latitude"] . ";" . $localisation_dmd["longitude"];
$date_fin = $data['date_fin'];
$id_client = $data['id_client'] ?? 1; 
$all_inserted = true;

// Insertion dans HUB
$stmt = $conn->prepare("INSERT INTO HUB(id_dmd, nom_dmd, desc_dmd, localisation_dmd, date_fin, id_client) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $id, $nom_dmd, $desc_dmd, $localisation_dmd, $date_fin, $id_client);

if (!$stmt->execute()) {
    echo json_encode(['error' => "Erreur HUB: " . $conn->error]);
    exit;
}

if (!$id) {
    $id = $conn->insert_id;
}

// Insertion des produits
foreach ($data['produit_contenu'] as $produit) {
    $stmt2 = $conn->prepare("INSERT INTO CONTENANCE(id_produit, id_dmd, nb_produit) VALUES (?, ?, ?)");
    $stmt2->bind_param("sss", $produit['id_produit'], $id, $produit['nb_produit']);
    if (!$stmt2->execute()) {
        $all_inserted = false;
        echo json_encode(['error' => "Erreur CONTENANCE: " . $conn->error]);
        break;
    }
}

if ($all_inserted) {
    echo json_encode(['message' => 'Données insérées avec succès']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'insertion des produits']);
}

$stmt->close();
$conn->close();
?>