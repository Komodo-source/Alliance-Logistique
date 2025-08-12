<?php

header('Content-Type: application/json');
include_once('db.php'); 
include_once('lib/get_session_info.php');

// Bout de code basique pour obtenir l'équivalent des id CLIENT/FOURNISSEUR
// |_ = de session_id -> id_client | id_fournisseur

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['session_id'])) {
    echo json_encode(['message' => 'error', 'error' => 'session_id is required']);
    exit;
}
$session_id = $data['session_id'];
$id = getIdSession($session_id);

if (!$id) {
    echo json_encode(['message' => 'error', 'error' => 'Invalid session_id']);
    exit;
}



?>