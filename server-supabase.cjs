require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    res.json({ status: 'ok', database: 'connected (supabase)' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware de vérification des rôles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Non authentifié' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Permission refusée' });
    }
    next();
  };
};

// ── AUTHENTIFICATION ──

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Tous les champs sont requis' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Les mots de passe ne correspondent pas' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Cette adresse email est déjà utilisée' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Créer l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: 'client',
        is_active: false,
        email_verified: false
      })
      .select()
      .single();

    if (error) throw error;

    // Créer une notification de bienvenue
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'welcome',
      title: 'Bienvenue !',
      message: 'Votre compte a été créé avec succès. Veuillez vérifier votre email pour activer votre compte.'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création du compte' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Compte non activé. Veuillez vérifier votre email.' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
    }

    // Créer le token JWT
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Mettre à jour la dernière connexion
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
  }
});

// Déconnexion
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  res.json({ success: true, message: 'Déconnexion réussie' });
});

// Vérifier le token
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du profil' });
  }
});

// Réinitialisation du mot de passe - Demande
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requis' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      return res.json({ success: true, message: 'Si cet email existe, vous recevrez un lien de réinitialisation.' });
    }

    // Créer un token de réinitialisation
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Stocker le token (utiliser une table reset_tokens ou ajouter à users)
    await supabase
      .from('users')
      .update({ 
        reset_token: resetToken,
        reset_token_expiry: new Date(Date.now() + 3600000).toISOString()
      })
      .eq('id', user.id);

    // Créer une notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'password_reset',
      title: 'Réinitialisation du mot de passe',
      message: 'Une demande de réinitialisation de mot de passe a été effectuée.'
    });

    res.json({ success: true, message: 'Si cet email existe, vous recevrez un lien de réinitialisation.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la demande de réinitialisation' });
  }
});

// Réinitialisation du mot de passe - Confirmation
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Tous les champs sont requis' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Les mots de passe ne correspondent pas' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (!user || user.reset_token !== token || new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ success: false, error: 'Token invalide ou expiré' });
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id);

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// Changer le mot de passe (utilisateur connecté)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Tous les champs sont requis' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Les mots de passe ne correspondent pas' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du mot de passe' });
  }
});

// ── UTILISATEURS (Gestion du profil) ──

// Obtenir le profil utilisateur
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // L'utilisateur ne peut voir que son propre profil sauf admin
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du profil' });
  }
});

// Mettre à jour le profil utilisateur
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // L'utilisateur ne peut modifier que son propre profil sauf admin
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone) updateData.phone = phone;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du profil' });
  }
});

// ── ADMIN - GESTION DES UTILISATEURS ──

// Obtenir tous les utilisateurs (admin uniquement)
app.get('/api/admin/users', authenticateToken, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedUsers = users.map(u => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.is_active,
      emailVerified: u.email_verified,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at
    }));

    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Modifier le rôle d'un utilisateur (admin uniquement)
app.put('/api/admin/users/:id/role', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    if (!['client', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Rôle invalide' });
    }

    // Empêcher de modifier son propre rôle
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' });
    }

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Rôle modifié avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du rôle' });
  }
});

// Bloquer/Débloquer un utilisateur (admin uniquement)
app.put('/api/admin/users/:id/status', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Empêcher de se bloquer soi-même
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas vous bloquer vous-même' });
    }

    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: isActive ? 'Utilisateur activé' : 'Utilisateur bloqué' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du statut' });
  }
});

// Supprimer un utilisateur (admin uniquement)
app.delete('/api/admin/users/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Empêcher de se supprimer soi-même
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// ── CATÉGORIES ──

app.get('/api/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;
    res.json(categories || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des catégories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, id: category.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la catégorie' });
  }
});

// ── PRODUITS ──

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    
    let query = supabase.from('products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: products, error } = await query;
    
    if (error) throw error;
    res.json(products || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des produits' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du produit' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, id: product.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création du produit' });
  }
});

// ── COMMANDES ──

app.post('/api/orders', async (req, res) => {
  try {
    const { user_id, items, total, subtotal, shipping, discount, coupon_code, payment_method, shipping_address, phone, email } = req.body;
    const order_id = `ORD-${Date.now()}`;
    const tracking_number = `TRK-${Date.now().toString(36).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: order_id,
        user_id: user_id || null,
        status: 'pending',
        total,
        subtotal,
        shipping,
        discount: discount || 0,
        coupon_code: coupon_code || null,
        payment_method,
        shipping_address,
        phone,
        email,
        tracking_number
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    for (const item of items) {
      await supabase.from('order_items').insert({
        id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order_id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        color: item.selectedColor || null,
        size: item.selectedSize || null
      });
    }

    // Create tracking steps
    const steps = [
      { label: 'Commande validée', done: true },
      { label: 'En préparation', done: false },
      { label: 'Expédié', done: false },
      { label: 'En transit', done: false },
      { label: 'Livré', done: false }
    ];

    for (const [index, step] of steps.entries()) {
      await supabase.from('order_tracking').insert({
        id: `TRACK-${Date.now()}-${index}`,
        order_id,
        step_label: step.label,
        is_done: step.done,
        step_date: step.done ? new Date().toISOString() : null
      });
    }

    res.json({ success: true, order_id, tracking_number });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la commande' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', req.params.id);

    const { data: tracking } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', req.params.id)
      .order('created_at', { ascending: true });

    res.json({
      ...order,
      items: items || [],
      tracking: (tracking || []).map(t => ({
        label: t.step_label,
        done: t.is_done,
        date: t.step_date
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la commande' });
  }
});

app.get('/api/orders/tracking/:trackingId', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .or(`tracking_number.eq.${req.params.trackingId},id.eq.${req.params.trackingId}`)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const { data: tracking } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    res.json({
      id: order.id,
      status: order.status,
      tracking_number: order.tracking_number,
      steps: (tracking || []).map(t => ({
        label: t.step_label,
        done: t.is_done,
        date: t.step_date || 'En attente'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du suivi de la commande' });
  }
});

// ── COUPONS ──

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return res.json({ success: false, message: 'Code promo invalide' });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({ success: false, message: 'Code promo expiré' });
    }

    // Check max uses
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return res.json({ success: false, message: 'Code promo épuisé' });
    }

    res.json({ success: true, discount: coupon.discount, message: `Code promo appliqué : -${coupon.discount}%` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la validation du coupon' });
  }
});

// ── SEED DATA ──

app.post('/api/seed', async (req, res) => {
  try {
    // Seed admin user
    const { data: adminExists } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'admin@daralhayaa.com')
      .single();

    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
      await supabase.from('users').insert({
        id: 'ADMIN-001',
        first_name: 'Admin',
        last_name: 'Dar Al-Hayaa',
        email: 'admin@daralhayaa.com',
        phone: '+2250102030405',
        password: adminPassword,
        role: 'admin',
        is_active: true,
        email_verified: true
      });
    }

    // Seed categories
    const categories = [
      {
        id: 'femmes',
        name: 'Femmes',
        name_ar: 'نساء',
        icon: '👗',
        description: 'Vêtements pudiques et élégants pour femmes',
        count: 245,
        color: '#8B4B62',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=400&q=80',
        subcategories: ['Hijabs', 'Khimars', 'Abayas', 'Jilbabs', 'Robes', 'Voiles', 'Gants', 'Chaussettes', 'Accessoires']
      },
      {
        id: 'hommes',
        name: 'Hommes',
        name_ar: 'رجال',
        icon: '👘',
        description: 'Tenues islamiques raffinées pour hommes',
        count: 178,
        color: '#1A2E4A',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        subcategories: ['Qamis', 'Sarouels', 'Ensembles', 'Bonnets', 'Keffieh', 'Sandales', 'Ceintures', 'Parfums']
      },
      {
        id: 'beaute',
        name: 'Beauté',
        name_ar: 'جمال',
        icon: '✨',
        description: 'Cosmétiques et parfums halal premium',
        count: 134,
        color: '#C9A84C',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80',
        subcategories: ['Musc', 'Oud', 'Huiles parfumées', 'Savons', 'Crèmes', 'Cosmétiques', 'Soins', 'Coffrets']
      },
      {
        id: 'electronique',
        name: 'Électronique',
        name_ar: 'إلكترونيات',
        icon: '📱',
        description: 'Technologie et gadgets de qualité',
        count: 209,
        color: '#243B55',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        subcategories: ['Casques', 'Écouteurs', 'Chargeurs', 'Montres', 'Power Banks', 'Claviers', 'Souris', 'Lampes LED']
      },
      {
        id: 'accessoires',
        name: 'Accessoires Islamiques',
        name_ar: 'مستلزمات إسلامية',
        icon: '📿',
        description: 'Objets islamiques et cadeaux spirituels',
        count: 96,
        color: '#5A3A2A',
        image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80',
        subcategories: ['Corans', 'Tapis de prière', 'Chapelets', 'Livres', 'Boussoles Qibla', 'Cadeaux']
      }
    ];

    await supabase.from('categories').upsert(categories);

    // Seed coupons
    const coupons = [
      { code: 'NOUR10', discount: 10, min_purchase: 0, max_uses: null, uses_count: 0, is_active: true },
      { code: 'RAMADAN20', discount: 20, min_purchase: 50, max_uses: null, uses_count: 0, is_active: true },
      { code: 'BIENVENUE15', discount: 15, min_purchase: 0, max_uses: null, uses_count: 0, is_active: true }
    ];

    await supabase.from('coupons').upsert(coupons);

    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Erreur seed:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/seed-products', async (req, res) => {
  try {
    const { products } = req.body;
    
    const { error } = await supabase.from('products').insert(products);
    
    if (error) throw error;
    res.json({ success: true, message: `${products.length} products seeded successfully` });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── FAVORIS ──

app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json(favorites || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des favoris' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    
    // Vérifier si déjà dans les favoris
    const { data: existing } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return res.json({ success: false, message: 'Déjà dans les favoris' });
    }
    
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        id: `FAV-${Date.now()}`,
        user_id,
        product_id
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, favorite });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout aux favoris' });
  }
});

app.delete('/api/favorites/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression du favori' });
  }
});

// ── AVIS ──

app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', req.params.productId);

    if (error) throw error;
    res.json(reviews || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des avis' });
  }
});

app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json(reviews || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des avis' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { user_id, product_id, rating, comment, verified } = req.body;
    
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        id: `REV-${Date.now()}`,
        user_id,
        product_id,
        rating,
        comment,
        verified: verified || false
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout de l\'avis' });
  }
});

// ── ADRESSES ──

app.get('/api/addresses/:userId', async (req, res) => {
  try {
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json(addresses || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des adresses' });
  }
});

app.post('/api/addresses', async (req, res) => {
  try {
    const { user_id, type, firstName, lastName, address, postalCode, city, country, phone, isDefault } = req.body;
    
    const { data: addressData, error } = await supabase
      .from('addresses')
      .insert({
        id: `ADDR-${Date.now()}`,
        user_id,
        type: type || 'delivery',
        first_name: firstName,
        last_name: lastName,
        address,
        postal_code: postalCode,
        city,
        country: country || 'Côte d\'Ivoire',
        phone,
        is_default: isDefault || false
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, address: addressData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout de l\'adresse' });
  }
});

app.put('/api/addresses/:id', async (req, res) => {
  try {
    const { data: address, error } = await supabase
      .from('addresses')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification de l\'adresse' });
  }
});

app.delete('/api/addresses/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'adresse' });
  }
});

// ── NOTIFICATIONS ──

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(notifications || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des notifications' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { user_id, type, title, message, link } = req.body;
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        id: `NOTIF-${Date.now()}`,
        user_id,
        type,
        title,
        message,
        link,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la notification' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de la notification' });
  }
});

// ── PAIEMENTS ──

app.post('/api/payments', async (req, res) => {
  try {
    const { order_id, method, amount, status, transaction_id, phone } = req.body;
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        id: `PAY-${Date.now()}`,
        order_id,
        method,
        amount,
        status: status || 'pending',
        transaction_id,
        phone
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création du paiement' });
  }
});

app.get('/api/payments/order/:orderId', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', req.params.orderId);

    if (error) throw error;
    res.json(payments || []);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des paiements' });
  }
});

app.put('/api/payments/:id', async (req, res) => {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du paiement' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: Supabase`);
});
