<?php

header('Content-Type: application/json');
include_once('db.php');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];

$temp_code = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
$id_code = rand(100000, 999999);

try {
    // Fetch client id from email
    $hashed_email = hash('sha256', $email);
    $select_stmt = $conn->prepare("SELECT id_client FROM CLIENT WHERE email_client = ?");
    $select_stmt->bind_param("s", $hashed_email); 
    $select_stmt->execute();
    $result = $select_stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $id = $row['id_client'];
        $select_stmt->close();

        // Clean up existing codes
        $cleanup_stmt = $conn->prepare("DELETE FROM TEMP_CODE_RESET_PSSWD WHERE id_user = ?");
        $cleanup_stmt->bind_param("i", $id);
        $cleanup_stmt->execute();
        $cleanup_stmt->close();

        // Rest of email sending code
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
            $insert_stmt = $conn->prepare("INSERT INTO TEMP_CODE_RESET_PSSWD(id_code, code_temp, id_user) VALUES(?,?,?)");
            $insert_stmt->bind_param("isi", $id_code, $temp_code, $id);
            
            if ($insert_stmt->execute()) {
                echo json_encode(['success' => 'Code sent to email']);
            } else {
                echo json_encode(['error' => 'Failed to save reset code']);
            }
            $insert_stmt->close();
        } else {
            echo json_encode(['error' => 'Failed to send email']);
        }
    } else {
        echo json_encode(['error' => 'Email not found']);
    }

} catch(Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

$conn->close();