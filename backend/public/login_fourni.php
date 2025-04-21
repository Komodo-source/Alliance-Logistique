<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

$identifiant = $data['identifiant'];
$mdp = $data['mdp'];

$stmt = $conn->prepare("SELECT id_client FROM FOURNISSEUR WHERE identifiant_fournisseur = (?) AND mdp_fournisseur = (?)");
$stmt->bind_param("ss", $identifiant, hash('sha256',$mdp));

if ($stmt->execute()) {
    echo json_encode(['message' => 'Données insérées avec succès']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'insertion']);
}

$stmt->close();
$conn->close();

?>