// Test de la fonction getDaysDifference
function getDaysDifference(dateString) {
  try {
    // Créer les dates en ignorant l'heure pour une comparaison juste des jours
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Parser la date de livraison
    let targetDate;
    if (dateString.includes('T')) {
      targetDate = new Date(dateString);
    } else {
      // Si la date est au format "YYYY-MM-DD HH:MM:SS"
      targetDate = new Date(dateString.replace(' ', 'T'));
    }
    
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    // Calculer la différence en millisecondes
    const diffTime = target.getTime() - today.getTime();
    
    // Convertir en jours (division par millisecondes dans une journée)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Erreur dans getDaysDifference:', error, 'dateString:', dateString);
    return 0;
  }
}

// Tests avec différentes dates
const testDates = [
  '2025-01-15 18:30:00',  // Date future
  '2025-01-10 18:30:00',  // Date passée
  '2025-01-12 18:30:00',  // Date aujourd'hui (à ajuster selon la date actuelle)
  '2025-01-13 18:30:00',  // Date demain
  '2025-01-11 18:30:00',  // Date hier
];

console.log('=== TEST DE CALCUL DES JOURS ===');
console.log('Date actuelle:', new Date().toLocaleDateString('fr-FR'));

testDates.forEach(dateString => {
  const daysDiff = getDaysDifference(dateString);
  const parsedDate = new Date(dateString);
  
  console.log(`\nDate: ${dateString}`);
  console.log(`Date parsée: ${parsedDate.toLocaleDateString('fr-FR')}`);
  console.log(`Différence en jours: ${daysDiff}`);
  
  if (daysDiff > 0) {
    console.log(`Résultat: ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`);
  } else if (daysDiff === 0) {
    console.log('Résultat: Livraison aujourd\'hui');
  } else {
    console.log('Résultat: Livraison dépassée');
  }
});

// Test avec des formats de date différents
console.log('\n=== TEST AVEC DIFFÉRENTS FORMATS ===');

const formatTests = [
  '2025-01-15 18:30:00',
  '2025-01-15T18:30:00',
  '2025-01-15',
  '2025-01-15 00:00:00'
];

formatTests.forEach(dateString => {
  const daysDiff = getDaysDifference(dateString);
  console.log(`${dateString} -> ${daysDiff} jours`);
}); 