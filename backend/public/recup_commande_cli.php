<?php

header('Content-Type: application/json');
include_once('db.php'); 


$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id_client'];


$data_commande = $conn->prepare("SELECT *, HUB.*, CONTENANCE.* FROM COMMANDE, HUB, CONTENANCE WHERE COMMANDE.id_client = ? AND COMMANDE.id_dmd = HUB.id_dmd AND CONTENANCE.id_dmd = HUB.id_dmd");
$data_commande->bind_param("i", $id);
$data_commande->execute();
$result = $data_commande->get_result();
$data = $result->fetch_assoc();
echo json_encode($data);

$conn->close();
?>
