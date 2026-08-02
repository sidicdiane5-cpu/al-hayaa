import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Star, Tag, Settings, TrendingUp, DollarSign, Eye, AlertTriangle
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import styles from './Admin.module.css';

const STATS = [
  { label: 'Chiffre d\'affaires', value: '24 850 €', change: '+18.2%', icon: <DollarSign size={20} />, color: '#27AE60' },
  { label: 'Commandes', value: '1 247', change: '+12.5%', icon: <ShoppingCart size={20} />, color: '#2980B9' },
  { label: 'Clients', value: '8 934', change: '+8.1%', icon: <Users size={20} />, color: '#8E44AD' },
  { label: 'Articles vendus', value: '3 892', change: '+22.4%', icon: <Package size={20} />, color: '#C9A84C' },
];

const RECENT_ORDERS = [
  { id: '#NF-2025-001', customer: 'Fatima Al-Zahra', product: 'Abaya Classique', total: '89.99€', status: 'Livré', date: '27 Jan 2025' },
  { id: '#NF-2025-002', customer: 'Omar Khalid', product: 'Qamis Blanc Premium', total: '79.99€', status: 'En transit', date: '27 Jan 2025' },
  { id: '#NF-2025-003', customer: 'Aïcha Benmoussa', product: 'Hijab + Coffret', total: '54.98€', status: 'En préparation', date: '26 Jan 2025' },
  { id: '#NF-2025-004', customer: 'Youssef Mamani', product: 'Casque ANC +', total: '149.99€', status: 'Livré', date: '25 Jan 2025' },
  { id: '#NF-2025-005', customer: 'Maryam Dubois', product: 'Tapis de Prière', total: '34.99€', status: 'Annulé', date: '24 Jan 2025' },
];

const STATUS_COLORS = {
  'Livré': { bg: 'rgba(39,174,96,0.12)', color: '#27AE60' },
  'En transit': { bg: 'rgba(41,128,185,0.12)', color: '#2980B9' },
  'En préparation': { bg: 'rgba(201,168,76,0.15)', color: '#A07830' },
  'Annulé': { bg: 'rgba(192,57,43,0.12)', color: '#C0392B' },
};

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard size={16} /> },
  { id: 'products', label: 'Produits', icon: <Package size={16} /> },
  { id: 'orders', label: 'Commandes', icon: <ShoppingCart size={16} /> },
  { id: 'users', label: 'Utilisateurs', icon: <Users size={16} /> },
  { id: 'analytics', label: 'Analytiques', icon: <BarChart3 size={16} /> },
  { id: 'reviews', label: 'Avis', icon: <Star size={16} /> },
  { id: 'promotions', label: 'Promotions', icon: <Tag size={16} /> },
  { id: 'settings', label: 'Paramètres', icon: <Settings size={16} /> },
];

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/connexion" replace />;
  }

  const lowStockProducts = PRODUCTS.filter((p) => p.stock <= 5);

  return (
    <>
      <Helmet><title>Administration — Dar Al Hayaa</title></Helmet>

      <div className={styles.adminLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <div className={styles.logoIcon}>🌙</div>
            <div>
              <div className={styles.logoName}>Dar Al Hayaa</div>
              <div className={styles.logoAdmin}>Administration</div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <a href="/" className={styles.viewSiteLink}>
              <Eye size={14} /> Voir le site
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {/* Header */}
          <div className={styles.mainHeader}>
            <div>
              <h1 className={styles.pageTitle}>
                {ADMIN_TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className={styles.pageDate}>
                Lundi, 27 Janvier 2025
              </p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.alertBadge}>
                <AlertTriangle size={14} />
                {lowStockProducts.length} stock faible
              </div>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats */}
              <div className={styles.statsGrid}>
                {STATS.map((stat, i) => (
                  <motion.div
                    key={i}
                    className={styles.statCard}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className={styles.statIcon} style={{ background: `${stat.color}20`, color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className={styles.statLabel}>{stat.label}</div>
                      <div className={styles.statValue}>{stat.value}</div>
                      <div className={styles.statChange} style={{ color: stat.color }}>
                        <TrendingUp size={12} /> {stat.change} ce mois
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Orders */}
              <motion.div
                className={styles.section}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Commandes Récentes</h2>
                  <button className={styles.seeAllBtn} onClick={() => setActiveTab('orders')}>
                    Voir tout
                  </button>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Client</th>
                        <th>Produit</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_ORDERS.map((order) => (
                        <tr key={order.id}>
                          <td className={styles.tableId}>{order.id}</td>
                          <td>{order.customer}</td>
                          <td className={styles.tableProduct}>{order.product}</td>
                          <td className={styles.tableTotal}>{order.total}</td>
                          <td>
                            <span
                              className={styles.statusBadge}
                              style={STATUS_COLORS[order.status]}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className={styles.tableDate}>{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Low Stock Alert */}
              {lowStockProducts.length > 0 && (
                <motion.div
                  className={styles.section}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                      Stocks Faibles
                    </h2>
                  </div>
                  <div className={styles.lowStockGrid}>
                    {lowStockProducts.map((p) => (
                      <div key={p.id} className={styles.lowStockItem}>
                        <img src={p.images[0]} alt={p.name} className={styles.lowStockImg} />
                        <div className={styles.lowStockInfo}>
                          <div className={styles.lowStockName}>{p.name}</div>
                          <div className={styles.lowStockQty}>
                            <span style={{ color: p.stock <= 2 ? 'var(--error)' : 'var(--warning)' }}>
                              ● {p.stock} restant(s)
                            </span>
                          </div>
                        </div>
                        <div className={styles.lowStockPrice}>{p.price.toLocaleString()} FCFA</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className={styles.tabActions}>
                <input type="text" placeholder="Rechercher un produit..." className={styles.searchInput} />
                <button className={styles.addBtn}>+ Ajouter un produit</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Stock</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className={styles.productCell}>
                            <img src={p.images[0]} alt={p.name} className={styles.productThumb} />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td className={styles.tableTotal}>{p.price.toLocaleString()} FCFA</td>
                        <td>
                          <span style={{ color: p.stock <= 5 ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>⭐ {p.rating}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button className={styles.editBtn}>Modifier</button>
                            <button className={styles.deleteBtn}>Suppr.</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Produit</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id}>
                      <td className={styles.tableId}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td className={styles.tableProduct}>{order.product}</td>
                      <td className={styles.tableTotal}>{order.total}</td>
                      <td>
                        <span className={styles.statusBadge} style={STATUS_COLORS[order.status]}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn}>Détails</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Others Tabs */}
          {['users', 'analytics', 'reviews', 'promotions', 'settings'].includes(activeTab) && (
            <div className={styles.comingSoon}>
              <div className={styles.comingSoonIcon}>🚧</div>
              <h2>Cette section est en cours de développement</h2>
              <p>Nous travaillons sur cette fonctionnalité. Revenez bientôt !</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
