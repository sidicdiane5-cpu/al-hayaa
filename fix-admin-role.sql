-- Script pour vérifier et corriger le rôle de l'utilisateur admin
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ÉTAPE 1 : Vérifier l'utilisateur admin existant
SELECT * FROM users WHERE email = 'admin@daralhayaa.com';

-- ÉTAPE 2 : Si l'utilisateur existe mais n'a pas le rôle admin, mettre à jour
-- Exécutez cette commande si le rôle n'est pas 'admin'
UPDATE users 
SET role = 'admin', 
    is_active = true,
    updated_at = NOW()
WHERE email = 'admin@daralhayaa.com';

-- ÉTAPE 3 : Vérifier à nouveau après la mise à jour
SELECT * FROM users WHERE email = 'admin@daralhayaa.com';

-- ÉTAPE 4 : Si l'utilisateur n'existe pas dans la table users, l'insérer
-- D'abord, récupérez l'UUID de l'utilisateur depuis Authentication
-- Ensuite, exécutez cette commande en remplaçant USER_ID par l'UUID réel
-- INSERT INTO users (id, email, first_name, last_name, phone, role, is_active, created_at, updated_at)
-- VALUES ('USER_ID', 'admin@daralhayaa.com', 'Admin', 'Dar Al Hayaa', '+225 05 03 74 43 36', 'admin', true, NOW(), NOW());
