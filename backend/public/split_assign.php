<?php
header('Content-Type: application/json');
include_once('db.php'); 

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// IL FAUDRA L'ADAPTER POUR LE NV BD
// _______________________________ 
// 
//  ATTENTION : TODO, appliquer a tous les produits de toutes les catégories
//  faire avec une liste des producteurs les plus proches et vendant le plus
//  La bd est update avec la localisation du coursier toutes les 20minutes
// _______________________________

//on doit aussi checker si le fournisseur a des produits

function calculate_dist($x, $y) {
    // Coordinates are already exploded arrays
    $x_coords = array_map('floatval', $x);
    $y_coords = array_map('floatval', $y);
    
    // Check if we have valid coordinates
    //if (count($x_coords) < 2 || count($y_coords) < 2) {
    //    return PHP_FLOAT_MAX; // Return maximum distance for invalid coordinates
    //}
    
    return sqrt(($x_coords[0]-$y_coords[0])**2 + ($x_coords[1]-$y_coords[1])**2);
}

// Récupérer tous les produits et leurs fournisseurs avec leurs localisations
$sql = "SELECT P.id_produit, P.nom_produit, F.id_fournisseur, P.id_categorie, C.nom_categorie, 
        F.localisation_fournisseur FROM FOURNIR FO 
        INNER JOIN PRODUIT P ON FO.id_produit = P.id_produit
        INNER JOIN CATEGORIE C ON P.id_categorie = C.id_categorie
        INNER JOIN FOURNISSEUR F ON F.id_fournisseur = FO.id_fournisseur";

$result = $conn->query($sql);
$prod_fourni = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $prod_fourni[] = $row;
    }
}
echo "<br>prod_fourni<br>";
echo json_encode($prod_fourni);

// Récupérer les commandes non traitées groupées par catégorie
$commande_non_traite = "SELECT H.localisation_dmd, C.id_produit, H.id_dmd, P.id_categorie, 
                       H.id_client FROM HUB H 
                       INNER JOIN CONTENANCE C ON C.id_dmd = H.id_dmd
                       INNER JOIN PRODUIT P ON P.id_produit = C.id_produit
                       WHERE est_commande = '0'
                       GROUP BY H.localisation_dmd, C.id_produit, H.id_dmd, P.id_categorie";

$result = $conn->query($commande_non_traite);
$commande_regroupe = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $commande_regroupe[] = $row;
}
echo "<br>  <br>";
echo json_encode($commande_regroupe);

// Récupérer les coursiers disponibles
$coursier_sql = "SELECT * FROM COURSIER WHERE est_occupe = '0'";
$result = $conn->query($coursier_sql);
$tout_les_coursiers_dispo = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tout_les_coursiers_dispo[] = $row;
    }
}

echo "<br>tout_les_coursiers_dispo<br>";
echo json_encode($tout_les_coursiers_dispo);

// Pour chaque commande, trouver le meilleur fournisseur et coursier
foreach ($commande_regroupe as $commande) {
    $meilleur_fournisseur = null;
    $meilleur_score = -1;
    $commande_loc = explode(";", $commande['localisation_dmd']);
    
    // Trouver le meilleur fournisseur pour cette commande
    foreach ($prod_fourni as $fournisseur) {
        echo "\n";
        
        echo "<br>fournisseur boucle <br>";
        echo json_encode($fournisseur); //fournir table
        echo json_encode($commande);
        
        if ($fournisseur['id_categorie'] == $commande['id_categorie']) {
            echo "<br>fournisseur trouvé<br>";
            echo json_encode($fournisseur);

            $fournisseur_loc = explode(";", $fournisseur['localisation_fournisseur']);
            $distance = calculate_dist($commande_loc, $fournisseur_loc);
            
            // Score basé sur la distance (plus c'est proche, meilleur est le score)
            $score = 1000 - $distance;
            echo "distance : $distance";
            
            if ($score > $meilleur_score) {
                $meilleur_score = $score;
                $meilleur_fournisseur = $fournisseur;
            }
        }
    }
    
    if ($meilleur_fournisseur) {
        echo "<br>Fournisseur trouvé<br>";
        // Trouver le coursier le plus proche du fournisseur
        echo "<br>Trouver le coursier le plus proche du fournisseur<br>";

        $coursier_plus_proche = null;
        $dist_plus_proche = PHP_FLOAT_MAX;
        $fournisseur_loc = explode(";", $meilleur_fournisseur['localisation_fournisseur']);
        
        foreach ($tout_les_coursiers_dispo as $coursier) {
            $coursier_loc = explode(";", $coursier['localisation_coursier']);
            $distance = calculate_dist($fournisseur_loc, $coursier_loc);
            
            if ($distance < $dist_plus_proche) {
                $dist_plus_proche = $distance;
                $coursier_plus_proche = $coursier;
            }
        }
        echo $coursier_plus_proche;
        echo "Coursier trouvé";
        echo $coursier_plus_proche['id_coursier'];

        
        if ($coursier_plus_proche) {
            // Créer la commande
            echo "Créer la commande";
            $SQL = "INSERT INTO COMMANDE(id_cmd, id_public_cmd, id_fournisseur, id_client, id_dmd, id_coursier, code_echange) 
                    VALUES(?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($SQL);
            $id_public = uniqid();
            $id_cmd = uniqid();
            $id_fournisseur_int = intval($meilleur_fournisseur['id_fournisseur']);
            $id_client_int = intval($commande['id_client']);
            $id_coursier_int = intval($coursier_plus_proche['id_coursier']);
            
            // Fix parameter order and types
            $stmt->bind_param("ssiiss", 
                $id_cmd,
                $id_public,
                $id_fournisseur_int,
                $id_client_int,
                $commande['id_dmd'],
                $id_coursier_int,
                rand(10000,99999)
            );
            echo "Commande créée";
            
            try {
                if ($stmt->execute()) {
                    $update_coursier = "UPDATE COURSIER SET est_occupe = '1' WHERE id_coursier = ?";
                    $stmt2 = $conn->prepare($update_coursier);
                    $stmt2->bind_param("i", $id_coursier_int);
                    $stmt2->execute();
                    $stmt2->close();
                    
                    $update_commande = "UPDATE HUB SET est_commande = '1'  WHERE id_dmd = ?";
                    $stmt3 = $conn->prepare($update_commande);
                    $stmt3->bind_param("s", $commande['id_dmd']);
                    $stmt3->execute();
                    $stmt3->close();
                }
            } catch (Exception $e) {
                echo 'Erreur lors de l\'exécution de la commande : ' . $e->getMessage();
            }

            $stmt->close();
        }
    }
}

$conn->close();
echo json_encode(["Message" => "OK"]);
?>