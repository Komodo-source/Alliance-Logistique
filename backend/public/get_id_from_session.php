<?php

header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

$id_session = $data["id"];

$session_id = $conn->prepare("SELECT id_user FROM SESSION_KEY WHERE id_key = ?");
$session_id->bind_param("s", $id_session);
$session_id->execute();
$result = $session_id->get_result();
$id_user = $result->fetch_assoc();
$session_id->close();

echo json_encode([
    'message' => 'success', 
    'user_data' => $id_user]);

    $conn->close();
?>

