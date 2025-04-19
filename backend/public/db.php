<?php
$host = 'db4free.net';
$user = 'komodoadmin87';
$pass = 'VcDsK1Yfcm4z6Nhb';
$db = 'logibackkomododb';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
