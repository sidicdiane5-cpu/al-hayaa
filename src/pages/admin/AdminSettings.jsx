import { useState } from 'react';
import { Save, Bell, Shield, Palette, Globe, Database } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'database', label: 'Base de données', icon: Database },
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-gray-600">Configurer les paramètres du site</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
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
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres généraux</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      defaultValue="Dar Al-Hayaa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description du site
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Votre boutique en ligne de vêtements et accessoires islamiques"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      defaultValue="contact@daralhayaa.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+225 01 02 03 04 05"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Devise
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold">
                      <option value="XOF">FCFA (XOF)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar (USD)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres de notification</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Nouvelles commandes</p>
                      <p className="text-sm text-gray-500">Recevoir une notification pour chaque nouvelle commande</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-gold focus:ring-gold" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Stock faible</p>
                      <p className="text-sm text-gray-500">Alerte quand un produit est en stock faible</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-gold focus:ring-gold" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Nouveaux avis</p>
                      <p className="text-sm text-gray-500">Notification pour les avis en attente de modération</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-gold focus:ring-gold" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Nouveaux clients</p>
                      <p className="text-sm text-gray-500">Notification lors de nouvelles inscriptions</p>
                    </div>
                    <input type="checkbox" className="rounded text-gold focus:ring-gold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres de sécurité</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JWT Secret
                    </label>
                    <input
                      type="password"
                      defaultValue="your-secret-key-change-in-production"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <p className="text-sm text-gray-500 mt-1">Clé secrète pour les tokens JWT</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salt Rounds (bcrypt)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <p className="text-sm text-gray-500 mt-1">Nombre de tours pour le hashage des mots de passe</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Vérification email obligatoire</p>
                      <p className="text-sm text-gray-500">Les utilisateurs doivent vérifier leur email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-gold focus:ring-gold" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">2FA Admin</p>
                      <p className="text-sm text-gray-500">Authentification à deux facteurs pour les admins</p>
                    </div>
                    <input type="checkbox" className="rounded text-gold focus:ring-gold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Apparence</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur principale
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        defaultValue="#1A2E4A"
                        className="w-12 h-12 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        defaultValue="#1A2E4A"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur d'accent
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        defaultValue="#C9A84C"
                        className="w-12 h-12 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        defaultValue="#C9A84C"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Base de données</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-900">Sauvegarde automatique</p>
                    <p className="text-sm text-blue-700">La base de données est sauvegardée automatiquement toutes les 24h</p>
                  </div>

                  <button className="w-full px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light transition-colors">
                    Exporter la base de données
                  </button>

                  <button className="w-full px-4 py-3 border border-navy text-navy rounded-lg font-medium hover:bg-navy hover:text-white transition-colors">
                    Importer une sauvegarde
                  </button>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Dernière sauvegarde: 29/01/2026 à 12:00</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
