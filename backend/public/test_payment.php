<?php
header('Content-Type: application/json');
include_once('db.php');

// Test de la logique de paiement
echo "=== TEST DE LA LOGIQUE DE PAIEMENT ===\n\n";

// 1. Vérifier la structure de la base de données
echo "1. Vérification de la structure de la base de données:\n";

$tables = ['COMMANDE', 'PAYEMENT', 'HUB', 'CLIENT'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "✓ Table $table existe\n";
    } else {
        echo "✗ Table $table n'existe pas\n";
    }
}

// 2. Vérifier les colonnes de la table COMMANDE
echo "\n2. Vérification des colonnes de COMMANDE:\n";
$result = $conn->query("DESCRIBE COMMANDE");
while ($row = $result->fetch_assoc()) {
    echo "- {$row['Field']}: {$row['Type']}\n";
}

// 3. Vérifier les colonnes de la table PAYEMENT
echo "\n3. Vérification des colonnes de PAYEMENT:\n";
$result = $conn->query("DESCRIBE PAYEMENT");
while ($row = $result->fetch_assoc()) {
    echo "- {$row['Field']}: {$row['Type']}\n";
}

// 4. Vérifier les commandes existantes
echo "\n4. Commandes existantes:\n";
$result = $conn->query("SELECT id_cmd, id_public_cmd, est_paye FROM COMMANDE LIMIT 5");
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "- Commande {$row['id_cmd']} ({$row['id_public_cmd']}): " . ($row['est_paye'] ? 'Payée' : 'Non payée') . "\n";
    }
} else {
    echo "Aucune commande trouvée\n";
}

// 5. Vérifier les paiements existants
echo "\n5. Paiements existants:\n";
$result = $conn->query("SELECT id_payement, id_cmd, amount, momo_number, date_payement FROM PAYEMENT LIMIT 5");
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "- Paiement {$row['id_payement']} pour commande {$row['id_cmd']}: {$row['amount']} FCFA via {$row['momo_number']} le {$row['date_payement']}\n";
    }
} else {
    echo "Aucun paiement trouvé\n";
}

// 6. Test de la requête de récupération des commandes
echo "\n6. Test de la requête de récupération des commandes:\n";
$test_client_id = 1; // ID du client admin
$stmt = $conn->prepare("
SELECT 
    HUB.*,
    COMMANDE.id_cmd,
    COMMANDE.id_public_cmd,
    COMMANDE.id_fournisseur,
    COMMANDE.id_coursier,
    COMMANDE.code_echange,
    COMMANDE.id_status,
    COMMANDE.est_paye,
    PAYEMENT.amount as montant_paye,
    PAYEMENT.date_payement,
    PAYEMENT.momo_number
FROM COMMANDE 
INNER JOIN HUB ON HUB.id_dmd = COMMANDE.id_dmd        
LEFT JOIN PAYEMENT ON PAYEMENT.id_cmd = COMMANDE.id_cmd
WHERE COMMANDE.id_client = ?
");

$stmt->bind_param("i", $test_client_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "- Commande {$row['id_cmd']} ({$row['id_public_cmd']}): " . 
             ($row['est_paye'] ? 'Payée' : 'Non payée') . 
             ($row['montant_paye'] ? " - {$row['montant_paye']} FCFA" : "") . "\n";
    }
} else {
    echo "Aucune commande trouvée pour ce client\n";
}

$conn->close();
echo "\n=== FIN DU TEST ===\n";
?> 