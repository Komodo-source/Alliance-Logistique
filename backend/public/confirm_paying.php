<?php

header('Content-Type: application/json');
include_once('db.php');
include_once("lib/api.php");
$data = json_decode(file_get_contents("php://input"), true);
$idcmd = $data['idcmd'];
$number = $data['number'];
$externalId = $data['externalId'];
$amount = $data['amount'];

try{
    // Générer un ID unique pour le paiement
    $id_payement = rand(10000, 99999);
    
    $stmt = $conn->prepare("INSERT INTO PAYEMENT (id_payement, externalId, id_cmd, amount, momo_number) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssds", $id_payement, $externalId, $idcmd, $amount, $number);
    $stmt->execute();
    
    // Mettre à jour le statut de paiement de la commande
    $update_stmt = $conn->prepare("UPDATE COMMANDE SET est_paye = TRUE WHERE id_cmd = ?");
    $update_stmt->bind_param("s", $idcmd);
    $update_stmt->execute();
    
    $stmt->close();
    $update_stmt->close();
    
    echo json_encode(['ok' => "the payment was registered"]);
}catch(Exception $e){
    echo json_encode(['err' => $e->getMessage()]);
}
?>