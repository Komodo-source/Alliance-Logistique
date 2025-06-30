<?php

header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id_client'];

$data_commande = $conn->prepare(
"SELECT 
    HUB.*,
    COMMANDE.id_cmd,
    COMMANDE.id_public_cmd,
    COMMANDE.id_fournisseur,
    COMMANDE.id_coursier,
    COMMANDE.code_echange,
    GROUP_CONCAT(
        JSON_OBJECT(
            'id_produit', PRODUIT.id_produit,
            'nom_produit', PRODUIT.nom_produit,
            'quantite', CONTENANCE.nb_produit,
            'prix', PRIX.prix_produit,
            'type_vendu', PRODUIT.type_vendu
        )
    ) as produits
FROM COMMANDE 
INNER JOIN HUB ON HUB.id_dmd = COMMANDE.id_dmd        
INNER JOIN CONTENANCE ON CONTENANCE.id_dmd = HUB.id_dmd
INNER JOIN PRODUIT ON PRODUIT.id_produit = CONTENANCE.id_produit
INNER JOIN PRIX ON PRIX.id_prix = PRODUIT.id_prix
WHERE COMMANDE.id_client = ?
GROUP BY HUB.id_dmd, COMMANDE.id_cmd");
//lorsque cela sera implémenté il faudra rajouté 
// le status de la commande
//et le prix total des produits


$data_commande->bind_param("i", $id);
$data_commande->execute();
$result = $data_commande->get_result();

$tt_commande_client = array();
if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        // Parse the produits JSON string into an array
        $row['produits'] = json_decode('[' . $row['produits'] . ']', true);
        $tt_commande_client[] = $row;
    }
}

echo json_encode($tt_commande_client);

$conn->close();
?>