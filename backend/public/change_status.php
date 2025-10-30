<?php
header('Content-Type: application/json');
include_once('db.php');

$input = json_decode(file_get_contents("php://input"), true);
$id_cmd = $input["id_cmd"];
$nv_status = $input["status"];  // Changé de $data à $input

try{
    $sql = "UPDATE COMMANDE SET id_status = ? WHERE id_cmd = ?";
    $stmt = $conn->prepare($sql);

    // ERREUR 2: Vous utilisez $session_id au lieu de $nv_status
    // ERREUR 3: L'ordre des paramètres est inversé (status d'abord, puis id_cmd)
    $stmt->bind_param("ii", $nv_status, $id_cmd);  // Corrigé

    $stmt->execute();

    // ERREUR 4 (optionnelle): Vérifier si la mise à jour a réussi
    if($stmt->affected_rows > 0) {
        echo json_encode(["ok" => "success", "updated" => true]);
    } else {
        echo json_encode(["ok" => "success", "updated" => false, "message" => "No rows affected"]);
    }

    $stmt->close();
} catch(Exception $e){
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
