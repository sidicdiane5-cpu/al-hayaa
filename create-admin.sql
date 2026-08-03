-- Script pour créer l'utilisateur admin dans Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ÉTAPE 1 : Modifier la table users pour rendre password nullable
-- (exécutez d'abord cette commande)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- ÉTAPE 2 : Créer l'utilisateur admin
-- Remplacez 'USER_ID_FROM_AUTH' par l'UUID de l'utilisateur créé dans Authentication

INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_AUTH',  -- Remplacez ceci par l'UUID de l'utilisateur auth
  'admin@daralhayaa.com',
  'Admin',
  'Dar Al Hayaa',
  '+225 05 03 74 43 36',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- ÉTAPE 3 : Vérifier que l'utilisateur admin a été créé
SELECT * FROM users WHERE email = 'admin@daralhayaa.com';
