<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$subscriptionKey = $data['referenceId'] ?? null;

$callbackHost = "https://example.com"; 

$uuid = uuid_create(); // Crée un identifiant unique

$url = "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser";
$headers = [
    "Ocp-Apim-Subscription-Key: $subscriptionKey",
    "Content-Type: application/json",
    "X-Reference-Id: $uuid"
];

$body = json_encode([
    "providerCallbackHost" => $callbackHost
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $body
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode === 201) {
    echo json_encode([
        "success" => true,
        "apiUser" => $uuid
    ]);
} else {
    echo json_encode([
        "success" => false,
        "httpCode" => $httpcode,
        "response" => $response
    ]);
}