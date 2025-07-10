<?php

try {
// A OBFUSQUER LES DONNEES
// === CONFIG ===
    $subscriptionKey = "a064a712d372466fb0fb6a2e54b22a84";
    //get api user
    $payload = json_encode([
        "referenceId" => $subscriptionKey
    ]);
    $url = "https://backend-logistique-api-latest.onrender.com/create_user_api.php";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        ]
    ]);   
    $response = curl_exec($ch);
    curl_close($ch);
    $apiUser = $response['apiUser'];

    //APi key
    $payload = json_encode([
        "referenceId" => $subscriptionKey,
        "apiUser" => $apiUser
    ]);
    $url = "https://backend-logistique-api-latest.onrender.com/generate_apikey.php";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        ]
    ]);   
    $response = curl_exec($ch);
    curl_close($ch);
    $apiKey = $response["apiKey"];
    $targetEnvironment = "sandbox"; 


}catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des données : " . $e->getMessage()
    ]);
}
?>