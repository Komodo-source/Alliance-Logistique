<?php
header('Content-Type: application/json');
include_once('db.php'); 

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['nom']) || !isset($data['Prenom']) || 
    !isset($data['Email']) || !isset($data['Tel']) || !isset($data['Password']) || 
    !isset($data['data'])) {
    echo json_encode(['message' => 'Données manquantes', 'status' => 'error']);
    exit;
}

$id = $data['id'];
$nom = $data['nom'];
$Prenom = $data['Prenom'];
$Email = hash('sha256', $data['Email']);
$Tel = hash('sha256', $data['Tel']);
$Password = hash('sha256', $data['Password']);
$flag = $data['data'];


if ($flag != "cl" && $flag != "fo" && $flag != "co") {
    echo json_encode(['message' => 'Type d\'utilisateur invalide', 'status' => 'error']);
    exit;
}

$check_email = $conn->prepare("SELECT email_client FROM CLIENT WHERE email_client = ? 
                              UNION 
                              SELECT email_fournisseur FROM FOURNISSEUR WHERE email_fournisseur = ? 
                              UNION 
                              SELECT email_coursier FROM COURSIER WHERE email_coursier = ?");
$check_email->bind_param("sss", $Email, $Email, $Email);
$check_email->execute();
$result = $check_email->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['message' => 'Cet email est déjà utilisé', 'status' => 'error']);
    $check_email->close();
    $conn->close();
    exit;
}
$check_email->close();

if($flag == "cl"){
    $stmt = $conn->prepare("INSERT INTO CLIENT(id_client, nom_client, prenom_client, email_client, telephone_client, mdp_client) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $nom, $Prenom, $Email, $Tel, $Password);
}else if($flag == "fo"){
    $stmt = $conn->prepare("INSERT INTO FOURNISSEUR(id_fournisseur, nom_fournisseur, prenom_fournisseur, email_fournisseur, telephone_fournisseur, mdp_fournisseur) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $nom, $Prenom, $Email, $Tel, $Password);    
}else{
    $stmt = $conn->prepare("INSERT INTO COURSIER(id_coursier, nom_coursier, prenom_coursier, email_coursier, telephone_coursier, mdp_coursier) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $nom, $Prenom, $Email, $Tel, $Password);        
}

if ($stmt->execute()) {
    echo json_encode(['message' => 'Données insérées avec succès', 'status' => 'success']);
} else {
    echo json_encode(['message' => 'Erreur lors de l\'insertion: ' . $stmt->error, 'status' => 'error']);
}

$stmt->close();
$conn->close();

?>