<?php
header('Content-Type: application/json');
include_once('db.php');

$input = json_decode(file_get_contents("php://input"), true);

$id_cmd = $data["id_cmd"];
$nv_status = $data["status"]; //le status est l'id correspondant
//(1, 'Livraison en cours'),
//(2, 'Livré'),
//(3, 'En cours de préparation');
try{
$sql = "UPDATE COMMANDE SET id_status = ? WHERE id_cmd = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $session_id, $nv_status);
$stmt->execute();
echo json_encode(["ok" => "succes"]);
}catch(Exception $e){
   echo json_encode([
      "message" => $e->getMessage()
   ]);
}
?>
