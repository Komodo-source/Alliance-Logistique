<?php
// send_notification.php
include_once('db.php');
include_once('lib/get_session_info.php');
$data = json_decode(file_get_contents("php://input"), true);
   if (!isset($data['session_id'])) {
      echo json_encode(['error' => 'session_id is required']);
      exit;
   }
   $session_id = $data['session_id'];
   $user_id = getIdSession($session_id);

$payload_id = $data["payload_num"];
$type = $data["type"];
$idCommand = $data["IdCommande"] ?? " ";
$nomCommand = $data["nomCommand"] ?? " ";

if(isset($data["IdCommande"])){
    $idCommand = $data["IdCommande"];
}
if(isset($data["nomCommand"])){
    $nomCommand = $data["nomCommand"];
}


function fourni_payload($token) { //1
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Nouvelle Commande 📦",
    "body" => "Vous avez une nouvelle commande, allez dans le hub pour en découvrir les détails",
    "data" => ["extra" => "info"]
    ]);
}

function coursier_payload($token) { //2
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Nouvelle Commande 📦",
    "body" => "Vous devez livrez une commande, allez dans le hub pour en découvrir les détails",
    "data" => ["extra" => "info"]
]);
}

function client_depart_payload($token) { //3
    //on décide de n'envoyez qu'une seul notif
    //seulement à la livraison et au départpas à chaque étape
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Commande ".$idCommand . " est partie 🚚",
    "body" => "Votre ".$nomCommand . " commande vient de partir du fournisseur ",
    "data" => ["extra" => "info"]
]);
}
function client_livre_payload($token) { //4
    //on décide de n'envoyez qu'une seul notif
    //seulement à la livraison et au départpas à chaque étape
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Livraison " . $idCommand . " livré ✅",
    "body" => "Votre Commande ". $idCommand ." vient d'être livré, allez d'en le Hub pour pouvoir la récupérer",
    "data" => ["extra" => "info"]
]);
}

function client_commande_a_payer($token) { //5
    return json_encode([
    "to" => $token,
    "sound" => "default",
    "title" => "Commande " . $idCommand . " a payé " ,
    "body" => "Votre Commande ". $idCommand ." doit être payé, rendez vous dans le Hub",
    "data" => ["extra" => "info"]
]);
}



//get token
$stmt = $conn->prepare("SELECT token FROM user_tokens WHERE user_id = ? AND type = ?");
$stmt->bind_param("is", $user_id, $type);
$stmt->execute();
$stmt->bind_result($token);
$stmt->fetch();
$stmt->close();

if (!$token) {
    echo json_encode(["error" => "No token found for user"]);
    exit;
}

// Send push notification to Expo API

$payloads = [
  1 => 'fourni_payload',
  2 => 'coursier_payload',
  3 => 'client_depart_payload',
  4 => 'client_livre_payload',
  5 => 'client_commande_a_payer'
];


$payload_func = $payloads[$payload_id] ?? 'client_depart_payload';
$payload = $payload_func($token);

$ch = curl_init("https://exp.host/--/api/v2/push/send");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
