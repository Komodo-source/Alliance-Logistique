<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

$identifiant = $data['username'];
$mdp = $data['password'];

$stmt = $conn->prepare("SELECT id_client FROM CLIENT WHERE identifiant_client = (?) AND mdp_client = (?)");
$stmt->bind_param("ss", $identifiant, hash('sha256',$mdp));

if ($stmt->execute()) {
    echo json_encode(['message' => 'Données insérées avec succès']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'insertion']);
}

$stmt->close();
$conn->close();

?>