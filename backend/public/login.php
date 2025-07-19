<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

// Vérification que toutes les données requises sont présentes
if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['message' => 'Données manquantes', 'status' => 'error']);
    exit;
}

//$identifiant = hash('sha256',$data['username']);
//$mdp = hash('sha256', $data['password']);

// Since frontend sends hashed values, we need to hash them again to match database
// Or better: store hashed passwords in database and compare directly
$identifiant = $data['username']; //l'identifiant peut etre un numéro ou une email
$mdp = $data['password']; // This is already SHA256 hashed from frontend

// For now, let's use the hashed value directly since database might store hashed passwords
// If database stores plain text, uncomment the line below:
// $mdp = hash('sha256', $data['password']);

function create_session($conn, $id){
    $id_session = hash('sha256', uniqid('', true));
    $stmt = $conn->prepare("INSERT INTO SESSION (id_key, key_value, id_user, date_expiration) VALUES (?, 'temp_key', ?, DATE('2026-06-15 09:34:21'))");
    $stmt->bind_param("ss", $id_session, $id);
    $stmt->execute();
    $stmt->close();
    return $id_session;
}

try {
    // Requêtes pour vérifier les identifiants dans chaque table
    $stmt = $conn->prepare("SELECT id_client, nom_client, prenom_client FROM CLIENT WHERE email_client = ? AND mdp_client = ?
    UNION
    SELECT id_client, nom_client, prenom_client FROM CLIENT WHERE telephone_client = ? AND mdp_client = ?
    ");
    $stmt->bind_param("ssss", $identifiant, $mdp, $identifiant, $mdp);
    $stmt->execute();
    $result_client = $stmt->get_result();
    $client_data = $result_client->fetch_assoc();
    $stmt->close();

    $stmt2 = $conn->prepare("SELECT id_fournisseur, nom_fournisseur, prenom_fournisseur FROM FOURNISSEUR WHERE email_fournisseur = ? AND mdp_fournisseur = ?
    UNION
    SELECT id_fournisseur, nom_fournisseur, prenom_fournisseur FROM FOURNISSEUR WHERE telephone_fournisseur = ? AND mdp_fournisseur = ?");
    $stmt2->bind_param("ssss", $identifiant, $mdp, $identifiant, $mdp);
    $stmt2->execute();
    $result_fournisseur = $stmt2->get_result();
    $fournisseur_data = $result_fournisseur->fetch_assoc();
    $stmt2->close();

    $stmt3 = $conn->prepare("SELECT id_coursier, nom_coursier, prenom_coursier FROM COURSIER WHERE email_coursier = ? AND mdp_coursier = ?");
    $stmt3->bind_param("ss", $identifiant, $mdp);
    $stmt3->execute();
    $result_coursier = $stmt3->get_result();
    $coursier_data = $result_coursier->fetch_assoc();
    $stmt3->close();

    // Vérification des résultats et envoi de la réponse appropriée
    if ($client_data) {
        $session_id = create_session($conn, $client_data['id_client']);
        $user_data = $client_data;
        $user_data['session_id'] = $session_id;
        echo json_encode([
            'message' => 'Connexion réussie', 
            'status' => 'success',
            'user_type' => 'client',
            'user_data' => $user_data
        ]);
    } else if ($fournisseur_data) {
        $session_id = create_session($conn, $fournisseur_data['id_fournisseur']);
        $user_data = $fournisseur_data;
        $user_data['session_id'] = $session_id;
        echo json_encode([
            'message' => 'Connexion réussie', 
            'status' => 'success',
            'user_type' => 'fournisseur',
            'user_data' => $user_data
        ]);
    } else if ($coursier_data) {
        $session_id = create_session($conn, $coursier_data['id_coursier']);
        $user_data = $coursier_data;
        $user_data['session_id'] = $session_id;
        echo json_encode([
            'message' => 'Connexion réussie', 
            'status' => 'success',
            'user_type' => 'coursier',
            'user_data' => $user_data
        ]);
    } else {
        echo json_encode([
            'message' => 'Identifiants incorrects', 
            'status' => 'error'
        ]);
    }

} catch (Exception $e) {
    error_log("Erreur traitement err" . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "Erreur : " . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}

?>