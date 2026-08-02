# Dar Al Hayaa - Guide Base de Données Complète

## 📦 Architecture

Votre projet e-commerce dispose maintenant d'une base de données complète et fonctionnelle avec toutes les fonctionnalités demandées.

### Backend (API Express + LowDB)
- **Fichier**: `server.cjs`
- **Port**: 3001
- **Base de données**: `db.json` (LowDB - fichier JSON)
- **API REST**: Disponible sur `http://localhost:3001/api`

### Frontend (React + Vite)
- **Port**: 5173
- **Framework**: React 19 avec Vite
- **State Management**: Zustand

## 🚀 Démarrage

### 1. Démarrer le serveur backend
```bash
npm run server
```

Le serveur démarrera sur `http://localhost:3001`

### 2. Démarrer le frontend
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### 3. Démarrer les deux simultanément
```bash
npm run dev:all
```

## 📊 Structure de la Base de Données

La base de données `db.json` contient maintenant **11 tables** complètes :

### ✅ Produits
- id, name, category, subcategory, price, original_price, discount, rating, reviews, stock, is_new, is_bestseller, colors, sizes, images, description, featured, tags

### ✅ Catégories
- id, name, name_ar, icon, description, count, color, image, subcategories

### ✅ Commandes
- id, user_id, status, total, subtotal, shipping, discount, coupon_code, payment_method, shipping_address, phone, email, tracking_number, created_at, updated_at

### ✅ Détails des commandes
- id, order_id, product_id, quantity, price, color, size, created_at

### ✅ Panier
- Géré via Zustand avec localStorage (intégration API pour les commandes)

### ✅ Favoris
- id, user_id, product_id, created_at

### ✅ Avis
- id, user_id, product_id, rating, comment, verified, created_at

### ✅ Paiements
- id, order_id, method, amount, status, transaction_id, phone, created_at

### ✅ Adresses
- id, user_id, type, firstName, lastName, address, postalCode, city, country, phone, isDefault, created_at

### ✅ Notifications
- id, user_id, type, title, message, link, read, created_at

### ✅ Coupons
- code, discount, min_purchase, max_uses, uses_count, expires_at, is_active

### ✅ Users
- id, name, email, password, role, avatar, addresses, created_at

## 🔌 API Endpoints Complète

### Health Check
- `GET /api/health` - Vérifier que le serveur fonctionne

### Categories
- `GET /api/categories` - Récupérer toutes les catégories
- `POST /api/categories` - Créer une catégorie

### Products
- `GET /api/products` - Récupérer tous les produits (avec filtres: category, search, limit)
- `GET /api/products/:id` - Récupérer un produit par ID
- `POST /api/products` - Créer un produit

### Orders
- `POST /api/orders` - Créer une nouvelle commande
- `GET /api/orders/:id` - Récupérer une commande par ID
- `GET /api/orders/tracking/:trackingId` - Suivre une commande

### Order Tracking
- `GET /api/orders/tracking/:trackingId` - Suivre une commande en temps réel

### Coupons
- `POST /api/coupons/validate` - Valider un code promo

### **NOUVEAU - Favoris**
- `GET /api/favorites/:userId` - Récupérer les favoris d'un utilisateur
- `POST /api/favorites` - Ajouter un produit aux favoris
- `DELETE /api/favorites/:id` - Supprimer un favori

### **NOUVEAU - Avis**
- `GET /api/reviews/product/:productId` - Récupérer les avis d'un produit
- `GET /api/reviews/user/:userId` - Récupérer les avis d'un utilisateur
- `POST /api/reviews` - Ajouter un avis

### **NOUVEAU - Adresses**
- `GET /api/addresses/:userId` - Récupérer les adresses d'un utilisateur
- `POST /api/addresses` - Ajouter une adresse
- `PUT /api/addresses/:id` - Modifier une adresse
- `DELETE /api/addresses/:id` - Supprimer une adresse

### **NOUVEAU - Notifications**
- `GET /api/notifications/:userId` - Récupérer les notifications d'un utilisateur
- `POST /api/notifications` - Créer une notification
- `PUT /api/notifications/:id/read` - Marquer une notification comme lue

### **NOUVEAU - Paiements**
- `POST /api/payments` - Créer un paiement
- `GET /api/payments/order/:orderId` - Récupérer les paiements d'une commande
- `PUT /api/payments/:id` - Mettre à jour un paiement

### Seed Data
- `POST /api/seed` - Initialiser les catégories et coupons
- `POST /api/seed-products` - Initialiser les produits

## 📝 Fonctionnalités Implémentées

### ✅ Pages Légales Améliorées
- **Politique de Confidentialité** (`/confidentialite`) - Informations complètes RGPD
- **Conditions Générales de Vente** (`/cgv`) - 14 sections détaillées
- **Politique de Livraison** (`/livraison`) - Zones, délais, frais, modes de livraison

### ✅ Suivi de Commande
- Page de suivi (`/suivi-commande`) connectée à la base de données
- Recherche par numéro de commande ou numéro de tracking
- Affichage en temps réel des étapes de livraison
- Intégration automatique depuis la page de paiement

### ✅ Système de Paiement
- Simulation de paiements mobiles (Orange Money, MTN Money, Wave)
- Enregistrement des transactions dans la base de données
- Numéro de transaction unique pour chaque paiement
- Intégration avec les commandes

### ✅ Favoris Intégrés
- Synchronisation avec la base de données
- Support pour utilisateurs connectés et invités
- API complète pour la gestion des favoris
- Fallback localStorage si API indisponible

### ✅ Avis Clients
- Système d'avis connecté à la base de données
- Ajout d'avis avec notes et commentaires
- Chargement des avis depuis la base de données
- Fallback aux avis mock si API indisponible

### ✅ Adresses
- Gestion des adresses de livraison et facturation
- Support pour plusieurs adresses par utilisateur
- Adresse par défaut
- CRUD complet via API

### ✅ Notifications
- Système de notifications utilisateur
- Types différents (commande, livraison, promo)
- Statut lu/non-lu
- Liens vers les pages concernées

## 🎯 Comment Tester

### 1. Tester une commande complète
1. Ajoutez des produits au panier
2. Allez à la page de paiement
3. Remplissez les informations de livraison
4. Sélectionnez un moyen de paiement (Orange Money, MTN Money, Wave)
5. Validez le paiement
6. Notez le numéro de commande et le numéro de tracking
7. Suivez la commande sur la page de suivi

### 2. Tester les favoris
1. Cliquez sur le cœur sur un produit
2. Vérifiez qu'il s'ajoute aux favoris
3. Allez sur la page des favoris
4. Testez la suppression

### 3. Tester les avis
1. Allez sur une page produit
2. Scrollez vers la section avis
3. Ajoutez un avis avec une note et un commentaire
4. Vérifiez qu'il s'affiche immédiatement

### 4. Tester les coupons
- Utilisez les codes: `NOUR10` (-10%), `RAMADAN20` (-20%), `BIENVENUE15` (-15%)

### 5. Tester le paiement
1. Simulez un paiement Orange Money
2. Vérifiez qu'un enregistrement de paiement est créé
3. Vérifiez que la commande est liée au paiement

## 🔧 Maintenance

### Réinitialiser la base de données
```bash
# Supprimer le fichier db.json
Remove-Item db.json

# Relancer le serveur
npm run server

# Réinitialiser les données
node seed.cjs
```

### Ajouter de nouveaux produits
Modifiez `src/data/products.js` puis:
```bash
node seed.cjs
```

### Vérifier la base de données
```bash
# Ouvrir le fichier db.json
# ou utiliser curl pour vérifier les API
curl http://localhost:3001/api/health
```

## 📞 Support

Pour toute question sur l'intégration de la base de données, consultez les fichiers:
- `server.cjs` - Backend API complet
- `src/store/cartStore.js` - Store panier avec intégration API
- `src/store/wishlistStore.js` - Store favoris avec intégration API
- `src/pages/Checkout.jsx` - Page de paiement avec création de commande
- `src/pages/ProductDetail.jsx` - Page produit avec avis
- `src/pages/Pages.jsx` - Pages légales et suivi de commande

## 🎉 Résumé

Votre projet dispose maintenant d'une base de données complète avec:
- ✅ **Produits** - Gestion complète
- ✅ **Catégories** - 5 catégories principales
- ✅ **Commandes** - Création et suivi
- ✅ **Détails commandes** - Articles et quantités
- ✅ **Panier** - Gestion avant commande
- ✅ **Favoris** - Synchronisation base de données
- ✅ **Avis** - Système de commentaires
- ✅ **Paiements** - Simulation mobile money
- ✅ **Adresses** - Gestion multi-adresses
- ✅ **Notifications** - Système d'alertes
- ✅ **Coupons** - Codes promotionnels

Le système de paiement fonctionne via simulation des opérateurs mobiles (Orange Money, MTN Money, Wave) avec enregistrement des transactions dans la base de données.
