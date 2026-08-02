import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Phone, Mail, MapPin, Star, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import s from './Header.module.css';

const NAV_ITEMS = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/boutique' },
  {
    label: 'Femmes', to: '/femmes',
    sub: [
      { label: 'Abayas', to: '/femmes/abayas' },
      { label: 'Hijabs', to: '/femmes/hijabs' },
      { label: 'Jilbabs', to: '/femmes/jilbabs' },
      { label: 'Robes', to: '/femmes/robes' },
      { label: 'Khimars', to: '/femmes/khimars' },
      { label: 'Accessoires', to: '/femmes/accessoires' },
      { label: 'Chaussures', to: '/femmes/chaussures' },
    ],
  },
  {
    label: 'Hommes', to: '/hommes',
    sub: [
      { label: 'Qamis', to: '/hommes/qamis' },
      { label: 'Sarouels', to: '/hommes/sarouels' },
      { label: 'Chaussures', to: '/hommes/chaussures' },
    ],
  },
  {
    label: 'Beauté', to: '/beaute',
    sub: [
      { label: 'Cheveux', to: '/beaute/cheveux' },
      { label: 'Parfums', to: '/beaute/parfums' },
      { label: 'Sacs', to: '/beaute/sacs' },
      { label: 'Soin Visage', to: '/beaute/soin_visage' },
    ],
  },
  {
    label: 'Électronique', to: '/electronique',
    sub: [
      { label: 'Cuisine', to: '/electronique/cuisine' },
      { label: 'Audio', to: '/electronique/audio' },
      { label: 'Montres', to: '/electronique/montres' },
    ],
  },
  {
    label: 'Accessoires', to: '/accessoires',
    sub: [
      { label: 'Islam', to: '/accessoires/islam' },
      { label: 'Chaussettes', to: '/accessoires/chaussettes' },
      { label: 'Gants', to: '/accessoires/gants' },
    ],
  },
  { label: 'Promotions', to: '/promotions' },
  { label: 'Nouveautés', to: '/nouveautes' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const cartCount = useCartStore((s) => s.getCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishCount = useWishlistStore((s) => s.getCount());
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/boutique?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className={`${s.header} ${scrolled ? s.scrolled : s.transparent}`}>
        {/* Top Bar */}
        <div className={s.topBar}>
          <div className={`${s.topBarContent} container`}>
            <div className={s.topBarLeft}>
              <span><Phone size={11} /> 05 03 74 43 36</span>
              <span><Mail size={11} /> contact@daralhayaa.com</span>
              <span><MapPin size={11} /> Livraison partout en Côte d'Ivoire</span>
            </div>
            <div className={s.topBarRight}>
              <Link to="/suivi-commande">Suivre ma commande</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className={s.mainNav}>
          <div className={`${s.navContent} container`}>
            {/* Logo */}
            <Link to="/" className={s.logo}>
              <div className={s.logoIcon}>🌙</div>
              <div className={s.logoText}>
                <span className={s.logoName}>Dar Al Hayaa</span>
                <span className={s.logoTagline}>Mode Islamique Premium</span>
              </div>
            </Link>

            {/* Nav Links (desktop) */}
            <div className={s.navLinks}>
              {NAV_ITEMS.map((item) => (
                item.sub ? (
                  <div
                    key={item.label}
                    className={s.megaMenuWrapper}
                    onMouseEnter={() => setOpenMega(item.label)}
                    onMouseLeave={() => setOpenMega(null)}
                  >
                    <button className={s.navLink}>
                      {item.label}
                      <ChevronDown size={13} />
                    </button>
                    <AnimatePresence>
                      {openMega === item.label && (
                        <motion.div
                          className={s.megaMenu}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className={s.megaMenuTitle}>{item.label}</div>
                          {item.sub.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.to}
                              className={s.megaMenuLink}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) => `${s.navLink} ${isActive ? s.active : ''}`}
                  >
                    {item.label}
                  </NavLink>
                )
              ))}
            </div>

            {/* Search Bar */}
            <div className={s.searchBar} ref={searchRef}>
              <form onSubmit={handleSearch}>
                <Search size={16} className={s.searchIcon} />
                <input
                  type="text"
                  className={s.searchInput}
                  placeholder="Rechercher hijab, abaya, qamis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                />
              </form>
              <AnimatePresence>
                {showSearch && searchResults.length > 0 && (
                  <motion.div
                    className={s.searchSuggestions}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                  >
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        to={`/produit/${p.id}`}
                        className={s.searchSuggestionItem}
                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div>
                          <div>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>
                            {p.price.toLocaleString()} FCFA
                          </div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nav Actions */}
            <div className={s.navActions}>
              {/* Wishlist */}
              <Link to="/favoris" className={s.navAction} aria-label="Favoris">
                <Heart size={20} />
                {wishCount > 0 && <span className={s.badge}>{wishCount}</span>}
              </Link>

              {/* Cart */}
              <button className={s.navAction} aria-label="Panier" onClick={openCart}>
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className={s.badge}>{cartCount}</span>}
              </button>

              {/* User */}
              <div className={s.megaMenuWrapper}>
                <button
                  className={s.navAction}
                  aria-label="Mon compte"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className={s.megaMenu}
                      style={{ right: 0, left: 'auto', transform: 'none', minWidth: 200 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      {isAuthenticated ? (
                        <>
                          <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(201,168,76,0.15)', marginBottom: 8 }}>
                            <div style={{ fontWeight: 600, color: 'var(--off-white)', fontSize: '0.9rem' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{user.email}</div>
                          </div>
                          <Link to="/compte" className={s.megaMenuLink} onClick={() => setUserMenuOpen(false)}>Mon Compte</Link>
                          <Link to="/compte/commandes" className={s.megaMenuLink} onClick={() => setUserMenuOpen(false)}>Mes Commandes</Link>
                          <Link to="/favoris" className={s.megaMenuLink} onClick={() => setUserMenuOpen(false)}>Mes Favoris</Link>
                          <button
                            className={s.megaMenuLink}
                            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={handleLogout}
                          >
                            <LogOut size={14} /> Déconnexion
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/connexion" className={s.megaMenuLink} onClick={() => setUserMenuOpen(false)}>Se connecter</Link>
                          <Link to="/inscription" className={s.megaMenuLink} onClick={() => setUserMenuOpen(false)}>Créer un compte</Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button className={s.menuToggle} onClick={() => setMobileOpen(true)} aria-label="Menu">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className={s.mobileMenu}>
            <motion.div
              className={s.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={s.mobileDrawer}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={s.mobileMenuHeader}>
                <div className={s.logo}>
                  <div className={s.logoIcon}>🌙</div>
                  <div className={s.logoText}>
                    <span className={s.logoName}>Dar Al Hayaa</span>
                  </div>
                </div>
                <button className={s.menuToggle} onClick={() => setMobileOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <NavLink
                    to={item.to}
                    className={s.mobileNavLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                  {item.sub && (
                    <div style={{ marginLeft: 16, marginTop: 8 }}>
                      {item.sub.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          className={s.mobileNavLink}
                          style={{ fontSize: '0.9rem', color: 'var(--gray-400)' }}
                          onClick={() => setMobileOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/compte" className={s.mobileNavLink} onClick={() => setMobileOpen(false)}>
                      <User size={16} /> Mon Compte
                    </Link>
                    <button
                      className={s.mobileNavLink}
                      style={{ width: '100%', color: 'var(--error)' }}
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/connexion" className={s.mobileNavLink} onClick={() => setMobileOpen(false)}>
                      <User size={16} /> Se connecter
                    </Link>
                    <Link to="/inscription" className={s.mobileNavLink} onClick={() => setMobileOpen(false)}>
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
