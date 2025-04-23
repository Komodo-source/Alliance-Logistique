<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

$id = //il faut mettre un id
$nom = $data['nom'];
$Prenom = $data['Prenom'];
$Email = $data['Email'];
$Tel = $data['Tel'];
$Password = $data['Password'];
$flag = $data['data'];


// Requête préparée pour éviter les injections SQL
if($flag == "cl"){
    $stmt = $conn->prepare("INSERT INTO CLIENT(id_client, nom_client, prenom_client, email_client, telephone_client, mdp_client) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $nom, $Prenom ,$Email, $tel, $Password);
}else if($flag == "fo"){
    $stmt = $conn->prepare("INSERT INTO FOURNISSEUR(id_fournisseur, nom_fournisseur, prenom_fournisseur, email_fournisseur, telephone_fournisseur, mdp_fournisseur) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $nom, $Prenom ,$Email, $tel, $Password);    
}else{
    $stmt = $conn->prepare("INSERT INTO COURSIERcoursier(id_coursier, nom_coursier, prenom_coursier, email_coursier, telephone_coursier, mdp_coursier) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $nom, $Prenom ,$Email, $tel, $Password);        
}

if ($stmt->execute()) {
    echo json_encode(['message' => 'Données insérées avec succès']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'insertion']);
}

$stmt->close();
$conn->close();

?>