<?php

header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];

    $to      = $email;
    $subject = 'Confirmer votre email';
    $message = "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<style>
    h1 {
        text-align: center;
         font-family: arial
    }
    p {
        margin-left: 0.5rem;
        font-family: arial
    }
</style>
<body>
    <h1>Validation de votre adresse e‑mail</h1>
    <p>Bonjour,<br>
<br>
Vous avez récemment sélectionné" . $email . " comme votre nouveau compte Alliance Logistique. Veuillez confirmer que cette adresse e‑mail vous appartient en saisissant le code ci‑dessous sur la page de validation de l’e‑mail :</p>
    
    <p>Pourquoi recevez-vous cet e‑mail ?
Alliance Logistique exige une validation à chaque fois qu’une adresse e‑mail est sélectionnée comme votre compte Alliance Logistique. Votre adresse e‑mail ne peut être utilisée qu’une fois validée.
<br>
<br>
Cordialement,
<br>
<br>L’assistance Alliance Logistique</p>
</body>
</html>";

    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $headers .= 'From: ne-pas-repondre@example.com'       . "\r\n" .
                 'Reply-To: ne-pas-repondre@example.com' . "\r\n" .
                 'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);
?>