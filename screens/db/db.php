<?php
$host = 'gy1ia.h.filess.io';
$user = 'TestDBBackend_gatherlaw';
$pass = 'a6c2b17f904747a290e01610190981732971948e';
$db = 'TestDBBackend_gatherlaw';

try {
    $conn = new mysqli($host, $user, $pass, $db, 3307);
    
    if ($conn->connect_error) {
        throw new Exception("MySQL Connection failed: " . $conn->connect_error);
    }
    
    $encodedData = file_get_contents('php://input');
    $decodedData = json_decode($encodedData, true);
} catch (Exception $e) {
    die("Database error: " . $e->getMessage());
}
?>