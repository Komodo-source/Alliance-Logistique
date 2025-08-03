<?php
header('Content-Type: application/json');
include_once('db.php');

// TODO
$sql = "SELECT *  FROM HUB";
$result = $conn->query($sql);

$data = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
$conn->close();
?>

