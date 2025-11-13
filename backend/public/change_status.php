<?php
header('Content-Type: application/json');
include_once('db.php');

function trigger_notification_client($payload_num){
    $sql = "SELECT session_id FROM SESSION S
            INNER JOIN COMMANDE CMD ON S.id_user = CMD.id_client
            WHERE id_cmd=?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_cmd);
    $stmt->query($sql);
    $session_id = $stmt->fetch_assoc();

$url = 'https://backend-logistique-api-latest.onrender.com/sendNotification.php';
$data = ['session_id' => $session_id, 'type'=> 'client', 'payload_num'=> $payload_num];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

$context  = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    // Handle error
}

$data = json_decode($response, true);


}


$input = json_decode(file_get_contents("php://input"), true);
$id_cmd = $input["id_cmd"];
$nv_status = $input["status"];  // Changé de $data à $input

try{
    $sql = "UPDATE COMMANDE SET id_status = ? WHERE id_cmd = ?";
    $stmt = $conn->prepare($sql);

    $stmt->bind_param("ii", $nv_status, $id_cmd);  // Corrigé
    $stmt->execute();

    $status_to_payload = [
        1 => 3,//livraison en cours
        2 => 4//livré
    ];
    trigger_notification_client($status_to_payload[$nv_status]);

    if($stmt->affected_rows > 0) {
        echo json_encode(["ok" => "success", "updated" => true]);

    } else {
        echo json_encode(["ok" => "success", "updated" => false, "message" => "No rows affected"]);
    }

    $stmt->close();
} catch(Exception $e){
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
