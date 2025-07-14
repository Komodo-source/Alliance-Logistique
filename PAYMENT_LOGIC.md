# Logique de Paiement - Alliance Logistique

## Vue d'ensemble

Le système de paiement utilise l'API MTN Mobile Money (MoMo) pour traiter les paiements en Côte d'Ivoire. Le flux complet comprend l'initiation du paiement, la vérification du statut, et l'enregistrement de la confirmation.

## Architecture

### 1. Tables de base de données

#### Table `COMMANDE`
- `id_cmd`: Identifiant unique de la commande
- `est_paye`: Boolean indiquant si la commande est payée (TRUE/FALSE)
- `id_public_cmd`: Numéro public de la commande (bon de livraison)

#### Table `PAYEMENT`
- `id_payement`: Identifiant unique du paiement
- `externalId`: ID externe de la transaction MTN
- `id_cmd`: Référence vers la commande
- `amount`: Montant payé
- `momo_number`: Numéro de téléphone MoMo utilisé
- `date_payement`: Date et heure du paiement

### 2. Flux de paiement

#### Étape 1: Initiation du paiement (`payement.php`)
1. L'utilisateur saisit son numéro MoMo (format: 2250XXXXXXXX)
2. Le système génère un `externalId` unique
3. Appel à l'API MTN pour créer une demande de paiement
4. Retour du `referenceId` pour le suivi

#### Étape 2: Vérification du statut (`status.php`)
1. Le système attend 5 secondes pour laisser MTN traiter
2. Appel à l'API MTN pour vérifier le statut avec le `referenceId`
3. Retour du statut: `SUCCESSFUL`, `FAILED`, ou `PENDING`

#### Étape 3: Confirmation du paiement (`confirm_paying.php`)
1. Si le statut est `SUCCESSFUL`:
   - Insertion dans la table `PAYEMENT`
   - Mise à jour de `est_paye = TRUE` dans `COMMANDE`
   - Retour à la page précédente

### 3. Interface utilisateur

#### Page de détail de commande (`detail_Commande.js`)
- **Badge de statut de paiement**: Affiche "Payé" (vert) ou "Non payé" (orange)
- **Informations de paiement**: Montant, numéro MoMo, date (si payé)
- **Bouton de paiement**: Masqué si la commande est déjà payée
- **Message de confirmation**: "Commande payée" avec icône verte

#### Page de paiement (`payement.js`)
- **Validation du numéro**: Format 2250XXXXXXXX
- **Affichage du montant**: En FCFA
- **Indicateurs de sécurité**: SSL, cryptage, conformité bancaire
- **Gestion des états**: Loading, succès, erreur

## Corrections apportées

### 1. `confirm_paying.php`
- ✅ Correction de `bind_param`: 5 paramètres au lieu de 6
- ✅ Ajout de la mise à jour de `est_paye` dans `COMMANDE`
- ✅ Gestion correcte des types de données

### 2. `recup_commande_cli.php`
- ✅ Ajout de la jointure avec `PAYEMENT`
- ✅ Inclusion des informations de paiement dans la réponse
- ✅ Support des commandes avec et sans paiement

### 3. `payement.js`
- ✅ Correction de la récupération des paramètres
- ✅ Gestion correcte du montant (FCFA)
- ✅ Navigation automatique après paiement réussi

### 4. `detail_Commande.js`
- ✅ Ajout du badge de statut de paiement
- ✅ Section d'informations de paiement
- ✅ Masquage conditionnel du bouton de paiement
- ✅ Message de confirmation pour les commandes payées

## Tests

### Fichier de test: `test_payment.php`
Vérifie:
- Structure de la base de données
- Colonnes des tables
- Données existantes
- Requêtes de récupération

## Sécurité

### Validation des données
- Format du numéro de téléphone: `2250XXXXXXXX`
- Montant positif
- ID de commande valide

### API MTN
- Authentification par token
- Environnement sandbox pour les tests
- Gestion des erreurs HTTP

### Base de données
- Requêtes préparées (protection contre SQL injection)
- Types de données appropriés
- Contraintes de clés étrangères

## Points d'attention

### 1. Environnement de production
- Changer `sandbox` vers `live` dans `api.php`
- Vérifier les clés API de production
- Tester avec de vrais numéros MoMo

### 2. Gestion des erreurs
- Timeout des requêtes API
- Retry automatique en cas d'échec
- Logs détaillés pour le debugging

### 3. Performance
- Cache des tokens d'accès
- Optimisation des requêtes SQL
- Pagination pour les listes de commandes

## Utilisation

### Pour tester le système:
1. Créer une commande
2. Aller dans le détail de la commande
3. Cliquer sur "Payer la commande"
4. Saisir un numéro MoMo valide
5. Confirmer le paiement sur l'appareil MoMo
6. Vérifier que le statut change à "Payé"

### Pour vérifier les données:
```bash
curl https://backend-logistique-api-latest.onrender.com/test_payment.php
```

## Support

En cas de problème:
1. Vérifier les logs du serveur
2. Tester avec `test_payment.php`
3. Vérifier la connectivité avec l'API MTN
4. Contrôler les données en base 