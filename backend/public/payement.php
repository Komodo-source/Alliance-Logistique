<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$referenceId) {
    http_response_code(400);
    echo json_encode(["error" => "ReferenceId manquant"]);
    exit;
}

// === CONFIG ===
include_once("api.php");

function getAccessToken($subscriptionKey, $apiUser, $apiKey) {
    $url = 'https://sandbox.momodeveloper.mtn.com/collection/token/';
    $headers = [
        "Ocp-Apim-Subscription-Key: $subscriptionKey",
        "Authorization: Basic " . base64_encode("$apiUser:$apiKey")
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

function getStatus($accessToken, $subscriptionKey, $referenceId, $targetEnvironment) {
    $url = "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/$referenceId";
    $headers = [
        "Authorization: Bearer $accessToken",
        "X-Target-Environment: $targetEnvironment",
        "Ocp-Apim-Subscription-Key: $subscriptionKey"
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

$accessToken = getAccessToken($subscriptionKey, $apiUser, $apiKey);
if (!$accessToken) {
    http_response_code(500);
    echo json_encode(["error" => "Token non obtenu"]);
    exit;
}

$status = getStatus($accessToken, $subscriptionKey, $referenceId, $targetEnvironment);
echo json_encode($status);
?>