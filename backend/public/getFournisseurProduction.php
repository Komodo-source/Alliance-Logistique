<?php
header('Content-Type: application/json');
include_once('db.php');

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id_produit'])) {
    echo json_encode(["error" => "Missing id_produit"]);
    exit;
}

$id_produit = $input['id_produit'];

$sql = "SELECT 
            F.id_fournisseur, 
            (prix_produit * 1.45), 
            nb_produit_fourni, 
            nom_orga, 
            ville_organisation, 
            localisation_orga
        FROM FOURNISSEUR F 
        INNER JOIN FOURNIR FR ON F.id_fournisseur = FR.id_fournisseur
        LEFT JOIN ORGANISATION O ON O.id_orga = F.id_orga
        WHERE FR.id_produit = ?
        ORDER BY prix_produit ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id_produit);
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
