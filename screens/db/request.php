<?php
include('db.php');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");


$SQL = "SELECT * FROM HUB";
$exeSQL = mysqli_query($conn, $SQL);

$response[] = array("Message" => array($exeSQL));
