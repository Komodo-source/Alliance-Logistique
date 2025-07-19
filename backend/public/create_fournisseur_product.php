<?php
header('Content-Type: application/json');

try{
    include_once('db.php');
    include_once('lib/get_session_info.php');
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['session_id'])) {
        echo json_encode(['error' => 'session_id is required']);
        exit;
    }
    $session_id = $data['session_id'];
    $id_fournisseur = getIdSession($session_id);
    if (!$id_fournisseur) {
        echo json_encode(['error' => 'Invalid session_id']);
        exit;
    }
    $list_produit = $data['list_produit'];
    $qte_produit = $data['qte_produit'];
    $lst_prix_prod = $data['prix_produit'];
    //list_produit == qte_produit length

    for($i=0; $i<$list_produit.count();$i++){
        $sql = "INSERT INTO FOURNIR (id_fournisseur,id_produit,nb_produit, prix_produit) VALUES(?, ?, ?, ?) ";
        $sql->bind_param("iiii", $id_fournisseur, $list_produit[$i], $qte_produit[$i], $lst_prix_prod[$i]);
        $sql->execute();
    }
}catch (Exception $e) {
    error_log("PHP Error: " . $e->getMessage());
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}

?>