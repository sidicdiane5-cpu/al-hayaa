import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  Star, 
  Tag, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin()) {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'products', label: 'Produits', icon: Package, path: '/admin/products' },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart, path: '/admin/orders' },
    { id: 'customers', label: 'Clients', icon: Users, path: '/admin/customers' },
    { id: 'stock', label: 'Stock', icon: AlertTriangle, path: '/admin/stock' },
    { id: 'reviews', label: 'Avis', icon: Star, path: '/admin/reviews' },
    { id: 'promotions', label: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className={styles.sidebarBackdrop}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className={styles.closeButton}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.navItemIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.firstName} {user?.lastName}</p>
              <p className={styles.userRole}>{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Top bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarContent}>
            <button
              onClick={() => setSidebarOpen(true)}
              className={styles.menuButton}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className={styles.topBarActions}>
              <button className={styles.notificationButton}>
                <Bell className="w-6 h-6" />
                <span className={styles.notificationBadge}></span>
              </button>
              
              <Link
                to="/"
                className={styles.viewSiteLink}
              >
                Voir le site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
