<?php

header('Content-Type: application/json');
include_once('db.php');
//ce script permet de récupérer la clé d'api de l'utilisateur
//cela permet aussi de savoir son type (client ,fournisseur,coursier)

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"];

$get_key = $conn->prepare("SELECT id_key FROM USER_KEY WHERE id_user=?");
$get_key->bind_param("i", $id);
$get_key->execute();

echo json_encode(['message' => 'OK', 'key' => $get_key->fetch_assoc()['id_key']]);
?>