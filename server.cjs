const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Middleware
app.use(cors());
app.use(express.json());

// Initialisation de la base de données LowDB (JSON)
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, {
  users: [],
  categories: [],
  products: [],
  orders: [],
  order_items: [],
  order_tracking: [],
  coupons: []
});

// Initialiser la base de données
async function initializeDatabase() {
  await db.read();
  
  // S'assurer que toutes les tables existent
  if (!db.data) {
    db.data = {};
  }
  
  db.data.users = db.data.users || [];
  db.data.categories = db.data.categories || [];
  db.data.products = db.data.products || [];
  db.data.orders = db.data.orders || [];
  db.data.order_items = db.data.order_items || [];
  db.data.order_tracking = db.data.order_tracking || [];
  db.data.coupons = db.data.coupons || [];
  db.data.favorites = db.data.favorites || [];
  db.data.reviews = db.data.reviews || [];
  db.data.addresses = db.data.addresses || [];
  db.data.notifications = db.data.notifications || [];
  db.data.payments = db.data.payments || [];
  
  await db.write();
}

// Middleware pour s'assurer que la base de données est initialisée
app.use(async (req, res, next) => {
  if (!db.data || !db.data.favorites) {
    await initializeDatabase();
  }
  next();
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

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected (lowdb)' });
});

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
    const existingUser = db.data.users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Cette adresse email est déjà utilisée' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Créer l'utilisateur
    const user = {
      id: `USER-${Date.now()}`,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'client',
      isActive: false,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.data.users.push(user);
    await db.write();

    // Créer une notification de bienvenue
    const notification = {
      id: `NOTIF-${Date.now()}`,
      user_id: user.id,
      type: 'welcome',
      title: 'Bienvenue !',
      message: 'Votre compte a été créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      link: null,
      read: false,
      created_at: new Date().toISOString()
    };
    db.data.notifications.push(notification);
    await db.write();

    res.status(201).json({ 
      success: true, 
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
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
    const user = db.data.users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
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
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Mettre à jour la dernière connexion
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    await db.write();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
  }
});

// Déconnexion
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // En production, on pourrait ajouter le token à une blacklist
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la déconnexion' });
  }
});

// Vérifier le token
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    }
  });
});

// Réinitialisation du mot de passe - Demande
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requis' });
    }

    const user = db.data.users.find(u => u.email === email.toLowerCase());
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return res.json({ success: true, message: 'Si cet email existe, vous recevrez un lien de réinitialisation.' });
    }

    // Créer un token de réinitialisation (en production, envoyer par email)
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();
    await db.write();

    // Créer une notification
    const notification = {
      id: `NOTIF-${Date.now()}`,
      user_id: user.id,
      type: 'password_reset',
      title: 'Réinitialisation du mot de passe',
      message: 'Une demande de réinitialisation de mot de passe a été effectuée.',
      link: null,
      read: false,
      created_at: new Date().toISOString()
    };
    db.data.notifications.push(notification);
    await db.write();

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
    const user = db.data.users.find(u => u.id === decoded.id);

    if (!user || user.resetToken !== token || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ success: false, error: 'Token invalide ou expiré' });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.updatedAt = new Date().toISOString();
    await db.write();

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

    const user = db.data.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.updatedAt = new Date().toISOString();
    await db.write();

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du mot de passe' });
  }
});

// ── UTILISATEURS (Gestion du profil) ──

// Obtenir le profil utilisateur
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const user = db.data.users.find(u => u.id === req.params.id);
  if (!user) {
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }
  });
});

// Mettre à jour le profil utilisateur
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = db.data.users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // L'utilisateur ne peut modifier que son propre profil sauf admin
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    user.updatedAt = new Date().toISOString();

    await db.write();

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du profil' });
  }
});

// ── ADMIN - GESTION DES UTILISATEURS ──

// Obtenir tous les utilisateurs (admin uniquement)
app.get('/api/admin/users', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const users = db.data.users.map(u => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  }));

  res.json({ success: true, users });
});

// Modifier le rôle d'un utilisateur (admin uniquement)
app.put('/api/admin/users/:id/role', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = db.data.users.find(u => u.id === req.params.id);

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

    user.role = role;
    user.updatedAt = new Date().toISOString();
    await db.write();

    res.json({ success: true, message: 'Rôle modifié avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du rôle' });
  }
});

// Bloquer/Débloquer un utilisateur (admin uniquement)
app.put('/api/admin/users/:id/status', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = db.data.users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Empêcher de se bloquer soi-même
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas vous bloquer vous-même' });
    }

    user.isActive = isActive;
    user.updatedAt = new Date().toISOString();
    await db.write();

    res.json({ success: true, message: isActive ? 'Utilisateur activé' : 'Utilisateur bloqué' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du statut' });
  }
});

// Supprimer un utilisateur (admin uniquement)
app.delete('/api/admin/users/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const user = db.data.users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Empêcher de se supprimer soi-même
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' });
    }

    db.data.users = db.data.users.filter(u => u.id !== req.params.id);
    await db.write();

    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json(db.data.categories);
});

app.post('/api/categories', (req, res) => {
  const category = req.body;
  db.data.categories.push(category);
  db.write();
  res.json({ success: true, id: category.id });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, search, limit } = req.query;
  let products = db.data.products;

  if (category) {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchLower)))
    );
  }

  if (limit) {
    products = products.slice(0, parseInt(limit));
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.data.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  res.json(product);
});

app.post('/api/products', (req, res) => {
  const product = req.body;
  db.data.products.push(product);
  db.write();
  res.json({ success: true, id: product.id });
});

// Orders
app.post('/api/orders', (req, res) => {
  const { user_id, items, total, subtotal, shipping, discount, coupon_code, payment_method, shipping_address, phone, email } = req.body;
  const order_id = `ORD-${Date.now()}`;
  const tracking_number = `TRK-${Date.now().toString(36).toUpperCase()}`;

  // Create order
  const order = {
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
    tracking_number,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.data.orders.push(order);

  // Create order items
  items.forEach(item => {
    const order_item = {
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order_id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      color: item.selectedColor || null,
      size: item.selectedSize || null,
      created_at: new Date().toISOString()
    };
    db.data.order_items.push(order_item);
  });

  // Create tracking steps
  const steps = [
    { label: 'Commande validée', done: true, date: new Date().toISOString() },
    { label: 'En préparation', done: false, date: null },
    { label: 'Expédié', done: false, date: null },
    { label: 'En transit', done: false, date: null },
    { label: 'Livré', done: false, date: null },
  ];

  steps.forEach((step, index) => {
    const tracking = {
      id: `TRACK-${Date.now()}-${index}`,
      order_id,
      step_label: step.label,
      is_done: step.done,
      step_date: step.date,
      created_at: new Date().toISOString()
    };
    db.data.order_tracking.push(tracking);
  });

  db.write();
  res.json({ success: true, order_id, tracking_number });
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.data.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const items = db.data.order_items.filter(oi => oi.order_id === req.params.id);
  const tracking = db.data.order_tracking.filter(t => t.order_id === req.params.id).sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  res.json({
    ...order,
    items,
    tracking: tracking.map(t => ({
      label: t.step_label,
      done: t.is_done,
      date: t.step_date
    }))
  });
});

app.get('/api/orders/tracking/:trackingId', (req, res) => {
  const order = db.data.orders.find(o => o.tracking_number === req.params.trackingId || o.id === req.params.trackingId);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const tracking = db.data.order_tracking.filter(t => t.order_id === order.id).sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  res.json({
    id: order.id,
    status: order.status,
    tracking_number: order.tracking_number,
    steps: tracking.map(t => ({
      label: t.step_label,
      done: t.is_done,
      date: t.step_date || 'En attente'
    }))
  });
});

// Coupons
app.post('/api/coupons/validate', (req, res) => {
  const { code } = req.body;
  const coupon = db.data.coupons.find(c => c.code === code.toUpperCase() && c.is_active);

  if (!coupon) {
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
});

// Seed initial data
app.post('/api/seed', async (req, res) => {
  try {
    // Seed admin user
    const adminExists = db.data.users.find(u => u.email === 'admin@daralhayaa.com');
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
      const adminUser = {
        id: 'ADMIN-001',
        firstName: 'Admin',
        lastName: 'Dar Al-Hayaa',
        email: 'admin@daralhayaa.com',
        phone: '+2250102030405',
        password: adminPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.data.users.push(adminUser);
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

    db.data.categories = categories;

    // Seed coupons
    const coupons = [
      { code: 'NOUR10', discount: 10, min_purchase: 0, max_uses: null, uses_count: 0, is_active: true },
      { code: 'RAMADAN20', discount: 20, min_purchase: 50, max_uses: null, uses_count: 0, is_active: true },
      { code: 'BIENVENUE15', discount: 15, min_purchase: 0, max_uses: null, uses_count: 0, is_active: true }
    ];

    db.data.coupons = coupons;

    await db.write();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Seed products from the existing data
app.post('/api/seed-products', (req, res) => {
  const { products } = req.body;
  
  try {
    db.data.products = products;
    db.write();
    res.json({ success: true, message: `${products.length} products seeded successfully` });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── FAVORIS ──
app.get('/api/favorites/:userId', (req, res) => {
  const favorites = db.data.favorites.filter(f => f.user_id === req.params.userId);
  res.json(favorites);
});

app.post('/api/favorites', (req, res) => {
  const { user_id, product_id } = req.body;
  
  // Vérifier si déjà dans les favoris
  const existing = db.data.favorites.find(f => f.user_id === user_id && f.product_id === product_id);
  if (existing) {
    return res.json({ success: false, message: 'Déjà dans les favoris' });
  }
  
  const favorite = {
    id: `FAV-${Date.now()}`,
    user_id,
    product_id,
    created_at: new Date().toISOString()
  };
  
  db.data.favorites.push(favorite);
  db.write();
  res.json({ success: true, favorite });
});

app.delete('/api/favorites/:id', (req, res) => {
  db.data.favorites = db.data.favorites.filter(f => f.id !== req.params.id);
  db.write();
  res.json({ success: true });
});

// ── AVIS ──
app.get('/api/reviews/product/:productId', (req, res) => {
  const reviews = db.data.reviews.filter(r => r.product_id === req.params.productId);
  res.json(reviews);
});

app.get('/api/reviews/user/:userId', (req, res) => {
  const reviews = db.data.reviews.filter(r => r.user_id === req.params.userId);
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { user_id, product_id, rating, comment, verified } = req.body;
  
  const review = {
    id: `REV-${Date.now()}`,
    user_id,
    product_id,
    rating,
    comment,
    verified: verified || false,
    created_at: new Date().toISOString()
  };
  
  db.data.reviews.push(review);
  db.write();
  res.json({ success: true, review });
});

// ── ADRESSES ──
app.get('/api/addresses/:userId', (req, res) => {
  const addresses = db.data.addresses.filter(a => a.user_id === req.params.userId);
  res.json(addresses);
});

app.post('/api/addresses', (req, res) => {
  const { user_id, type, firstName, lastName, address, postalCode, city, country, phone, isDefault } = req.body;
  
  const addressData = {
    id: `ADDR-${Date.now()}`,
    user_id,
    type: type || 'delivery',
    firstName,
    lastName,
    address,
    postalCode,
    city,
    country: country || 'Côte d\'Ivoire',
    phone,
    isDefault: isDefault || false,
    created_at: new Date().toISOString()
  };
  
  db.data.addresses.push(addressData);
  db.write();
  res.json({ success: true, address: addressData });
});

app.put('/api/addresses/:id', (req, res) => {
  const index = db.data.addresses.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Address not found' });
  }
  
  db.data.addresses[index] = { ...db.data.addresses[index], ...req.body };
  db.write();
  res.json({ success: true, address: db.data.addresses[index] });
});

app.delete('/api/addresses/:id', (req, res) => {
  db.data.addresses = db.data.addresses.filter(a => a.id !== req.params.id);
  db.write();
  res.json({ success: true });
});

// ── NOTIFICATIONS ──
app.get('/api/notifications/:userId', (req, res) => {
  const notifications = db.data.notifications.filter(n => n.user_id === req.params.userId);
  res.json(notifications);
});

app.post('/api/notifications', (req, res) => {
  const { user_id, type, title, message, link } = req.body;
  
  const notification = {
    id: `NOTIF-${Date.now()}`,
    user_id,
    type,
    title,
    message,
    link,
    read: false,
    created_at: new Date().toISOString()
  };
  
  db.data.notifications.push(notification);
  db.write();
  res.json({ success: true, notification });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const index = db.data.notifications.findIndex(n => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }
  
  db.data.notifications[index].read = true;
  db.write();
  res.json({ success: true });
});

// ── PAIEMENTS ──
app.post('/api/payments', (req, res) => {
  const { order_id, method, amount, status, transaction_id, phone } = req.body;
  
  const payment = {
    id: `PAY-${Date.now()}`,
    order_id,
    method,
    amount,
    status: status || 'pending',
    transaction_id,
    phone,
    created_at: new Date().toISOString()
  };
  
  db.data.payments.push(payment);
  db.write();
  res.json({ success: true, payment });
});

app.get('/api/payments/order/:orderId', (req, res) => {
  const payments = db.data.payments.filter(p => p.order_id === req.params.orderId);
  res.json(payments);
});

app.put('/api/payments/:id', (req, res) => {
  const index = db.data.payments.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }
  
  db.data.payments[index] = { ...db.data.payments[index], ...req.body };
  db.write();
  res.json({ success: true, payment: db.data.payments[index] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: db.json (lowdb)`);
});
