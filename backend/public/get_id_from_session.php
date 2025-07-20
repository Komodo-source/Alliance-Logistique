<?php
header('Content-Type: application/json');
include_once('db.php'); 

try {
    // Get and validate input
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data["id"])) {
        throw new Exception("Invalid input data");
    }

    $id_session = $data["id"];

    // Prepare and execute query
    $session_id = $conn->prepare("SELECT id_user FROM SESSION WHERE id_key = ?");
    if (!$session_id) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $session_id->bind_param("s", $id_session);
    if (!$session_id->execute()) {
        throw new Exception("Execute failed: " . $session_id->error);
    }

    $result = $session_id->get_result();
    $id_user = $result->fetch_assoc();
    $session_id->close();

    if (!$id_user) {
        echo json_encode([
            'message' => 'error', 
            'error' => 'No session found'
        ]);
        exit;
    }

    echo json_encode([
        'message' => 'success', 
        'user_data' => $id_user
    ]);

} catch (Exception $e) {
    echo json_encode([
        'message' => 'error',
        'error' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>