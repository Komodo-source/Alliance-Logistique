<?php
// send_notification.php
include_once('db.php');

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data["user_id"];

function fourni_payload($token) {
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Nouvelle Commande!", 
    "body" => "Vous avez une nouvelle commande, allez dans le hub pour en découvrir les détails",
    "data" => ["extra" => "info"]
    ]);
}

function coursier_payload($token) {
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Nouvelle Commande!", 
    "body" => "Vous devez livrez une commande, allez dans le hub pour en découvrir les détails",
    "data" => ["extra" => "info"]
]);
}

function client_depart_payload($token) {
    //on décide de n'envoyez qu'une seul notif
    //seulement à la livraison et au départpas à chaque étape
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Votre Commande", 
    "body" => "Votre commande vient de partir",
    "data" => ["extra" => "info"]
]);
}
function client_livre_payload($token) {
    //on décide de n'envoyez qu'une seul notif
    //seulement à la livraison et au départpas à chaque étape
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Livraison", 
    "body" => "Votre Commande vient d'être livré, allez d'en le Hub pour pouvoir la récupérer",
    "data" => ["extra" => "info"]
]);
}

// Find the token for this user
$stmt = $conn->prepare("SELECT token FROM user_tokens WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($token);
$stmt->fetch();
$stmt->close();

if (!$token) {
    echo json_encode(["error" => "No token found for user"]);
    exit;
}

// Send push notification to Expo API
$payload = client_depart_payload($token);

$ch = curl_init("https://exp.host/--/api/v2/push/send");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
