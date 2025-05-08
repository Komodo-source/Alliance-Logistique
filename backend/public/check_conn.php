<?php
header('Content-Type: application/json');
include_once('db.php'); 


if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
    echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
}else{
    echo json_encode(['success' => "Connection successful"]);
}
$conn->close();
?>