# Migration vers Supabase - Guide Complet

## 📋 Résumé de la migration

Le projet a été migré de **LowDB** (base de données JSON locale) vers **Supabase** (base de données PostgreSQL cloud).

### Fichiers modifiés/créés :
- ✅ `server-supabase.cjs` - Nouveau serveur avec Supabase
- ✅ `supabase-schema.sql` - Script SQL pour créer les tables
- ✅ `.env` - Variables d'environnement (à configurer)
- ✅ `.env.example` - Template des variables
- ✅ `package.json` - Mis à jour pour utiliser le nouveau serveur

## 🚀 Étapes pour terminer la migration

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectEZ-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name**: daralhayaa (ou votre choix)
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche (ex: Europe West)
5. Attendez que le projet soit créé (2-3 minutes)

### 2. Exécuter le script SQL

1. Dans votre dashboard Supabase, allez dans **SQL Editor**
2. Cliquez sur "New Query"
3. Copiez le contenu du fichier `supabase-schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur "Run" pour exécuter le script
6. Vérifiez que toutes les tables sont créées dans **Table Editor**

### 3. Récupérer les clés Supabase

1. Dans votre dashboard Supabase, allez dans **Settings > API**
2. Copiez les valeurs suivantes :
   - **Project URL** (ex: https://xyz.supabase.co)
   - **service_role** (secret key, PAS anon key)

### 4. Configurer le fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplacez les valeurs :

```env
# Remplacez par vos vraies valeurs Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (changez en production)
JWT_SECRET=votre-secret-key-ici

# Port du serveur
PORT=3001
```

### 5. Initialiser les données

Une fois le serveur démarré, exécutez cette commande pour peupler la base de données :

```bash
curl -X POST http://localhost:3001/api/seed
```

Cela créera :
- ✅ Utilisateur admin (`admin@daralhayaa.com` / `admin123`)
- ✅ 5 catégories (Femmes, Hommes, Beauté, Électronique, Accessoires)
- ✅ 3 coupons promo (NOUR10, RAMADAN20, BIENVENUE15)

### 6. Démarrer le serveur

```bash
npm run server
```

Le serveur démarrera sur `http://localhost:3001` avec Supabase.

## 🔙 Revenir à LowDB (si nécessaire)

Si vous voulez revenir à l'ancienne version avec LowDB :

```bash
npm run server:lowdb
```

## 📊 Structure des tables Supabase

Le schéma inclut 12 tables :
- `users` - Utilisateurs
- `categories` - Catégories de produits
- `products` - Produits
- `orders` - Commandes
- `order_items` - Détails des commandes
- `order_tracking` - Suivi des commandes
- `coupons` - Codes promotionnels
- `favorites` - Favoris
- `reviews` - Avis clients
- `addresses` - Adresses de livraison
- `notifications` - Notifications
- `payments` - Paiements

## 🧪 Tester la connexion

Vérifiez que la connexion fonctionne :

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "database": "connected (supabase)"
}
```

## ⚠️ Notes importantes

- **Service Role Key**: Utilisez toujours la `service_role` key pour le backend (pas la `anon` key)
- **Sécurité**: Ne commitez jamais le fichier `.env` avec vos vraies clés
- **Production**: Changez le `JWT_SECRET` en production
- **Backup**: Supabase a des backups automatiques, mais faites régulièrement des exports

## 🐛 Dépannage

### Erreur "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis"
- Vérifiez que le fichier `.env` existe et contient les bonnes valeurs
- Redémarrez le serveur après avoir modifié le fichier `.env`

### Erreur de connexion à Supabase
- Vérifiez que votre URL Supabase est correcte
- Vérifiez que la service_role key est valide
- Vérifiez que votre projet Supabase est actif

### Tables non trouvées
- Exécutez le script `supabase-schema.sql` dans le SQL Editor
- Vérifiez que toutes les tables sont créées dans le Table Editor

## 📞 Support

Pour toute question sur la migration :
1. Vérifiez les logs du serveur
2. Consultez la documentation Supabase : https://supabase.com/docs
3. Vérifiez le SQL Editor pour les erreurs de création de tables
