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
            (prix_produit * 1.45) as prix_produit,
            nb_produit_fourni,
            P.nom_produit,
            FR.id_produit
        FROM FOURNISSEUR F
INNER JOIN FOURNIR FR ON F.id_fournisseur = FR.id_fournisseur
INNER JOIN PRODUIT P ON P.id_produit = FR.id_produit
LEFT JOIN ORGANISATION O ON O.id_orga = F.id_orga
WHERE F.id_fournisseur = ?";

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
