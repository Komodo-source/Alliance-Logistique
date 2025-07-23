<?php
header('Content-Type: application/json');
include_once('lib/db_connection.php');

$data = json_decode(file_get_contents("php://input"), true);
$code = $data["code"];
$new_password = $data["new_password"];

if (empty($code) || empty($new_password)) {
    echo json_encode(['error' => 'Code and new password are required']);
    exit;
}

try {
    // Verify the code and get user ID
    $stmt = $conn->prepare("SELECT id_user FROM TEMP_CODE_RESET_PSSWD WHERE code_temp = ?");
    $stmt->bind_param("s", $code);
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $user_id = $row['id_user'];
        
        // Hash the new password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Check if user is in CLIENT table
        $check_client = $conn->prepare("SELECT id_client FROM CLIENT WHERE id_client = ?");
        $check_client->bind_param("i", $user_id);
        $check_client->execute();
        $client_result = $check_client->get_result();
        
        if ($client_result->num_rows > 0) {
            // Update client password
            $update_stmt = $conn->prepare("UPDATE CLIENT SET mdp_client = ? WHERE id_client = ?");
            $update_stmt->bind_param("si", $hashed_password, $user_id);
        } else {
            // Check if user is in FOURNISSEUR table
            $check_fournisseur = $conn->prepare("SELECT id_fournisseur FROM FOURNISSEUR WHERE id_fournisseur = ?");
            $check_fournisseur->bind_param("i", $user_id);
            $check_fournisseur->execute();
            $fournisseur_result = $check_fournisseur->get_result();
            
            if ($fournisseur_result->num_rows > 0) {
                // Update fournisseur password
                $update_stmt = $conn->prepare("UPDATE FOURNISSEUR SET mdp_fournisseur = ? WHERE id_fournisseur = ?");
                $update_stmt->bind_param("si", $hashed_password, $user_id);
            } else {
                // Check if user is in COURSIER table
                $check_coursier = $conn->prepare("SELECT id_coursier FROM COURSIER WHERE id_coursier = ?");
                $check_coursier->bind_param("i", $user_id);
                $check_coursier->execute();
                $coursier_result = $check_coursier->get_result();
                
                if ($coursier_result->num_rows > 0) {
                    // Update coursier password
                    $update_stmt = $conn->prepare("UPDATE COURSIER SET mdp_coursier = ? WHERE id_coursier = ?");
                    $update_stmt->bind_param("si", $hashed_password, $user_id);
                } else {
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }
            }
        }
        
        if ($update_stmt->execute()) {
            // Delete the temp code after successful password update
            $delete_stmt = $conn->prepare("DELETE FROM TEMP_CODE_RESET_PSSWD WHERE code_temp = ?");
            $delete_stmt->bind_param("s", $code);
            $delete_stmt->execute();
            
            echo json_encode(['success' => 'Password updated successfully']);
        } else {
            echo json_encode(['error' => 'Failed to update password: ' . $update_stmt->error]);
        }
    } else {
        echo json_encode(['error' => 'Invalid or expired code']);
    }
} catch(Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>