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
} from 'lucide-react';
import styles from './AdminLayout.module.css';

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

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Le controle d'acces est fait en amont par ProtectedAdminRoute : appeler
  // navigate() pendant le rendu provoquerait un warning React et un ecran vide.

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const currentPage =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.label ?? 'Administration';

  return (
    <div className={styles.adminLayout}>
      {sidebarOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}
        aria-label="Navigation administration"
      >
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle} style={{ color: 'var(--gold)' }}>
            Dar Al-Hayaa
          </span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
            <span className="sr-only">Fermer le menu</span>
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
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
              {(user?.firstName?.[0] || user?.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>
                {user?.name || user?.email}
              </p>
              <p className={styles.userRole}>{user?.role}</p>
            </div>
          </div>

          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.topBarContent}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
              <span className="sr-only">Ouvrir le menu</span>
            </button>

            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{currentPage}</span>

            <div className={styles.topBarActions}>
              <Link to="/" className={styles.viewSiteLink}>
                Voir le site
              </Link>
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
