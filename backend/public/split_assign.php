<?php
header('Content-Type: application/json');
include_once('db.php'); 

// _______________________________
// 
// 
//  ATTENTION : TODO, appliquer a tous les produits de toutes les catégories
//  faire avec une liste des producteurs les plus proches et vendant le plus
// _______________________________

function calculate_dist($x, $y){ //x et y sont des liste de taille 2
    return sqrt(($x[0]-$y[0])**2 + ($x[1]-$y[1])**2);
}

$sql = "SELECT P.id_produit, nom_produit, id_fournisseur, id_categorie, nom_categorie,localisation_fournisseur FROM FOURNIR F 
INNER JOIN PRODUIT P ON F.id_produit = F.id_produit
INNER JOIN CATEGORIE C ON P.id_categorie = C.id_categorie";
//on récupère ce que les fournisseurs produisent

$result = $conn->query($sql);
$prod_fourni = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $prod_fourni[] = $row;
    }
}

$commande_non_traite = "SELECT localisation_dmd, id_produit, H.id_dmd FROM HUB H WHERE est_commande = FALSE
INNER JOIN CONTENANCE C ON C.id_dmd = H.id_dmd;
INNER JOIN PRODUIT P ON P.id_produit = C.id_produit;
GROUP BY id_categorie" ;
$commande_regroupe = [];

$result = $conn->query($sql);
$commande_regroupe = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $commande_regroupe[] = $row;
    }
}

//on sélectionne tout les courisers dispoonibles pour savoirs qui va faire la livraison
$coursier = "SELECT *  FROM COURSIER WHERE est_occupe = FALSE";
$tout_les_coursiers_dispo = [];
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tout_les_coursiers_dispo[] = $row;
    }
}

$nb_produit = 0;
$meilleur_nb_tt = -1;
$id_fournisseur_produisant_le_plus = "";


//nous donne pour un produit donné (par son id) quel producteur le produit le plus 
//on peut ajouter une condition dans le if pour avoir une distance raisonnable pour l'instant inutile
for($i=0;$i<$commande_regroupe.length();$i++){
    for($j=0; $j<$commande_regroupe[i]["id_produit"].length();$j++){
        //on parcourt chaque produit d'une meme caté poru vour quel producteur le produit plus
        for($l=0;$l<$commande_regroupe.length();$l++){
            for($k=0; $k<$commande_regroupe[i]["id_produit"].length();$k++){ //on parcourt l'id produit d'un certain fournisseur
                //on compare avec ce que l'on a trouvé
                if($commande_regroupe[$i]["id_produit"][$j] in $prod_fourni[0]["id_produit"][$k]){
                    $nb_produit ++;
                }
            }
        }
        if ($nb_produit > $meilleur_nb_tt){
            $id_fournisseur_produisant_le_plus = $prod_fourni[0]["id_fournisseur"][$k];
            $meilleur_nb_tt = $nb_produit;                        
        }
        $nb_produit = 0;        
    }
}

$coursier_plus_proche = "";
$dist_plus_proche = 1000; // = a une distance trop grande qu'on associe à l'infinie
//on obtient le coursier le plsu proche
for($i=0;$i<$tout_les_coursiers_dispo.length();$i++){
    $distance_calcule = calculate_dist($tout_les_coursiers_dispo[$i]["localisation_coursier"].str_split(";"), 
    $prod_fourni[$id_fournisseur_produisant_le_plus]["localisation_fournisseur"].str_split(";"));
    if($distance_calcule < $dist_plus_proche){
        $coursier_plus_proche = $tout_les_coursiers_dispo[$i]["id_coursier"];
        $dist_plus_proche = $distance_calcule; 
    }
}

//réaliser la commande avec le coursier

$SQL = "INSERT INTO COMMANDE(id_dmd, id_public_cmd, id_fournisseur, id_client, id_dmd, id_coursier) 
VALUES(?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($SQL);
$stmt->bind_param("ssssss", $commande_regroupe["id_dmd"], uniqid(), $id_fournisseur_produisant_le_plus, $commande_regroupe["id_client"], $coursier_plus_proche);


if ($stmt->execute()) {
    $response = array("Message" => "OK");
} else {
    $response = array("Message" => "Erreur lors de l'insertion: " . $conn->error);

$stmt->close();
$conn->close();
?>