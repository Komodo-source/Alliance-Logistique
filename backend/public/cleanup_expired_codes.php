<?php
// This script should be run periodically (e.g., via cron job) to clean up expired codes
include_once('lib/db_connection.php');

try {
    // Delete codes older than 24 hours
    // Since there's no timestamp in the TEMP_CODE_RESET_PSSWD table,
    // we'll need to add one or implement another cleanup strategy
    
    // For now, we'll just delete all codes that are older than a certain ID
    // This is a temporary solution until a proper timestamp field is added
    
    // Get the current maximum ID
    $max_id_query = $conn->query("SELECT MAX(id_code) as max_id FROM TEMP_CODE_RESET_PSSWD");
    $max_id_result = $max_id_query->fetch_assoc();
    $max_id = $max_id_result['max_id'];
    
    // Delete codes that are likely old (assuming IDs are assigned sequentially)
    // This is just an example - a better approach would be to add a timestamp column
    if ($max_id > 1000) { // Arbitrary threshold
        $threshold_id = $max_id - 1000;
        $stmt = $conn->prepare("DELETE FROM TEMP_CODE_RESET_PSSWD WHERE id_code < ?");
        $stmt->bind_param("i", $threshold_id);
        $stmt->execute();
        
        $affected_rows = $stmt->affected_rows;
        echo "Cleaned up $affected_rows expired code(s).\n";
    } else {
        echo "No cleanup needed at this time.\n";
    }
    
} catch (Exception $e) {
    echo "Error during cleanup: " . $e->getMessage() . "\n";
}
?>