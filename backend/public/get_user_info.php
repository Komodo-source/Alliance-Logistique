<?php

// Tout est dans le titre
// Ce script permet de récupérer les informations de l'utilisateur (client, fournisseur, coursier) en fonction du type et de la session_id.
// Il renvoie les informations de l'utilisateur sous forme de JSON.
header('Content-Type: application/json');
include_once('db.php');
include_once('lib/get_session_info.php');

$data = json_decode(file_get_contents("php://input"), true);
$type = $data['type'];
$session_id = $data['session_id'];
$id = getIdSession($session_id);

$data_client = $conn->prepare("
SELECT C.id_client, nom_client, prenom_client, note_client, nom_orga, ville_organisation,
COUNT(CMD.id_client) as nb_commande
FROM CLIENT C
LEFT JOIN ORGANISATION O ON C.id_orga = O.id_orga
INNER JOIN COMMANDE CMD ON C.id_client = CMD.id_client
WHERE C.id_client = ?");

$data_fournisseur = $conn->prepare(
    "SELECT F.id_fournisseur, nom_fournisseur, prenom_fournisseur, nom_orga, ville_organisation, note_fourni
        COUNT(CMD.id_fournisseur) as nb_commande,nb_produit_fourni, prix_produit, nom_produit
        FROM FOURNISSEUR F
        LEFT JOIN COMMANDE CMD ON F.id_fournisseur = CMD.id_fournisseur
        INNER JOIN FOURNIR FR ON F.id_fournisseur = FR.id_fournisseur
        INNER JOIN PRODUIT P ON P.id_produit = FR.id_produit
        LEFT JOIN ORGANISATION O ON F.id_orga = O.id_orga
        WHERE F.id_fournisseur = ?;");
        
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