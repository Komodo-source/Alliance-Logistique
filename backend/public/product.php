<?php
header('Content-Type: application/json');
include_once('db.php'); 

$sql = "SELECT P.id_produit, nom_produit,nom_categorie, ROUND(AVG(FR.prix_produit), 2) as prix_produit, COUNT(id_fournisseur) as nb_fournisseur
FROM PRODUIT P 
INNER JOIN CATEGORIE C ON P.id_categorie = C.id_categorie
LEFT JOIN FOURNIR FR ON FR.id_produit = P.id_produit
GROUP BY P.id_produit, nom_produit,nom_categorie; ";
//on est obligé de recup les id prod pour les insérer dans CONTENANCE
$result = $conn->query($sql);

$data = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
$conn->close();
?>