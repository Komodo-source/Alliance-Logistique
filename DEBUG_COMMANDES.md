# Guide de Débogage - Problème des Commandes

## Problème identifié
Aucune commande ne s'affiche dans la page d'accueil.

## Causes possibles et solutions

### 1. **Fichier auto.json incomplet**
**Problème** : Le fichier `assets/data/auto.json` ne contient pas toutes les informations nécessaires.

**Solution** : J'ai mis à jour le fichier avec des données complètes :
```json
{
    "type": "client", 
    "id": 1,
    "nom": "Test User",
    "email": "test@example.com",
    "telephone": "123456789"
}
```

### 2. **Base de données vide**
**Problème** : Aucune commande n'existe dans la base de données pour l'utilisateur.

**Solution** : 
1. Ouvrez `test_api_simple.html` dans votre navigateur
2. Cliquez sur "Insérer données de test" pour créer des commandes de test
3. Puis cliquez sur "Récupérer commandes" pour vérifier

### 3. **Erreurs dans l'API PHP**
**Problème** : L'API `recup_commande_cli.php` ne gère pas bien les erreurs.

**Solution** : J'ai amélioré le fichier avec :
- Gestion des erreurs CORS
- Validation des paramètres
- Logs de débogage
- Gestion des cas d'erreur

### 4. **Problèmes dans le code React Native**
**Problème** : La fonction `fetch_commande()` dans `Accueil.js` a des problèmes de gestion d'erreurs.

**Solution** : J'ai refactorisé la fonction pour :
- Mieux gérer les erreurs
- Ajouter plus de logs
- Améliorer la validation des données

## Étapes de débogage

### Étape 1 : Vérifier les données utilisateur
```javascript
// Dans la console de votre app
const userData = await FileManager.read_file("auto.json");
console.log("Données utilisateur:", userData);
```

### Étape 2 : Tester l'API directement
1. Ouvrez `test_api_simple.html`
2. Testez l'insertion de données
3. Testez la récupération de commandes

### Étape 3 : Vérifier les logs
Regardez la console de votre app pour voir :
- Les logs de `fetch_commande()`
- Les erreurs éventuelles
- Les données reçues

### Étape 4 : Vérifier la base de données
Si vous avez accès à la base de données, vérifiez :
```sql
SELECT * FROM CLIENT WHERE id_client = 1;
SELECT * FROM COMMANDE WHERE id_client = 1;
SELECT * FROM HUB WHERE id_dmd IN (SELECT id_dmd FROM COMMANDE WHERE id_client = 1);
```

## Fichiers modifiés

1. **`screens/Accueil.js`** : Amélioration de `fetch_commande()`
2. **`backend/public/recup_commande_cli.php`** : Ajout de gestion d'erreurs
3. **`assets/data/auto.json`** : Données utilisateur complètes
4. **`backend/public/test_insert_data.php`** : Script d'insertion de données de test
5. **`test_api_simple.html`** : Interface de test

## Tests à effectuer

1. **Test local** : Vérifiez que `auto.json` est bien lu
2. **Test API** : Utilisez `test_api_simple.html`
3. **Test intégration** : Relancez l'app et vérifiez les logs

## Logs à surveiller

Dans la console de votre app, vous devriez voir :
```
=== ACCUEIL: useEffect déclenché ===
User data from auto.json: {type: "client", id: 1, ...}
id_client : 1
Server response: [...]
Parsed data: [...]
Limited data for display: [...]
=== ACCUEIL: Mise à jour nb_commande_livraison ===
Commandes actuelles: [...]
```

Si vous ne voyez pas ces logs ou s'il y a des erreurs, le problème est identifié. 