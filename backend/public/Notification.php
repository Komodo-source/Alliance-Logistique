<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$token = $data["token"];

$message = [
    'to' => $token,
    'sound' => 'default',
    'title' => 'Alerte',
    'body' => 'Une condition dans la base de données est vraie !',
    'data' => ['extra' => 'valeur optionnelle']
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($message)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents('https://exp.host/--/api/v2/push/send', false, $context);

if ($response === FALSE) {
    echo json_encode(['success' => false, 'error' => 'Failed to send notification']);
} else {
    echo json_encode(['success' => true, 'response' => $response]);
}
?>