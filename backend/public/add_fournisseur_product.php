<?php
header('Content-Type: application/json');
// Add in FOURNIR (in db) the products provided by the supplier

try{
    

    include_once('db.php');
    include_once('lib/get_session_info.php');
    
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['session_id'])) {
        echo json_encode(['error' => 'session_id is required']);
        exit;
    }
    $session_id = $data['session_id'];
    $id_fournisseur = getIdSession($session_id);
    if (!$id_fournisseur) {
        echo json_encode(['error' => 'Invalid session_id']);
        exit;
    }
    $list_produit = $data['list_produit'];
    $qte_produit = $data['qte_produit'];
    $prix_produit = $data['prix_produit']; 
    
    // Check if arrays have same length
    if (count($list_produit) !== count($qte_produit) || count($list_produit) !== count($prix_produit)) {
        throw new Exception("Arrays must have the same length");
    }

    $success_count = 0;
    for($i = 0; $i < count($list_produit); $i++){
        // Check if record exists
        $check_sql = "SELECT COUNT(*) as count FROM FOURNIR WHERE id_fournisseur = ? AND id_produit = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("ii", $id_fournisseur, $list_produit[$i]);
        $check_stmt->execute();
        $result = $check_stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            // Update existing record
            $sql = "UPDATE FOURNIR SET nb_produit_fourni = nb_produit_fourni + ?, prix_produit = ? WHERE id_fournisseur = ? AND id_produit = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("idii", $qte_produit[$i], $prix_produit[$i], $id_fournisseur, $list_produit[$i]);
        } else {
            // Insert new record
            $sql = " FOURNIR (id_fournisseur, id_produit, prix_produit, nb_produit_fourni) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iidi", $id_fournisseur, $list_produit[$i], $prix_produit[$i], $qte_produit[$i]);
        }
        
        if ($stmt->execute()) {
            $success_count++;
        }
        $stmt->close();
    }
    
    echo json_encode([
        'success' => true, 
        'message' => "Successfully updated $success_count products",
        'updated_count' => $success_count
    ]);
    
}catch (Exception $e) {
    error_log("PHP Error: " . $e->getMessage());
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}

?>