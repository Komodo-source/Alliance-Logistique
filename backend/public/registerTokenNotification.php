<?php
// save_token.php
include_once('db.php');

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"];
$token   = $data["token"];

$stmt = $conn->prepare("INSERT INTO user_tokens (user_id, token) VALUES (?, ?)
                          ON DUPLICATE KEY UPDATE token = VALUES(token)");
$stmt->bind_param("is", $user_id, $token);
$stmt->execute();

echo json_encode(["success" => true]);
