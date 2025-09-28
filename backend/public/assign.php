<?php
header('Content-Type: application/json');
include_once('db.php');
include_once('lib/get_session_info.php');
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Ce script traite les demmandes de HUB non traités et crée pour chaque commande de HUB
// une COMMANDE avec les produits associés (divisé par catégorie), en choisissant le meilleur fournisseur et le meilleur coursier.


/// fix les id envoyé sont des session id alors que l'on implémente des
/// dans COMMANDE des id direct

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    $list_fourni = $data['list_fourni'];

    function calculate_dist($x, $y) {
        // Ensure both inputs are non-empty strings
        if (!is_string($x) || !is_string($y) || empty($x) || empty($y)) return PHP_FLOAT_MAX;
        // Try both ',' and ';' as delimiters for robustness
        $x_coords = strpos($x, ',') !== false ? array_map('floatval', explode(',', $x)) : array_map('floatval', explode(';', $x));
        $y_coords = strpos($y, ',') !== false ? array_map('floatval', explode(',', $y)) : array_map('floatval', explode(';', $y));
        if (count($x_coords) < 2 || count($y_coords) < 2) return PHP_FLOAT_MAX;
        return sqrt(pow($x_coords[0] - $y_coords[0], 2) + pow($x_coords[1] - $y_coords[1], 2));
    }

    // 1. Get unprocessed HUB entries
    $unprocessed_hubs_sql = "SELECT * FROM HUB WHERE est_commande = 0";
    $result = $conn->query($unprocessed_hubs_sql);

    if (!$result) throw new Exception("Erreur récupération HUB non traités: " . $conn->error);

    $unprocessed_hubs = $result->fetch_all(MYSQLI_ASSOC);
    if (empty($unprocessed_hubs)) {
        echo json_encode(["status" => "success", "message" => "Aucune commande à traiter", "processed_count" => 0]);
        exit;
    }

    // 2. Fournisseurs par catégorie
    $suppliers_sql = "SELECT F.id_fournisseur, F.localisation_fournisseur, P.id_categorie
                      FROM FOURNISSEUR F
                      INNER JOIN FOURNIR FO ON F.id_fournisseur = FO.id_fournisseur
                      INNER JOIN PRODUIT P ON FO.id_produit = P.id_produit";

    $result = $conn->query($suppliers_sql);
    if (!$result) throw new Exception("Erreur récupération fournisseurs: " . $conn->error);

    $suppliers_by_category = [];
    while ($row = $result->fetch_assoc()) {
        $cat = $row['id_categorie'];
        $suppliers_by_category[$cat][] = $row;
    }

    // 3. Coursiers disponibles
    $couriers_sql = "SELECT * FROM COURSIER WHERE est_occupe = 1";
    $result = $conn->query($couriers_sql);
    if (!$result) throw new Exception("Erreur récupération coursiers: " . $conn->error);

    $available_couriers = $result->fetch_all(MYSQLI_ASSOC);

    $processed_count = 0;
    $commands_created = 0;

    foreach ($unprocessed_hubs as $hub) {
        $hub_id = $hub['id_dmd'];
        $hub_location = $hub['localisation_dmd'];

        // 1. Get all CONTENANCE rows for this HUB, joined with product and category
        $sql = "
            SELECT
                CO.id_produit,
                CO.nb_produit,
                CO.poids_piece_produit,
                P.id_categorie,
                P.nom_produit
            FROM CONTENANCE CO
            JOIN PRODUIT P ON CO.id_produit = P.id_produit
            WHERE CO.id_dmd = ?
        ";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("s", $hub_id);
        $stmt->execute();
        $contenance_rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // 2. Group products by category
        $products_by_category = [];
        foreach ($contenance_rows as $row) {
            $cat = $row['id_categorie'];
            $products_by_category[$cat][] = $row;
        }

        $count_product = 0;
        // 3. For each category, create a COMMANDE and link products
        foreach ($products_by_category as $category_id => $products) {
            // Find best supplier for this category
            if($list_fourni[$count_product] == null){
                //le fournisseur est par defaut
                $best_supplier = null;
                $min_distance = PHP_FLOAT_MAX;
                if (isset($suppliers_by_category[$category_id])) {
                    foreach ($suppliers_by_category[$category_id] as $supplier) {
                        $distance = calculate_dist($hub_location, $supplier['localisation_fournisseur']);
                        if ($distance < $min_distance) {
                            $min_distance = $distance;
                            $best_supplier = $supplier;
                        }
                    }
                }
                if (!$best_supplier) continue;
            }else {
                //sinon on prend le fournisseur que l'user a choisi
                $best_supplier = getIdSession($list_fourni[$count_product]);
            }

            // Find best courier
            $best_courier = null;
            $min_courier_dist = PHP_FLOAT_MAX;
            $courier_index = -1;
            foreach ($available_couriers as $index => $courier) {
                $distance = calculate_dist($best_supplier['localisation_fournisseur'], $courier['localisation_coursier']);
                if ($distance < $min_courier_dist) {
                    $min_courier_dist = $distance;
                    $best_courier = $courier;
                    $courier_index = $index;
                }
            }
            if (!$best_courier) continue;

            $count_product += 1;

            // Insert COMMANDE row for this category
            $cmd_id = rand(0, 99999);
            $public_id = uniqid("CMD_");
            $exchange_code = rand(0, 99999);
            $exchange_code_fourni = rand(0, 99999);
            $status_default = 3;
            $insert_sql = "
                INSERT INTO COMMANDE(id_cmd, id_public_cmd, id_fournisseur, id_client, id_dmd, id_coursier, code_echange, id_status, code_echange_fourni)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($insert_sql);
            if (!$stmt) {
                throw new Exception("Prepare failed for INSERT: " . $conn->error);
            }
            $stmt->bind_param(
                "ssissiis",
                $cmd_id,
                $public_id,
                $best_supplier['id_fournisseur'],
                $hub['id_client'],
                $hub_id,
                $best_courier['id_coursier'],
                $exchange_code,
                $status_default,
                $exchange_code_fourni
            );
            if ($stmt->execute()) {
                $commands_created++;
                // Mark courier as busy
                $update_courier_sql = "UPDATE COURSIER SET est_occupe = 1 WHERE id_coursier = ?";
                $stmt_update = $conn->prepare($update_courier_sql);
                if (!$stmt_update) {
                    throw new Exception("Prepare failed for UPDATE COURSIER: " . $conn->error);
                }
                $stmt_update->bind_param("i", $best_courier['id_coursier']);
                $stmt_update->execute();
                $stmt_update->close();
                unset($available_couriers[$courier_index]);
                $available_couriers = array_values($available_couriers);
            } else {
                throw new Exception("Failed to insert command: " . $stmt->error);
            }
            $stmt->close();

            // Insert all products for this category into COMMANDE_PRODUIT
            foreach ($products as $prod) {
                $stmt_prod = $conn->prepare("INSERT INTO COMMANDE_PRODUIT(id_cmd, id_produit, nb_produit) VALUES (?, ?, ?)");
                if (!$stmt_prod) {
                    throw new Exception("Prepare failed for COMMANDE_PRODUIT: " . $conn->error);
                }
                $stmt_prod->bind_param("iii", $cmd_id, $prod['id_produit'], $prod['nb_produit']);
                if (!$stmt_prod->execute()) {
                    throw new Exception("Failed to insert into COMMANDE_PRODUIT: " . $stmt_prod->error);
                }
                $stmt_prod->close();
            }
        }
        // Mark HUB as processed
        $stmt = $conn->prepare("UPDATE HUB SET est_commande = 1 WHERE id_dmd = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed for UPDATE HUB: " . $conn->error);
        }
        $stmt->bind_param("s", $hub_id);
        $stmt->execute();
        $stmt->close();
        $processed_count++;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Traitement terminé avec succès",
        "hubs_processed" => $processed_count,
        "commands_created" => $commands_created
    ]);

} catch (Exception $e) {
    error_log("Erreur traitement HUB: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "Erreur : " . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
