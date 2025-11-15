    <?php
    include_once('db.php');

    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['id_produit'])) {
        echo json_encode(["error" => "Missing id_produit"]);
        exit;
    }

    $id_produit = $input['id_produit'];

    $sql = "SELECT
    F.id_fournisseur,
    ROUND(AVG(FR.prix_produit) * 1.20) AS prix_produit,
    COUNT(*) AS nb_produit_fourni,
    O.nom_orga,
    O.ville_organisation,
    O.localisation_orga
    FROM FOURNISSEUR F
    INNER JOIN FOURNIR FR
        ON F.id_fournisseur = FR.id_fournisseur
    LEFT JOIN ORGANISATION O
        ON O.id_orga = F.id_orga
    WHERE FR.id_produit = ?
    GROUP BY
        F.id_fournisseur,
        O.nom_orga,
        O.ville_organisation,
        O.localisation_orga
    ORDER BY prix_produit ASC;";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id_produit);
    $stmt->execute();

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);

    $stmt->close();
    $conn->close();
    ?>
