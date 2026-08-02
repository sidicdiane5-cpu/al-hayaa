import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
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

  useEffect(() => {
    // Simulated data - In production, fetch from API
    setStats({
      totalOrders: 156,
      totalRevenue: 45890,
      totalProducts: 234,
      totalCustomers: 89,
      pendingOrders: 12,
      lowStock: 5
    });

    setRecentOrders([
      { id: 'ORD-001', customer: 'Jean Dupont', total: 12500, status: 'pending', date: '2024-01-15' },
      { id: 'ORD-002', customer: 'Marie Martin', total: 8900, status: 'confirmed', date: '2024-01-15' },
      { id: 'ORD-003', customer: 'Pierre Bernard', total: 15600, status: 'shipped', date: '2024-01-14' },
      { id: 'ORD-004', customer: 'Sophie Petit', total: 5200, status: 'delivered', date: '2024-01-14' },
      { id: 'ORD-005', customer: 'Lucas Dubois', total: 9800, status: 'pending', date: '2024-01-13' },
    ]);
  }, []);

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
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span>{order.id}</span>
                  </td>
                  <td>
                    {order.customer}
                  </td>
                  <td>
                    {order.total.toLocaleString()} FCFA
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
