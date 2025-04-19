<?php
$host = 'db4free.net';
$user = 'komodoadmin87';
$pass = 'VcDsK1Yfcm4z6Nhb';
$db = 'logibackkomododb';

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