<?php
header('Content-Type: application/json');
include_once('db.php');

try {
    // Vérifier si les données de test existent déjà
    $check_client = $conn->prepare("SELECT id_client FROM CLIENT WHERE id_client = 1");
    $check_client->execute();
    $result = $check_client->get_result();
    
    if ($result->num_rows == 0) {
        // Insérer un client de test
        $insert_client = $conn->prepare("INSERT INTO CLIENT (id_client, nom, email, telephone) VALUES (1, 'Test User', 'test@example.com', '123456789')");
        $insert_client->execute();
        echo "Client de test créé\n";
    } else {
        echo "Client de test existe déjà\n";
    }
    
    // Vérifier si des commandes existent déjà
    $check_commande = $conn->prepare("SELECT id_cmd FROM COMMANDE WHERE id_client = 1");
    $check_commande->execute();
    $result = $check_commande->get_result();
    
    if ($result->num_rows == 0) {
        // Insérer des produits de test s'ils n'existent pas
        $check_produit = $conn->prepare("SELECT id_produit FROM PRODUIT WHERE id_produit = 1");
        $check_produit->execute();
        $result = $check_produit->get_result();
        
        if ($result->num_rows == 0) {
            // Insérer un prix de test
            $insert_prix = $conn->prepare("INSERT INTO PRIX (id_prix, prix_produit) VALUES (1, 1000)");
            $insert_prix->execute();
            
            // Insérer un produit de test
            $insert_produit = $conn->prepare("INSERT INTO PRODUIT (id_produit, nom_produit, type_vendu, id_prix) VALUES (1, 'Produit Test', 'kg', 1)");
            $insert_produit->execute();
            echo "Produit de test créé\n";
        }
        
        // Insérer une demande de test
        $insert_hub = $conn->prepare("INSERT INTO HUB (id_dmd, nom_dmd, date_debut, date_fin, description) VALUES (1, 'Commande Test 1', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Description de test')");
        $insert_hub->execute();
        
        // Insérer une commande de test
        $insert_commande = $conn->prepare("INSERT INTO COMMANDE (id_cmd, id_dmd, id_client, id_public_cmd, id_status, est_paye) VALUES (1, 1, 1, 'CMD001', 1, 0)");
        $insert_commande->execute();
        
        // Insérer le produit dans la commande
        $insert_commande_produit = $conn->prepare("INSERT INTO COMMANDE_PRODUIT (id_cmd, id_produit, nb_produit) VALUES (1, 1, 5)");
        $insert_commande_produit->execute();
        
        echo "Commande de test créée\n";
        
        // Insérer une deuxième commande
        $insert_hub2 = $conn->prepare("INSERT INTO HUB (id_dmd, nom_dmd, date_debut, date_fin, description) VALUES (2, 'Commande Test 2', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'Deuxième commande de test')");
        $insert_hub2->execute();
        
        $insert_commande2 = $conn->prepare("INSERT INTO COMMANDE (id_cmd, id_dmd, id_client, id_public_cmd, id_status, est_paye) VALUES (2, 2, 1, 'CMD002', 2, 0)");
        $insert_commande2->execute();
        
        $insert_commande_produit2 = $conn->prepare("INSERT INTO COMMANDE_PRODUIT (id_cmd, id_produit, nb_produit) VALUES (2, 1, 3)");
        $insert_commande_produit2->execute();
        
        echo "Deuxième commande de test créée\n";
        
    } else {
        echo "Commandes de test existent déjà\n";
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Données de test insérées avec succès'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?> 