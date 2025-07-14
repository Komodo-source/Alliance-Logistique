# Correction du Calcul des Dates - Accueil.js

## Problème identifié

Le problème venait de la fonction `getDaysDifference` qui utilisait `Math.ceil()` au lieu de `Math.floor()` et ne gérait pas correctement la comparaison des dates en ignorant l'heure.

### Problèmes spécifiques :

1. **Utilisation de `Math.ceil()`** : Cette fonction arrondit vers le haut, ce qui peut causer des erreurs de calcul
2. **Comparaison avec l'heure** : Les dates étaient comparées avec l'heure incluse, causant des erreurs
3. **Gestion des formats de date** : Pas de gestion robuste des différents formats de date

## Corrections apportées

### 1. Nouvelle fonction `getDaysDifference`

```javascript
const getDaysDifference = (dateString) => {
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
};
```

### 2. Améliorations apportées

- **`Math.floor()` au lieu de `Math.ceil()`** : Calcul plus précis
- **Ignorer l'heure** : Comparaison uniquement des dates (jour/mois/année)
- **Gestion d'erreurs** : Try/catch pour éviter les crashes
- **Support de formats multiples** : Gestion des dates avec et sans 'T'

### 3. Fonction utilitaire `formatDeliveryDate`

```javascript
const formatDeliveryDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  } catch (error) {
    console.error('Erreur formatage date:', error, 'dateString:', dateString);
    return 'Date invalide';
  }
};
```

### 4. Amélioration de l'affichage

- **Pluriel conditionnel** : "1 jour" vs "2 jours"
- **Couleurs adaptatives** : Vert pour futur, orange pour aujourd'hui, rouge pour dépassé
- **Messages cohérents** : "Livraison dépassée" au lieu de "Livraison dépassé"

## Tests

### Fichier de test : `test_date_calculation.js`

Ce fichier permet de tester la fonction avec différentes dates :
- Dates futures
- Dates passées  
- Date d'aujourd'hui
- Différents formats de date

### Exécution du test :

```bash
node test_date_calculation.js
```

## Résultats attendus

### Avant la correction :
- ❌ "Livraison aujourd'hui" pour des dates futures
- ❌ Calculs incorrects à cause de l'heure
- ❌ Arrondis incorrects avec `Math.ceil()`

### Après la correction :
- ✅ Calcul précis des jours restants
- ✅ Affichage correct selon la date réelle
- ✅ Gestion robuste des erreurs
- ✅ Support de différents formats de date

## Cas d'usage

### Exemple 1 : Livraison dans 3 jours
- Date actuelle : 12/01/2025
- Date livraison : 15/01/2025 18:30:00
- Résultat : "3 jours"

### Exemple 2 : Livraison aujourd'hui
- Date actuelle : 15/01/2025
- Date livraison : 15/01/2025 18:30:00
- Résultat : "Livraison aujourd'hui"

### Exemple 3 : Livraison dépassée
- Date actuelle : 16/01/2025
- Date livraison : 15/01/2025 18:30:00
- Résultat : "Livraison dépassée"

## Maintenance

### Pour ajouter de nouveaux formats de date :

1. Modifier la condition dans `getDaysDifference`
2. Ajouter le nouveau format dans les tests
3. Vérifier le comportement avec `test_date_calculation.js`

### Pour déboguer :

1. Activer temporairement la fonction `debugDate`
2. Vérifier les logs dans la console
3. Comparer avec les résultats attendus 