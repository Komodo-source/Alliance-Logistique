<?php
header('Content-Type: application/json');
include_once('db.php');
//include_once("lib/api.php");
include_once('lib/get_session_info.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['session_id'])) {
    echo json_encode(['error' => 'session_id is required']);
    exit;
}
$session_id = $data['session_id'];
$id_cmd = $data['id_cmd'];
$id_coursier = getIdSession($session_id);
//$id_coursier = $data['id_coursier'];

$sql = "SELECT
    P.id_produit,
    PROD.nom_produit,
    C.id_public_cmd,
    C.id_fournisseur,
    F.prenom_fournisseur,
    C.code_echange,
    P.nb_produit,
    C.id_client,
    CL.nom_client,
    C.code_echange_fourni,
    H.nom_dmd,
    H.date_debut,
    H.localisation_dmd,
    O2.localisation_orga AS localisation_fourni,
    O1.nom_orga AS orga_client,
    O2.nom_orga AS orga_fourni
FROM COMMANDE C
INNER JOIN COMMANDE_PRODUIT P ON C.id_cmd = P.id_cmd
INNER JOIN HUB H ON H.id_dmd = C.id_dmd
INNER JOIN PRODUIT PROD ON P.id_produit = PROD.id_produit
INNER JOIN CLIENT CL ON CL.id_client = C.id_client
LEFT JOIN ORGANISATION O1 ON O1.id_orga = CL.id_orga
INNER JOIN FOURNISSEUR F ON F.id_fournisseur = C.id_fournisseur
INNER JOIN ORGANISATION O2 ON O2.id_orga = F.id_orga
WHERE C.id_coursier = ? AND C.id_cmd = ?;";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_coursier, $id_cmd);
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
