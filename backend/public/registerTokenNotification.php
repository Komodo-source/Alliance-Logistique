<?php
// save_token.php
include_once('db.php');
include_once('lib/get_session_info.php');

$data = json_decode(file_get_contents("php://input"), true);

try {
   if (!isset($data['session_id'])) {
      echo json_encode(['error' => 'session_id is required']);
      exit;
   }
   $session_id = $data['session_id'];
   $user_id = getIdSession($session_id);

   $type = $data["type"];
   $token   = $data["token"];

   $stmt = $conn->prepare("INSERT INTO user_tokens (user_id, token, type) VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE token = VALUES(token)");
   $stmt->bind_param("iss", $user_id, $token, $type);
   $stmt->execute();

echo json_encode(["success" => true]);
} catch (error){
   console.log(error);
}
?>
