<?php

function getIdSession($id) {
    try {
        $url = 'https://backend-logistique-api-latest.onrender.com/get_id_from_session.php';
        $data = json_encode(['id' => $id]);

        $options = [
            'http' => [
                'header'  => "Content-Type: application/json\r\n",
                'method'  => 'POST',
                'content' => $data,
            ],
        ];

        $context   = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        $responseData = json_decode($response, true);

        if (isset($responseData["user_data"])) {
            return $responseData["user_data"]["id_user"];
        } else {
            // Optionally handle error
            return null;
        }

    } catch (Exception $error) {
       
        return null;
    }
}

?>
