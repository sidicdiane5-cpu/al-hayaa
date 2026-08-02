# Guide de Déploiement Complet - Dar Al Hayaa

## 📊 État actuel

✅ **Frontend** : Déployé sur Vercel
- URL : https://al-hayaa-1.vercel.app
- Variables Supabase configurées

⏳ **Backend** : À déployer sur Render
- Serveur Express avec Supabase
- Port : 3001

---

## 🚀 Déploiement du Backend sur Render

### Étape 1 : Créer un compte Render

1. Allez sur [https://render.com](https://render.com)
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec votre compte GitHub

### Étape 2 : Créer un nouveau Web Service

1. Cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"Web Service"**
3. Cliquez sur **"Connect GitHub"** si ce n'est pas déjà fait
4. Autorisez Render à accéder à votre compte GitHub
5. Dans la liste des dépôts, cherchez et sélectionnez : **`Sidicdiane5-CPU/al-hayaa`**

### Étape 3 : Configuration du service

Remplissez le formulaire comme suit :

**Basic Settings**
- **Name** : `al-hayaa-backend`
- **Region** : Choisissez la région la plus proche (ex: Frankfurt)
- **Branch** : `main`

**Build & Deploy**
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node server-supabase.cjs`

**Advanced**
- **Instance Type** : `Free` (pour commencer)

### Étape 4 : Variables d'environnement

Dans la section **"Environment Variables"**, ajoutez ces variables :

| Clé | Valeur |
|-----|--------|
| `SUPABASE_URL` | `https://qrfmmqeheblrfatlycqg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZm1tcWVoZWJscmZhdGx5Y3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY5ODI2NSwiZXhwIjoyMTAxMjc0MjY1fQ.LJCKQB-TozpaFP9LudkDpCiO5mibt4x6fN3i9_TPcQg` |
| `JWT_SECRET` | `Tfr0+qI7Z9GSx8z1Bwe0q479LZsR9BtEX4S+Se+paLh/71s591MGXi3sBXwk1u1TGOVkJCf2WeyPU1JBaDDwBA==` |
| `PORT` | `3001` |

⚠️ **Important** : Cliquez sur le bouton 🔒 pour marquer ces variables comme sensibles.

### Étape 5 : Déployer

1. Cliquez sur **"Create Web Service"** en bas de la page
2. Attendez que le déploiement se termine (environ 2-3 minutes)
3. Vous verrez une barre de progression et des logs

### Étape 6 : Récupérer l'URL du backend

Une fois le déploiement terminé :
1. Render vous affichera une URL comme : `https://al-hayaa-backend.onrender.com`
2. Copiez cette URL
3. Testez-la en ajoutant `/api/health` :
   - Exemple : `https://al-hayaa-backend.onrender.com/api/health`
   - Vous devriez voir : `{"status":"ok","database":"connected (supabase)"}`

---

## 🔗 Connecter le Frontend au Backend

Une fois que vous avez l'URL du backend Render, vous devez mettre à jour le frontend pour l'utiliser.

### Option 1 : Via les variables d'environnement Vercel

1. Allez sur votre projet Vercel : https://vercel.com/sidicdiane-5995s-projects/al-hayaa-1/settings
2. Cliquez sur **"Environment Variables"**
3. Ajoutez une nouvelle variable :
   - **Name** : `VITE_API_URL`
   - **Value** : `https://al-hayaa-backend.onrender.com` (remplacez par votre URL réelle)
4. Cliquez sur **"Save"**
5. Redéployez sur Vercel :
   ```bash
   vercel --prod
   ```

### Option 2 : Modifier le code (si nécessaire)

Si le frontend utilise des appels API directs, vous devrez peut-être modifier les fichiers qui font des requêtes au backend pour utiliser l'URL de production.

---

## 🧪 Tester le déploiement complet

### 1. Tester le backend
```bash
curl https://al-hayaa-backend.onrender.com/api/health
```

### 2. Tester le frontend
Ouvrez : https://al-hayaa-1.vercel.app

### 3. Tester l'authentification
- Essayez de vous connecter avec : `admin@daralhayaa.com` / `admin123`
- Vérifiez que la connexion fonctionne

---

## 📝 Résumé des URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://al-hayaa-1.vercel.app |
| Backend (Render) | https://al-hayaa-backend.onrender.com (après déploiement) |
| Base de données (Supabase) | https://qrfmmqeheblrfatlycqg.supabase.co |

---

## 🐛 Dépannage

### Le backend ne démarre pas sur Render
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que toutes les variables d'environnement sont correctes
- Vérifiez que le fichier `server-supabase.cjs` existe

### Le frontend ne se connecte pas au backend
- Vérifiez que l'URL du backend est correcte dans les variables Vercel
- Vérifiez les CORS dans le fichier `server-supabase.cjs`
- Testez l'URL du backend directement dans le navigateur

### Erreur de connexion Supabase
- Vérifiez que les clés Supabase sont correctes
- Assurez-vous que le projet Supabase est actif
- Vérifiez que les tables existent dans Supabase

---

## 💡 Prochaines étapes

1. ✅ Déployer le backend sur Render
2. ✅ Connecter le frontend au backend
3. ✅ Tester l'application complète
4. ✅ Configurer un domaine personnalisé (optionnel)
5. ✅ Mettre en place les backups automatiques (Supabase le fait déjà)

---

Besoin d'aide pour une étape spécifique ? Dites-moi laquelle !
