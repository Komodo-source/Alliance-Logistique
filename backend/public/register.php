<?php
header('Content-Type: application/json');

try {
    include_once('db.php'); 
    
    // Get and validate input data
    $input = file_get_contents("php://input");
    if (empty($input)) {
        throw new Exception('No input data received');
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }
    
    // Validate required fields
    $required = ['id', 'nom', 'Prenom', 'Email', 'Tel', 'Password', 'data'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    function create_session($conn, $id){
        $id_session = hash('sha256', uniqid('', true));
        $stmt = $conn->prepare("INSERT INTO SESSION (id_key, key_value, id_user, date_expiration) VALUES (?, 'temp_key', ?, DATE('2026-06-15 09:34:21'))");
        $stmt->bind_param("ss", $id_session, $id);
        $stmt->execute();
        $stmt->close();
        return $id_session;
    }
    
    $id = $data['id'];
    $nom = $data['nom'];
    $Prenom = $data['Prenom'];
    //$Email = hash('sha256', $data['Email']);
    $Email = $data['Email'];
    //Tel = hash('sha256', $data['Tel']);
    $Tel = $data['Tel'];
    //$Password = hash('sha256', $data['Password']);
    $Password = $data['Password'];
    $flag = $data['data'];
    
    // Validate user type
    if (!in_array($flag, ['cl', 'fo', 'co'])) {
        throw new Exception('Invalid user type');
    }
    
    // Check if email exists
    $check_email = $conn->prepare("SELECT email_client FROM CLIENT WHERE email_client = ? 
                                  UNION 
                                  SELECT email_fournisseur FROM FOURNISSEUR WHERE email_fournisseur = ? 
                                  UNION 
                                  SELECT email_coursier FROM COURSIER WHERE email_coursier = ?");
    $check_email->bind_param("sss", $Email, $Email, $Email);
    $check_email->execute();
    $result = $check_email->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception('Email already in use');
    }
    $check_email->close();
    
    // Prepare the appropriate insert statement
    if($flag == "cl"){
        $stmt = $conn->prepare("INSERT INTO CLIENT(id_client, nom_client, prenom_client, email_client, telephone_client, mdp_client) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $id, $nom, $Prenom, $Email, $Tel, $Password);
        $user_data = [
            'id_client' => $id,
            'nom_client' => $nom,
            'prenom_client' => $Prenom,
            'email_client' => $Email,
            'telephone_client' => $Tel
        ];
    } else if($flag == "fo"){
        $stmt = $conn->prepare("INSERT INTO FOURNISSEUR(id_fournisseur, nom_fournisseur, prenom_fournisseur, email_fournisseur, telephone_fournisseur, mdp_fournisseur) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $id, $nom, $Prenom, $Email, $Tel, $Password);    
        $user_data = [
            'id_fournisseur' => $id,
            'nom_fournisseur' => $nom,
            'prenom_fournisseur' => $Prenom,
            'email_fournisseur' => $Email,
            'telephone_fournisseur' => $Tel
        ];
    } else {
        $stmt = $conn->prepare("INSERT INTO COURSIER(id_coursier, nom_coursier, prenom_coursier, email_coursier, telephone_coursier, mdp_coursier, est_occupe) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $occupied = 1;
        $stmt->bind_param("ssssssi", $id, $nom, $Prenom, $Email, $Tel, $Password, $occupied);        
        $user_data = [
            'id_coursier' => $id,
            'nom_coursier' => $nom,
            'prenom_coursier' => $Prenom,
            'email_coursier' => $Email,
            'telephone_coursier' => $Tel
        ];
    }
    
    if (!$stmt->execute()) {
        throw new Exception('Insertion error: ' . $stmt->error);
    }
    
    $session_id = create_session($conn, $id);
    $user_data['session_id'] = $session_id;
    echo json_encode([
        'message' => 'Registration successful', 
        'status' => 'success',
        'user_data' => $user_data
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage(),
        'status' => 'error'
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>