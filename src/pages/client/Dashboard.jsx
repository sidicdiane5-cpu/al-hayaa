import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { User, ShoppingBag, Heart, Star, MapPin, LogOut, Settings } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: User },
    { id: 'orders', label: 'Mes commandes', icon: ShoppingBag },
    { id: 'favorites', label: 'Mes favoris', icon: Heart },
    { id: 'reviews', label: 'Mes avis', icon: Star },
    { id: 'addresses', label: 'Mes adresses', icon: MapPin },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div style={{ minHeight: '80vh', padding: 'var(--space-12) var(--space-4)', backgroundColor: 'var(--beige)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>
            Mon compte
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-lg)' }}>
            Bienvenue, {user.firstName} {user.lastName}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-8)' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        backgroundColor: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--navy)' : 'var(--gray-600)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                        fontSize: 'var(--text-base)',
                      }}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--gray-200)' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--error)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    fontSize: 'var(--text-base)',
                  }}
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div>
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'overview' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                    Vue d'ensemble
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    <div style={{ background: 'var(--gradient-navy)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', color: 'var(--white)' }}>
                      <ShoppingBag size={32} style={{ marginBottom: 'var(--space-2)' }} />
                      <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>Commandes</p>
                      <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 600 }}>0</p>
                    </div>
                    
                    <div style={{ background: 'var(--gradient-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', color: 'var(--navy)' }}>
                      <Heart size={32} style={{ marginBottom: 'var(--space-2)' }} />
                      <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>Favoris</p>
                      <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 600 }}>0</p>
                    </div>
                    
                    <div style={{ background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', color: 'var(--white)' }}>
                      <Star size={32} style={{ marginBottom: 'var(--space-2)' }} />
                      <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>Avis</p>
                      <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 600 }}>0</p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-4)' }}>
                      Informations personnelles
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Nom complet</p>
                        <p style={{ color: 'var(--navy)' }}>{user.firstName} {user.lastName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Email</p>
                        <p style={{ color: 'var(--navy)' }}>{user.email}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Téléphone</p>
                        <p style={{ color: 'var(--navy)' }}>{user.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                    Mes commandes
                  </h2>
                  <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <ShoppingBag size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                    <p style={{ color: 'var(--gray-500)' }}>Vous n'avez pas encore de commandes</p>
                    <button
                      onClick={() => navigate('/boutique')}
                      style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-2) var(--space-6)',
                        backgroundColor: 'var(--gold)',
                        color: 'var(--navy)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}
                    >
                      Découvrir nos produits
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                    Mes favoris
                  </h2>
                  <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <Heart size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                    <p style={{ color: 'var(--gray-500)' }}>Vous n'avez pas encore de favoris</p>
                    <button
                      onClick={() => navigate('/boutique')}
                      style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-2) var(--space-6)',
                        backgroundColor: 'var(--gold)',
                        color: 'var(--navy)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}
                    >
                      Découvrir nos produits
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                    Mes avis
                  </h2>
                  <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <Star size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                    <p style={{ color: 'var(--gray-500)' }}>Vous n'avez pas encore d'avis</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: 'var(--space-2)' }}>
                      Les avis apparaissent ici après avoir effectué un achat
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                    Mes adresses
                  </h2>
                  <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <MapPin size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                    <p style={{ color: 'var(--gray-500)' }}>Vous n'avez pas encore d'adresses enregistrées</p>
                    <button style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-2) var(--space-6)',
                      backgroundColor: 'var(--gold)',
                      color: 'var(--navy)',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}>
                      Ajouter une adresse
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                    Paramètres du compte
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 'var(--space-6)' }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-4)' }}>
                        Modifier le mot de passe
                      </h3>
                      <button style={{
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'transparent',
                        color: 'var(--gray-600)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}>
                        Changer mon mot de passe
                      </button>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: 'var(--space-6)' }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-4)' }}>
                        Informations personnelles
                      </h3>
                      <button style={{
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'transparent',
                        color: 'var(--gray-600)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}>
                        Modifier mes informations
                      </button>
                    </div>

                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-4)' }}>
                        Préférences
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ accentColor: 'var(--gold)' }} />
                          <span style={{ color: 'var(--gray-600)' }}>Recevoir les offres par email</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ accentColor: 'var(--gold)' }} />
                          <span style={{ color: 'var(--gray-600)' }}>Recevoir les notifications de commande</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
