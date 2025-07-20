<?php
header('Content-Type: application/json');
include_once('db.php');
include_once('lib/get_session_info.php');

$data = json_decode(file_get_contents("php://input"), true);
$type = $data['type'];
$session_id = $data['session_id'];
$id = getIdSession($session_id);

$data_client = $conn->prepare("SELECT id_client, nom_client, prenom_client, telephone_client FROM CLIENT WHERE id_client = ?");
$data_fournisseur = $conn->prepare("SELECT id_fournisseur, nom_fournisseur, prenom_fournisseur, telephone_fournisseur FROM FOURNISSEUR WHERE id_fournisseur = ?");
$data_coursier = $conn->prepare("SELECT id_coursier, nom_coursier, prenom_coursier, telephone_coursier FROM COURSIER WHERE id_coursier = ?");
try{
    if($type == "client"){
        $data_client->bind_param("i", $id);
        $data_client->execute();
        $result = $data_client->get_result();
        $data = $result->fetch_assoc();
        echo json_encode($data);
    }else if($type == "fournisseur"){
        $data_fournisseur->bind_param("i", $id);    
        $data_fournisseur->execute();
        $result = $data_fournisseur->get_result();
        $data = $result->fetch_assoc();
        echo json_encode($data);
    }else if($type == "coursier"){
        $data_coursier->bind_param("i", $id);
        $data_coursier->execute();
        $result = $data_coursier->get_result();
        $data = $result->fetch_assoc();
        echo json_encode($data);
    }
} catch (Exception $e) {
    echo json_encode(['err' => $e->getMessage()]);
}

$conn->close();
 ?> 