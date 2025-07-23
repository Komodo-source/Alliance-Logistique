<?php

header('Content-Type: application/json');
include_once('lib/db_connection.php'); // Add database connection
include_once('lib/get_session_info.php');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];

if (isset($data['session_id'])) {
    $id = getIdSession($data['session_id']); // Fixed variable name
    if (!$id) { // Fixed variable name
        echo json_encode(['error' => 'Invalid session_id']);
        exit;
    }
} else {
    $id = 1; // fallback for legacy/test
}

$temp_code = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT); // Ensure 4-digit code
$id_code = rand(100000, 999999); // Generate unique id_code

try {
    // First, clean up any existing codes for this user
    $cleanup_stmt = $conn->prepare("DELETE FROM TEMP_CODE_RESET_PSSWD WHERE id_user = ?");
    $cleanup_stmt->bind_param("i", $id);
    $cleanup_stmt->execute();

    $to      = $email;
    $subject = 'Confirmer votre email';
    $message = "
Compte Alliance Logistique
Code de réinitialisation de mot de passe
Utilisez ce code pour réinitialiser le mot de passe du compte Alliance Logistique.
Voici votre code: " . $temp_code . "

Ce n'est pas vous? Ignorez simplement ce message.
L'équipe Alliance logistique vous remercie de votre compréhension.";

    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $headers .= 'From: ne-pas-repondre@example.com' . "\r\n" .
                'Reply-To: ne-pas-repondre@example.com' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

    if (mail($to, $subject, $message, $headers)) {
        // Insert the temp code only if email was sent successfully
        $stmt = $conn->prepare("INSERT INTO TEMP_CODE_RESET_PSSWD(id_code, code_temp, id_user) VALUES(?,?,?)");
        $stmt->bind_param("isi", $id_code, $temp_code, $id); // Fixed bind_param types
        
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Code sent to email']);
        } else {
            echo json_encode(['error' => 'Failed to save reset code']);
        }
    } else {
        echo json_encode(['error' => 'Failed to send email']);
    }

} catch(Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}