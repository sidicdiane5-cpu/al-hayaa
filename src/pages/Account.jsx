import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Heart, Package, MapPin, User, LogOut, Star, ChevronRight } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';
import styles from './Account.module.css';

export function AccountPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  const handleLogout = () => { logout(); navigate('/'); };

  const mockOrders = [
    { id: '#NF-001', date: '27 Jan 2025', status: 'Livré', total: '89.99€', items: 2 },
    { id: '#NF-002', date: '15 Jan 2025', status: 'Livré', total: '54.98€', items: 1 },
    { id: '#NF-003', date: '02 Jan 2025', status: 'Livré', total: '129.99€', items: 3 },
  ];

  return (
    <>
      <Helmet><title>Mon Compte — Dar Al Hayaa</title></Helmet>
      <div className={styles.accountPage}>
        <div className="container section-sm">
          <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.userCard}>
                <div className={styles.avatar}>{user.avatar}</div>
                <div>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>
              <nav className={styles.sideNav}>
                <Link to="/compte" className={`${styles.sideLink} ${styles.sideLinkActive}`}>
                  <User size={16} /> Mon profil
                </Link>
                <Link to="/compte/commandes" className={styles.sideLink}>
                  <Package size={16} /> Mes commandes
                </Link>
                <Link to="/favoris" className={styles.sideLink}>
                  <Heart size={16} /> Mes favoris
                </Link>
                <Link to="/compte/adresses" className={styles.sideLink}>
                  <MapPin size={16} /> Mes adresses
                </Link>
                <button className={`${styles.sideLink} ${styles.logoutBtn}`} onClick={handleLogout}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </nav>
            </aside>

            {/* Main */}
            <div className={styles.main}>
              <h1 className={styles.title}>Tableau de Bord</h1>
              <div className={styles.welcomeCard}>
                <div>
                  <h2 className={styles.welcomeText}>Assalamu Alaikum, {user.name} ! 🌙</h2>
                  <p className={styles.welcomeDesc}>Bienvenue sur votre espace personnel Dar Al Hayaa.</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Commandes récentes</h3>
                  <Link to="/compte/commandes" className={styles.seeAll}>Tout voir <ChevronRight size={14} /></Link>
                </div>
                {mockOrders.map((order) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div>
                      <div className={styles.orderId}>{order.id}</div>
                      <div className={styles.orderDate}>{order.date} · {order.items} article(s)</div>
                    </div>
                    <span className={styles.orderStatus}>{order.status}</span>
                    <div className={styles.orderTotal}>{order.total}</div>
                    <Link to="/suivi-commande" className={styles.trackBtn}>Suivre</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Helmet><title>Mes Favoris — Dar Al Hayaa</title></Helmet>
      <div className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag"><Heart size={14} /> Mes Favoris</span>
            <h1 className="section-title">Liste de Souhaits</h1>
            <p className="section-subtitle">{items.length} article(s) enregistré(s)</p>
          </div>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>💝</div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Votre liste est vide</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Ajoutez vos articles favoris en cliquant sur le ❤️</p>
              <Link to="/boutique" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--navy)', color: 'var(--off-white)',
                padding: '12px 28px', borderRadius: 'var(--radius-full)',
                fontWeight: 600, fontSize: '0.9rem',
              }}>
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="grid-4">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
