<?php
header('Content-Type: application/json');
// Add in FOURNIR (in db) the products provided by the supplier

try{

    include_once('db.php');
    include_once('lib/get_session_info.php');


    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['session_id'])) {
        echo json_encode(['error' => 'session_id is required']);
        exit;
    }
    $session_id = $data['session_id'];
    $id = getIdSession($session_id);
    $passwd = $data["passwd"];
    $type = $data["type_user"];

   if($type == "client"){
      $sql = "UPDATE CLIENT SET mdp_client = ? WHERE id_client = ?";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("ii", hash('sha256', $passwd), $id);
   }else if($type == "fournisseur"){
            $sql = "UPDATE FOURNISSEUR SET mdp_fournisseur = ? WHERE id_fournisseur = ?";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("ii", hash('sha256', $passwd), $id);
   }
   echo json_encode(['success' => 'success changing password']);

}catch (Exception $e) {
    error_log("PHP Error: " . $e->getMessage());
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>
