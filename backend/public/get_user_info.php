<?php

header('Content-Type: application/json');
include_once('db.php');

$data = json_decode(file_get_contents("php://input"), true);
$type = $data['type'];

// Correction : toujours définir $id correctement
if($data['is_session']){
    $session_id = $data['session_id'];
    //$id = getIdSession($session_id); // Récupérer l'ID réel à partir de la session
} else {
    $id = $data['session_id']; // Utiliser directement l'ID fourni
}

// Requête client simplifiée
$data_client = $conn->prepare("
SELECT C.id_client, nom_client, prenom_client, note_client, nom_orga, ville_organisation,
COUNT(CMD.id_cmd) as nb_commande
FROM CLIENT C
LEFT JOIN ORGANISATION O ON C.id_orga = O.id_orga
LEFT JOIN COMMANDE CMD ON C.id_client = CMD.id_client
WHERE C.id_client = ?
GROUP BY C.id_client, nom_client, prenom_client, note_client, nom_orga, ville_organisation;");

// Requête fournisseur simplifiée - séparer les données de base des statistiques
$data_fournisseur_base = $conn->prepare(
    "SELECT F.id_fournisseur, nom_fournisseur, prenom_fournisseur, nom_orga, ville_organisation, note_fourni
     FROM FOURNISSEUR F
     LEFT JOIN ORGANISATION O ON F.id_orga = O.id_orga
     WHERE F.id_fournisseur = ?");

// Requête statistiques fournisseur corrigée avec GROUP BY
$data_fournisseur_stats = $conn->prepare(
    "SELECT COUNT(DISTINCT CMD.id_cmd) as nb_commande,
            COUNT(FR.id_produit) as nb_produits_fournis
     FROM FOURNISSEUR F
     LEFT JOIN COMMANDE CMD ON F.id_fournisseur = CMD.id_fournisseur
     LEFT JOIN FOURNIR FR ON F.id_fournisseur = FR.id_fournisseur
     WHERE F.id_fournisseur = ?");

// Nouvelle requête pour les produits fournis
$data_fournisseur_produits = $conn->prepare(
    "SELECT FR.id_produit,
            FR.nb_produit_fourni,
            P.nom_produit,
            ROUND((prix_produit * 1.45),2) as prix_produit,
     FROM FOURNIR FR
     INNER JOIN PRODUIT P ON P.id_produit = FR.id_produit
     WHERE FR.id_fournisseur = ?");

$data_coursier = $conn->prepare("SELECT id_coursier, nom_coursier, prenom_coursier, telephone_coursier FROM COURSIER WHERE id_coursier = ?");

try {
    if($type === "client"){
        $data_client->bind_param("i", $id);
        $data_client->execute();
        $result = $data_client->get_result();
        if($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            echo json_encode($data);
        } else {
            echo json_encode(['error' => 'Aucun client trouvé pour cet ID', 'id' => $id]);
        }

    } else if($type === "fournisseur"){
        // Récupérer les données de base
        $data_fournisseur_base->bind_param("i", $id);
        $data_fournisseur_base->execute();
        $result_base = $data_fournisseur_base->get_result();

        if($result_base->num_rows > 0) {
            $data_base = $result_base->fetch_assoc();

            // Récupérer les statistiques
            $data_fournisseur_stats->bind_param("i", $id);
            $data_fournisseur_stats->execute();
            $result_stats = $data_fournisseur_stats->get_result();
            $data_stats = $result_stats->fetch_assoc();

            // Récupérer les produits fournis
            $data_fournisseur_produits->bind_param("i", $id);
            $data_fournisseur_produits->execute();
            $result_produits = $data_fournisseur_produits->get_result();
            $produits = [];
            while($row = $result_produits->fetch_assoc()) {
                $produits[] = $row;
            }

            // Fusionner les résultats
            $data_complete = array_merge($data_base, $data_stats, ['produits' => $produits]);
            echo json_encode($data_complete);
        } else {
            echo json_encode(['error' => 'Aucun fournisseur trouvé pour cet ID', 'id' => $id]);
        }

    } else if($type === "coursier"){
        $data_coursier->bind_param("i", $id);
        $data_coursier->execute();
        $result = $data_coursier->get_result();
        if($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            echo json_encode($data);
        } else {
            echo json_encode(['error' => 'Aucun coursier trouvé pour cet ID', 'id' => $id]);
        }
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage(), 'id_used' => $id]);
}

$conn->close();
?>
