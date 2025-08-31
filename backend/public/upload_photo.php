<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id_fournisseur']) && isset($data['photo_path'])) {
    $id_fournisseur = $data['id_fournisseur'];
    $photo_path = $data['photo_path'];

    $stmt = $conn->prepare("INSERT INTO PHOTO_FOURNI (id_fournisseur, photo_path) VALUES (?, ?)");
    $stmt->bind_param("is", $id_fournisseur, $photo_path);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}

$conn->close();
?>