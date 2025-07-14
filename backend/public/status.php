<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// === CONFIG ===
include_once("lib/api.php"); // Ce fichier doit définir : $subscriptionKey, $apiUser, $apiKey, $targetEnvironment

$data = json_decode(file_get_contents("php://input"), true);
$referenceId = $data['referenceId'] ?? null;

if (!$referenceId) {
    http_response_code(400);
    echo json_encode(["error" => "ReferenceId manquant"]);
    exit;
}

// 🔐 Obtenir un token
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

// 📦 Vérifier le statut du paiement
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

// 🔄 Appel des fonctions
$accessToken = getAccessToken($subscriptionKey, $apiUser, $apiKey);

if (!$accessToken) {
    http_response_code(500);
    echo json_encode(["error" => "Token non obtenu"]);
    exit;
}

$statusData = getStatus($accessToken, $subscriptionKey, $referenceId, $targetEnvironment);

// Retour du statut
echo json_encode([
    "status" => $statusData['status'] ?? "UNKNOWN",
    "raw" => $statusData
]);
