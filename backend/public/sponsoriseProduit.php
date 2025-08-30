<?php

header('Content-Type: application/json');
include_once('db.php');

try{
    
    $stmt = $conn->prepare("
        SELECT nom_orga, prenom_fournisseur, nom_produit
        FROM FOURNIR FR
        INNER JOIN FOURNISSEUR F ON FR.id_fournisseur = F.id_fournisseur
        LEFT JOIN ORGANISATION O ON F.id_orga = O.id_orga
        INNER JOIN PRODUIT P ON FR.id_produit = P.id_produit
        WHERE est_sponso = 1
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

