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
        $expiration = date('Y-m-d H:i:s', strtotime('+1 year'));
        $stmt = $conn->prepare("INSERT INTO SESSION (id_key, key_value, id_user, date_expiration) VALUES (?, 'temp_key', ?, ?)");
        $stmt->bind_param("sis", $id_session, $id, $expiration);
        $stmt->execute();
        $stmt->close();
        return $id_session;
    }

    $id = (int)$data['id'];
    $nom = trim($data['nom']);
    $Prenom = trim($data['Prenom']);
    $Email = trim($data['Email']);
    $Tel = trim($data['Tel']);
    $Password = hash('sha256', $data['Password']);
    $flag = trim($data['data']);

    // Validate user type
    if (!in_array($flag, ['cl', 'fo', 'co'])) {
        throw new Exception('Invalid user type');
    }

    // Validate email format
    if (!filter_var($Email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
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

    // Handle organisation creation for suppliers
    $id_orga = null;
    if ($flag == "fo" && isset($data["organisation"]) && !empty($data["organisation"])) {
        $nom_organisation = trim($data["organisation"]);
        $id_orga = rand(0, 99999);

        if (isset($data["ville"]) && !empty($data["ville"])) {
            $ville_organisation = trim($data["ville"]);
            $stmt2 = $conn->prepare("INSERT INTO ORGANISATION(id_orga, nom_orga, ville_organisation) VALUES (?, ?, ?)");
            $stmt2->bind_param("iss", $id_orga, $nom_organisation, $ville_organisation);
            $stmt2->execute();
            $stmt2->close();
        } else if (isset($data["latitude"]) && isset($data["longitude"]) && !empty($data["latitude"]) && !empty($data["longitude"])) {
            $latitude = floatval($data["latitude"]);
            $longitude = floatval($data["longitude"]);
            $loc_orga = $latitude . ";" . $longitude;
            $stmt2 = $conn->prepare("INSERT INTO ORGANISATION(id_orga, nom_orga, localisation_orga) VALUES (?, ?, ?)");
            $stmt2->bind_param("iss", $id_orga, $nom_organisation, $loc_orga);
            $stmt2->execute();
            $stmt2->close();
        }
    }

    // Prepare the appropriate insert statement
    if ($flag == "cl") {
        $stmt = $conn->prepare("INSERT INTO CLIENT(id_client, nom_client, prenom_client, email_client, telephone_client, mdp_client) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $id, $nom, $Prenom, $Email, $Tel, $Password);
        $user_data = [
            'id_client' => $id,
            'nom_client' => $nom,
            'prenom_client' => $Prenom,
            'email_client' => $Email,
            'telephone_client' => $Tel
        ];
    } else if ($flag == "fo") {
        $stmt = $conn->prepare("INSERT INTO FOURNISSEUR(id_fournisseur, nom_fournisseur, prenom_fournisseur, email_fournisseur, telephone_fournisseur, mdp_fournisseur, id_orga) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssssi", $id, $nom, $Prenom, $Email, $Tel, $Password, $id_orga);
        $user_data = [
            'id_fournisseur' => $id,
            'nom_fournisseur' => $nom,
            'prenom_fournisseur' => $Prenom,
            'email_fournisseur' => $Email,
            'telephone_fournisseur' => $Tel
        ];
    } else {
        // COURSIER
        $occupied = 0;
        $stmt = $conn->prepare("INSERT INTO COURSIER(id_coursier, nom_coursier, prenom_coursier, email_coursier, telephone_coursier, mdp_coursier, est_occupe) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssssi", $id, $nom, $Prenom, $Email, $Tel, $Password, $occupied);
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

    http_response_code(200);
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
