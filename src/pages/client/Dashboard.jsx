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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon compte</h1>
          <p className="mt-2 text-gray-600">
            Bienvenue, {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gold text-navy'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Vue d'ensemble</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-navy to-navy-light rounded-lg p-6 text-white">
                      <ShoppingBag className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Commandes</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gold to-gold-light rounded-lg p-6 text-navy">
                      <Heart className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Favoris</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <Star className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Avis</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="text-gray-900">{user.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h2>
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore de commandes</p>
                    <button
                      onClick={() => navigate('/boutique')}
                      className="mt-4 px-6 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors"
                    >
                      Découvrir nos produits
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h2>
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore de favoris</p>
                    <button
                      onClick={() => navigate('/boutique')}
                      className="mt-4 px-6 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors"
                    >
                      Découvrir nos produits
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes avis</h2>
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore d'avis</p>
                    <p className="text-sm text-gray-400 mt-2">Les avis apparaissent ici après avoir effectué un achat</p>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes adresses</h2>
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Vous n'avez pas encore d'adresses enregistrées</p>
                    <button className="mt-4 px-6 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors">
                      Ajouter une adresse
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du compte</h2>
                  
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le mot de passe</h3>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        Changer mon mot de passe
                      </button>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        Modifier mes informations
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded text-gold focus:ring-gold" />
                          <span className="text-gray-700">Recevoir les offres par email</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded text-gold focus:ring-gold" />
                          <span className="text-gray-700">Recevoir les notifications de commande</span>
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
