<?php

headerr('Content-Type: application/json');
include_once('db.php');
//génère une clé d'api si l'uitilisateur n'a pas de clé
//est applé juste après la registration (après le message de confirmation), 

$data = json_decode(file_get_contents("php://input"), true);
$id_user = $data["id"];

$new_key = hash('sha256', uniqid());
$insert_key = $conn->prepare("INSERT INTO USER_KEY (id_key, id_user) VALUES (?, ?)");
$insert_key->bind_param("si", $new_key, $id_user);
$insert_key->execute();
$result = $insert_key->get_result();
echo json_encode(['message' => 'OK', 'key' => $new_key]);
?>