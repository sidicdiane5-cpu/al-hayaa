-- Script pour créer l'utilisateur admin dans Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. D'abord, créer l'utilisateur dans l'auth Supabase
-- Vous devez le faire manuellement via le dashboard Supabase :
-- - Allez dans Authentication > Users
-- - Cliquez sur "Add user"
-- - Email: admin@daralhayaa.com
-- - Mot de passe: admin123
-- - Cochez "Auto Confirm User"
-- - Cliquez sur "Create User"

-- 2. Ensuite, exécutez ce SQL pour créer le profil admin dans la table users
-- Remplacez 'USER_ID_FROM_AUTH' par l'ID de l'utilisateur créé dans l'étape 1

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

-- 3. Vérifier que l'utilisateur admin a été créé
SELECT * FROM users WHERE email = 'admin@daralhayaa.com';
