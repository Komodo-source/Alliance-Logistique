<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
//Upload dans la db

function uploadToFtp($nomFic){
    $ftp_server = "ftpupload.net";
    $ftp_user = "if0_37377007";
    $ftp_pass = "bujsYxINZZBY4";

    $conn_id = ftp_connect($ftp_server) or die("Impossible de se connecter à $ftp_server");
    if (@ftp_login($conn_id, $ftp_user, $ftp_pass)) {
        ftp_pasv($conn_id, true); 

        $localFile = __DIR__ . '/uploads/' + $nomFic;
        $remoteFile = "/arena.ct.ws/htdocs/photo_fourni/" + $nomFic;

        if (ftp_put($conn_id, $remoteFile, $localFile, FTP_BINARY)) {
            echo "Transfert FTP réussi.";
        } else {
            echo "Échec du transfert FTP.";
        }
        ftp_close($conn_id);
    } else {
        echo "Connexion FTP échouée.";
    }
}

if (isset($data['id_fournisseur']) && isset($data['photo_path'])) {
    $id_fournisseur = $data['id_fournisseur'];
    $photo_path = $data['photo_path'];
    $stmt = $conn->prepare("INSERT INTO PHOTO_FOURNI (id_fournisseur, photo_path) VALUES (?, ?)");
    $stmt->bind_param("is", $id_fournisseur, $photo_path);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}

$conn->close();
?>