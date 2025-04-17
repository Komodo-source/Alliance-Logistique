<?php
include('db.php');

// Supposons que $decodedData provient d'une requête JSON
//$decodedData = json_decode(file_get_contents('php://input'), true);

$id = uniqid();
$nom = $decodedData['nom'];
$desc = $decodedData['description'];
$localisation = $decodedData['localisation'];
$date_fin = $decodedData['date_fin'];
$id_client = 1;
$est_commandé = FALSE; // Je suppose que c'est une nouvelle demande donc non commandée

$SQL = "INSERT INTO HUB(id_dmd, nom_dmd, desc_dmd, localisation_dmd, date_fin, est_commandé, id_client) 
VALUES(?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($SQL);
$stmt->bind_param("sssssii", $id, $nom, $desc, $localisation, $date_fin, $est_commandé, $id_client);

if ($stmt->execute()) {
    $response = array("Message" => "OK");
} else {
    $response = array("Message" => "Erreur lors de l'insertion: " . $conn->error);
}

echo json_encode($response);

// Fermer la connexion
$stmt->close();
$conn->close();
?>