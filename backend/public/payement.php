<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// === CONFIG ===
include_once("lib/api.php"); // doit définir $subscriptionKey, $apiUser, $apiKey, $targetEnvironment

$data = json_decode(file_get_contents("php://input"), true);
$phoneNumber = $data['phoneNumber'] ?? null;
$amount = $data['amount'] ?? "0"; // Par défaut 1000 FCFA
$externalId = "TXN" . rand(10000, 99999); // ID externe unique

if (!$phoneNumber) {
    http_response_code(400);
    echo json_encode(["error" => "Numéro de téléphone requis"]);
    exit;
}

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



function requestToPay($accessToken, $subscriptionKey, $externalId, $phoneNumber, $amount, $referenceId) {
    $url = "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay";
    $headers = [
        "Authorization: Bearer $accessToken",
        "X-Reference-Id: $referenceId",
        "X-Target-Environment: sandbox",
        "Content-Type: application/json",
        "Ocp-Apim-Subscription-Key: $subscriptionKey"
    ];

    $body = json_encode([
        "amount" => $amount,
        "currency" => "EUR", // ou "FCFA" si accepté
        "externalId" => $externalId,
        "payer" => [
            "partyIdType" => "MSISDN",
            "partyId" => $phoneNumber
        ],
        "payerMessage" => "Merci pour votre achat",
        "payeeNote" => "Paiement boutique"
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body
    ]);

    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

// === EXÉCUTION ===

$accessToken = getAccessToken($subscriptionKey, $apiUser, $apiKey);
if (!$accessToken) {
    http_response_code(500);
    echo json_encode(["error" => "Impossible d'obtenir le token"]);
    exit;
}

$referenceId = uuid_create(); 
$response = requestToPay($accessToken, $subscriptionKey, $externalId, $phoneNumber, $amount, $referenceId);


echo json_encode([
    "message" => "Paiement initié",
    "referenceId" => $referenceId,
    "externalId" => $externalId,
    "requestResponse" => json_decode($response, true)
]);
