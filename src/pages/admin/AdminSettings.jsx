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
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--navy)' }}>
          Paramètres
        </h1>
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Configurer les paramètres du site</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Sidebar */}
        <div style={{ gridColumn: 'span 1' }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-sm)' }}>
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
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--navy)' : 'var(--gray-700)',
                    }}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div style={{ gridColumn: 'span 3' }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
            {activeTab === 'general' && (
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                  Paramètres généraux
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Nom du site
                    </label>
                    <input
                      type="text"
                      defaultValue="Dar Al-Hayaa"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Description du site
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Votre boutique en ligne de vêtements et accessoires islamiques"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Email de contact
                    </label>
                    <input
                      type="email"
                      defaultValue="contact@daralhayaa.com"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+225 01 02 03 04 05"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Devise
                    </label>
                    <select style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-4)',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                    }}>
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
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                  Paramètres de notification
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>Nouvelles commandes</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Recevoir une notification pour chaque nouvelle commande</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>Stock faible</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Alerte quand un produit est en stock faible</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>Nouveaux avis</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Notification pour les avis en attente de modération</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>Nouveaux clients</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Notification lors de nouvelles inscriptions</p>
                    </div>
                    <input type="checkbox" style={{ accentColor: 'var(--gold)' }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                  Paramètres de sécurité
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      JWT Secret
                    </label>
                    <input
                      type="password"
                      defaultValue="your-secret-key-change-in-production"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Clé secrète pour les tokens JWT</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Salt Rounds (bcrypt)
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Nombre de tours pour le hashage des mots de passe</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>Vérification email obligatoire</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Les utilisateurs doivent vérifier leur email</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>2FA Admin</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Authentification à deux facteurs pour les admins</p>
                    </div>
                    <input type="checkbox" style={{ accentColor: 'var(--gold)' }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                  Apparence
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Couleur principale
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <input
                        type="color"
                        defaultValue="#1A2E4A"
                        style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)' }}
                      />
                      <input
                        type="text"
                        defaultValue="#1A2E4A"
                        style={{
                          flex: 1,
                          padding: 'var(--space-2) var(--space-4)',
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Couleur d'accent
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <input
                        type="color"
                        defaultValue="#C9A84C"
                        style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)' }}
                      />
                      <input
                        type="text"
                        defaultValue="#C9A84C"
                        style={{
                          flex: 1,
                          padding: 'var(--space-2) var(--space-4)',
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                      Logo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-4)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)', marginBottom: 'var(--space-6)' }}>
                  Base de données
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ padding: 'var(--space-4)', backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontWeight: 500, color: '#1E40AF' }}>Sauvegarde automatique</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: '#1E3A8A' }}>La base de données est sauvegardée automatiquement toutes les 24h</p>
                  </div>

                  <button style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--navy)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                  }}>
                    Exporter la base de données
                  </button>

                  <button style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--navy)',
                    color: 'var(--navy)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}>
                    Importer une sauvegarde
                  </button>

                  <div style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--gray-200)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>Dernière sauvegarde: 29/01/2026 à 12:00</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-6)',
                  backgroundColor: 'var(--gold)',
                  color: 'var(--navy)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                <Save size={20} />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
