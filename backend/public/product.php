<?php
header('Content-Type: application/json');
include_once('db.php'); 

$sql = "SELECT id_produit, nom_produit,nom_categorie FROM PRODUIT P INNER JOIN CATEGORIE C ON P.id_categorie = C.id_categorie";
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