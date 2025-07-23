<?php
header('Content-Type: application/json');
include_once('lib/db_connection.php'); // Add database connection

$data = json_decode(file_get_contents("php://input"), true);
$code = $data["code"];

try {
    $stmt = $conn->prepare("SELECT id_user FROM TEMP_CODE_RESET_PSSWD WHERE code_temp = ?");
    $stmt->bind_param("s", $code);
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'success' => 'Code correct',
            'id_user' => $row['id_user']
        ]);
    } else {
        echo json_encode(['error' => 'Wrong code']);
    }
} catch(Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>