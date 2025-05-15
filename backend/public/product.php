<?php
header('Content-Type: application/json');
include_once('db.php'); 

$sql = "SELECT id_produit, nom_produit,nom_categorie, PR.prix_produit
FROM PRODUIT P INNER JOIN CATEGORIE C ON P.id_categorie = C.id_categorie
INNER JOIN PRIX PR ON PR.id_prix = P.id_prix ";
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