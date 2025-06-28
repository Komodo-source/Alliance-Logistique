<?php
header('Content-Type: application/json');

try{
    include_once('db.php');
    $data = json_decode(file_get_contents("php://input"), true);

    $id_fournisseur = $data['id_fournisseur'];
    $list_produit = $data['list_produit'];
    $qte_produit = $data['qte_produit'];
    //list_produit == qte_produit length

    for($int i=0; $i<$list_produit.count();$i++){
        $sql = "INSERT INTO FOURNIR (id_fournisseur,id_produit,nb_produit) VALUES(?, ?, ?) ";
        $sql->bind_param("iii", $id_fournisseur, $list_produit[$i], $qte_produit[$i]);
        $sql->execute();
    }
}

?>