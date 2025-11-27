<?php

header('Content-Type: application/json');
include_once('db.php');

try{

    $stmt = $conn->prepare("
        SELECT
            P.id_produit,
            P.nom_produit,
            COUNT(CP.id_produit) AS total_commandes
        FROM COMMANDE_PRODUIT CP
        INNER JOIN PRODUIT P
            ON CP.id_produit = P.id_produit
        GROUP BY P.nom_produit
        ORDER BY total_commandes DESC
        LIMIT 5;
        ");
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();
    echo json_encode($data);
}catch(Exception $e){
    echo json_encode(['err' => $e->getMessage()]);
}
?>

