<?php
header('Content-Type: application/json');
include_once('db.php');

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id_fournisseur'])) {
    echo json_encode(["error" => "Missing id_fournisseur"]);
    exit;
}

$id_fournisseur = $input['id_fournisseur'];

//--P.image_produit,
$sql = "SELECT
    P.id_produit,
    P.nom_produit,
    FR.nb_produit_fourni,
    nom_orga,
    ville_organisation,
    ROUND(FR.prix_produit * 1.45, 2) AS prix_produit
FROM FOURNIR FR
INNER JOIN PRODUIT P ON FR.id_produit = P.id_produit
INNER JOIN ORGANISATION O ON FR.id_fournisseur = O.id_fournisseur
WHERE FR.id_fournisseur = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id_fournisseur);
$stmt->execute();

$result = $stmt->get_result();
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$stmt->close();
$conn->close();
?>
