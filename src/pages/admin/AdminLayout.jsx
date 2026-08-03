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

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar ouvert par défaut

  // Contournement temporaire : permettre l'accès si l'email est admin@daralhayaa.com
  const isAdminEmail = user?.email === 'admin@daralhayaa.com';
  const hasAdminAccess = isAdmin() || isAdminEmail;

  if (!hasAdminAccess) {
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

  // Détection mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--gray-100)' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '280px',
        backgroundColor: 'var(--navy)',
        color: 'white',
        zIndex: 50,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform var(--transition-base)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--gold)',
            margin: 0,
          }}>Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: 'var(--space-2)',
            }}
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{
          flex: 1,
          padding: 'var(--space-4)',
          overflowY: 'auto',
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  color: isActive ? 'var(--gold)' : 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  transition: 'all var(--transition-base)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--gold)',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}>
              {user?.firstName?.[0] || 'A'}
            </div>
            <div>
              <p style={{
                fontWeight: 500,
                margin: 0,
                fontSize: 'var(--text-sm)',
              }}>{user?.firstName} {user?.lastName}</p>
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--gray-400)',
                margin: 0,
              }}>{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              width: '100%',
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-base)',
            }}
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '280px',
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : 'calc(100% - 280px)',
      }}>
        {/* Top bar */}
        <header style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--navy)',
                cursor: 'pointer',
                padding: 'var(--space-2)',
              }}
            >
              <Menu size={24} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button style={{
              position: 'relative',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--navy)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
            }}>
              <Bell size={24} />
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 8,
                height: 8,
                backgroundColor: 'var(--error)',
                borderRadius: '50%',
              }}></span>
            </button>
            
            <Link
              to="/"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--navy)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
              }}
            >
              Voir le site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: 'var(--space-6)',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
