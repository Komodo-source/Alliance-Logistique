<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Enable error reporting for debugging
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

try {
    include_once('db.php'); 
    
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    // Log the received data for debugging
    error_log("Received data: " . $input);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
        exit;
    }

    if (!isset($data['nom_dmd'], $data['localisation_dmd'], $data['date_fin'], $data['produit_contenu'])) {
        echo json_encode(['error' => 'Champs manquants']);
        exit;
    }

    $id = uniqid(); 
    $nom_dmd = $data['nom_dmd'];
    $desc_dmd = $data['desc_dmd'] ?? "";
    $localisation_dmd = $data['localisation_dmd'];
    $date_fin = $data['date_fin'];
    $id_client = $data['id_client'] ?? 1; 
    $all_inserted = true;

    // Insertion dans HUB
    $stmt = $conn->prepare("INSERT INTO HUB(id_dmd, nom_dmd, desc_dmd, localisation_dmd, date_fin, id_client) VALUES (?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        echo json_encode(['error' => 'Erreur de préparation HUB: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("sssssi", $id, $nom_dmd, $desc_dmd, $localisation_dmd, $date_fin, $id_client);

    if (!$stmt->execute()) {
        echo json_encode(['error' => "Erreur HUB: " . $conn->error]);
        exit;
    }

    // Insertion des produits
    foreach ($data['produit_contenu'] as $produit) {
        $stmt2 = $conn->prepare("INSERT INTO CONTENANCE(id_produit, id_dmd, nb_produit, poids_piece_produit) VALUES (?, ?, ?, ?)");
        if (!$stmt2) {
            echo json_encode(['error' => 'Erreur de préparation CONTENANCE: ' . $conn->error]);
            exit;
        }
        
        $stmt2->bind_param("isis", $produit['id_produit'], $id, $produit['nb_produit'], $produit['poids_piece_produit']);
        if (!$stmt2->execute()) {
            $all_inserted = false;
            echo json_encode(['error' => "Erreur CONTENANCE: " . $conn->error]);
            exit;
        }
        $stmt2->close();
    }

    if ($all_inserted) {
        echo json_encode(['message' => 'Données insérées avec succès', 'id_dmd' => $id]);
    } else {
        echo json_encode(['error' => 'Erreur lors de l\'insertion des produits']);
    }

    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("PHP Error: " . $e->getMessage());
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>