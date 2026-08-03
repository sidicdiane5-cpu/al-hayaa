import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getProducts, getOrders, getCustomers } from '../../lib/api';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStock: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [products, orders, customers] = await Promise.all([
        getProducts(),
        getOrders(),
        getCustomers()
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const lowStock = products.filter(p => (p.stock || 0) < 5).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders,
        lowStock
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Commandes',
      value: stats.totalOrders,
      change: '+12%',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Revenus',
      value: `${stats.totalRevenue.toLocaleString()} FCFA`,
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Produits',
      value: stats.totalProducts,
      change: '+3%',
      icon: Package,
      color: 'bg-purple-500',
      trend: 'up'
    },
    {
      title: 'Clients',
      value: stats.totalCustomers,
      change: '+15%',
      icon: Users,
      color: 'bg-orange-500',
      trend: 'up'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--gray-500)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Tableau de bord</h1>
        <p>
          Bienvenue, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          const colorClass = stat.color === 'bg-blue-500' ? 'blue' :
                           stat.color === 'bg-green-500' ? 'green' :
                           stat.color === 'bg-purple-500' ? 'purple' : 'orange';
          
          return (
            <div key={stat.title} className={styles.statCard}>
              <div className={styles.statCardContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>{stat.title}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                  <div className={`${styles.statTrend} ${stat.trend === 'up' ? styles.up : styles.down}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}</span>
                    <span>vs mois dernier</span>
                  </div>
                </div>
                <div className={`${styles.statIcon} ${colorClass}`}>
                  <Icon />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      <div className={styles.alertsGrid}>
        <div className={styles.alertCard}>
          <div className={styles.alertHeader}>
            <AlertTriangle className={styles.alertIcon} />
            <h3>Alertes Stock</h3>
          </div>
          <div className={styles.alertItems}>
            <div className={`${styles.alertItem} ${styles.red}`}>
              <div className={styles.alertItemInfo}>
                <p>Parfum Oud Royal</p>
                <p>Stock: 2 unités</p>
              </div>
              <span className={`${styles.alertBadge} ${styles.red}`}>
                Rupture
              </span>
            </div>
            <div className={`${styles.alertItem} ${styles.yellow}`}>
              <div className={styles.alertItemInfo}>
                <p>Sac à Main Élégant</p>
                <p>Stock: 5 unités</p>
              </div>
              <span className={`${styles.alertBadge} ${styles.yellow}`}>
                Faible
              </span>
            </div>
          </div>
        </div>

        <div className={styles.alertCard}>
          <div className={styles.alertHeader}>
            <ShoppingCart className={styles.alertIcon} style={{ color: '#3b82f6' }} />
            <h3>Commandes en attente</h3>
          </div>
          <div className={styles.pendingOrders}>
            <p className={styles.pendingOrdersCount}>{stats.pendingOrders}</p>
            <p className={styles.pendingOrdersLabel}>Commandes à traiter</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.recentOrders}>
        <div className={styles.recentOrdersHeader}>
          <h3>Commandes récentes</h3>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span>{order.id}</span>
                  </td>
                  <td>
                    {order.user_name || order.user_id}
                  </td>
                  <td>
                    {(order.total || 0).toLocaleString()} FCFA
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[order.status] || styles.pending}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
                    Aucune commande récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
