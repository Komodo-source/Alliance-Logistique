<?php

header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id_client'];

$data_commande = $conn->prepare(
"SELECT *, HUB.*, C.*, PRODUIT.nom_produit FROM COMMANDE 
        INNER JOIN HUB ON HUB.id_dmd = COMMANDE.id_dmd        
        INNER JOIN CONTENANCE C ON C.id_dmd = HUB.id_dmd
        INNER JOIN PRODUIT ON PRODUIT.id_produit = CONTENANCE.id_produit
        WHERE COMMANDE.id_client = ? AND COMMANDE.id_dmd = HUB.id_dmd 
        AND CONTENANCE.id_dmd = HUB.id_dmd");
$data_commande->bind_param("i", $id);
$data_commande->execute();
$result = $data_commande->get_result();

$tt_commande_client = array();
if($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            $tt_commande_client[] = $row;
        }
}

echo json_encode($tt_commande_client);

$conn->close();
?>