<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// === CONFIG ===
// Assurez-vous que ce fichier définit: $subscriptionKey, $apiUser, $apiKey, $targetEnvironment
include_once("lib/api.php");

$data = json_decode(file_get_contents("php://input"), true);
$referenceId = $data['referenceId'] ?? null;

if (!$referenceId) {
    http_response_code(400);
    echo json_encode(["status" => "ERROR", "message" => "ReferenceId manquant"]);
    exit;
}

// Déterminer l'URL de base (Sandbox vs Production)
$baseUrl = ($targetEnvironment == "sandbox")
    ? "https://sandbox.momodeveloper.mtn.com"
    : "https://proxy.momoapi.mtn.com";

// 🔐 Obtenir un token
function getAccessToken($baseUrl, $subscriptionKey, $apiUser, $apiKey) {
    $url = "$baseUrl/collection/token/";
    $headers = [
        "Ocp-Apim-Subscription-Key: $subscriptionKey",
        "Authorization: Basic " . base64_encode("$apiUser:$apiKey")
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => "" // POST request empty body
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return null;
    }

    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

// 📦 Vérifier le statut du paiement
function getStatus($baseUrl, $accessToken, $subscriptionKey, $referenceId, $targetEnvironment) {
    $url = "$baseUrl/collection/v1_0/requesttopay/$referenceId";
    $headers = [
        "Authorization: Bearer $accessToken",
        "X-Target-Environment: $targetEnvironment",
        "Ocp-Apim-Subscription-Key: $subscriptionKey"
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => "GET"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Gestion des erreurs API (ex: 404 si la référence n'existe pas)
    if ($httpCode === 404) {
        return ["status" => "NOT_FOUND", "reason" => "Transaction introuvable"];
    }

    return json_decode($response, true);
}


$accessToken = getAccessToken($baseUrl, $subscriptionKey, $apiUser, $apiKey);

if (!$accessToken) {
    http_response_code(500);
    echo json_encode(["status" => "ERROR", "message" => "Impossible d'obtenir le token"]);
    exit;
}

$statusData = getStatus($baseUrl, $accessToken, $subscriptionKey, $referenceId, $targetEnvironment);

// Retour du statut propre
if (isset($statusData['status'])) {
    echo json_encode([
        "status" => $statusData['status'], // SUCCESSFUL, FAILED, PENDING
        "reason" => $statusData['reason'] ?? "" // Raison de l'échec si dispo
    ]);
} else {
    // Erreur inattendue
    echo json_encode([
        "status" => "ERROR",
        "raw" => $statusData
    ]);
}
?>
