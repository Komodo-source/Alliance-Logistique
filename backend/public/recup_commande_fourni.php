<?php

header('Content-Type: application/json');
include_once('db.php');
include_once('lib/get_session_info.php');

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['session_id'])) {
    echo json_encode(['message' => 'error', 'error' => 'session_id is required']);
    exit;
}
$session_id = $data['session_id'];
$id = getIdSession($session_id);
if (!$id) {
    echo json_encode(['message' => 'error', 'error' => 'Invalid session_id']);
    exit;
}

$data_commande = $conn->prepare(
"SELECT
    HUB.*,
    COMMANDE.id_cmd,
    COMMANDE.id_public_cmd,
    COMMANDE.id_fournisseur,
    COMMANDE.id_coursier,
    COMMANDE.code_echange_fourni,
    COMMANDE.id_status,
    COMMANDE.est_paye,
    PAYEMENT.amount as montant_paye,
    PAYEMENT.date_payement,
    PAYEMENT.momo_number,
    (
        SELECT GROUP_CONCAT(
            JSON_OBJECT(
                'id_produit', P.id_produit,
                'nom_produit', P.nom_produit,
                'quantite', CP.nb_produit,
                'prix', FR.prix_produit,
                'type_vendu', P.type_vendu
            )
        )
        FROM COMMANDE_PRODUIT CP
        INNER JOIN PRODUIT P ON CP.id_produit = P.id_produit
        INNER JOIN FOURNIR FR ON FR.id_fournisseur = COMMANDE.id_fournisseur
        WHERE CP.id_cmd = COMMANDE.id_cmd
    ) AS produits
FROM COMMANDE
INNER JOIN HUB ON HUB.id_dmd = COMMANDE.id_dmd
LEFT JOIN (
    SELECT
        id_cmd,
        MAX(amount) AS amount,
        MAX(date_payement) AS date_payement,
        MAX(momo_number) AS momo_number
    FROM PAYEMENT
    GROUP BY id_cmd
) AS PAYEMENT ON PAYEMENT.id_cmd = COMMANDE.id_cmd
WHERE COMMANDE.id_fournisseur = ?
ORDER BY HUB.date_fin DESC");
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
