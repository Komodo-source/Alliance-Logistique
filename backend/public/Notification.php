<?php
$token = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
$message = [
    'to' => $token,
    'sound' => 'default',
    'title' => 'Alerte',
    'body' => 'Une condition dans la base de données est vraie !',
    'data' => ['extra' => 'valeur optionnelle']
];

$data = json_encode($message);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://exp.host/--/api/v2/push/send');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
