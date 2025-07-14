// Script de test pour déboguer le problème des commandes
import * as FileManager from './screens/util/file-manager.js';

const testCommandeFetch = async () => {
  console.log('=== TEST DE RÉCUPÉRATION DES COMMANDES ===');
  
  try {
    // 1. Test de lecture du fichier auto.json
    console.log('\n1. Lecture du fichier auto.json...');
    const userData = await FileManager.read_file("auto.json");
    console.log('Données utilisateur:', userData);
    
    if (!userData || !userData.id) {
      console.error('❌ ERREUR: Pas d\'ID utilisateur trouvé dans auto.json');
      return;
    }
    
    // 2. Test de la requête API
    console.log('\n2. Test de la requête API...');
    const id_client = userData.id;
    console.log('ID client utilisé:', id_client);
    
    const response = await fetch('https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id_client})
    });
    
    console.log('Status de la réponse:', response.status);
    console.log('Headers de la réponse:', response.headers);
    
    const responseText = await response.text();
    console.log('Réponse brute du serveur:', responseText);
    
    // 3. Test du parsing JSON
    console.log('\n3. Test du parsing JSON...');
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      console.log('Données parsées:', parsedData);
      console.log('Type de données:', typeof parsedData);
      console.log('Longueur du tableau:', Array.isArray(parsedData) ? parsedData.length : 'Pas un tableau');
    } catch (parseError) {
      console.error('❌ ERREUR de parsing JSON:', parseError);
      return;
    }
    
    // 4. Analyse des données
    console.log('\n4. Analyse des données...');
    if (Array.isArray(parsedData)) {
      if (parsedData.length === 0) {
        console.log('⚠️  Aucune commande trouvée pour cet utilisateur');
        console.log('Cela peut signifier:');
        console.log('- L\'utilisateur n\'a pas encore créé de commandes');
        console.log('- Problème dans la base de données');
        console.log('- Problème avec l\'ID utilisateur');
      } else {
        console.log(`✅ ${parsedData.length} commande(s) trouvée(s)`);
        parsedData.forEach((commande, index) => {
          console.log(`\nCommande ${index + 1}:`);
          console.log('- ID:', commande.id_cmd);
          console.log('- Nom:', commande.nom_dmd);
          console.log('- Status:', commande.id_status);
          console.log('- Date fin:', commande.date_fin);
        });
      }
    } else {
      console.error('❌ ERREUR: La réponse n\'est pas un tableau');
    }
    
  } catch (error) {
    console.error('❌ ERREUR générale:', error);
  }
};

// Exécuter le test
testCommandeFetch(); 