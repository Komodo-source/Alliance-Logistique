<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$subscriptionKey = $data['referenceId'] ?? null;
$apiUser = $data['apiUser'] ?? null;

$url = "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/$apiUser/apikey";
$headers = [
    "Ocp-Apim-Subscription-Key: $subscriptionKey"
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_POST => true
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if (isset($data['apiKey'])) {
    echo json_encode([
        "success" => true,
        "apiKey" => $data['apiKey']
    ]);
} else {
    echo json_encode([
        "success" => false,
        "response" => $response
    ]);
}
