import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password, true);
    
    if (result.success) {
      toast.success('Connexion admin réussie !');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.error || 'Erreur lors de la connexion');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--navy)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: 'var(--space-4)',
          }}>🌙</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 600,
            color: 'var(--gold)',
            marginBottom: 'var(--space-2)',
          }}>
            Dar Al-Hayaa
          </h1>
          <p style={{
            color: 'var(--gray-400)',
          }}>
            Administration
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{
            marginBottom: 'var(--space-6)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
              color: 'var(--navy)',
              marginBottom: 'var(--space-2)',
            }}>
              Connexion Administrateur
            </h2>
            <p style={{
              color: 'var(--gray-500)',
              fontSize: 'var(--text-sm)',
            }}>
              Accès réservé au personnel autorisé
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--gray-700)',
              }}>
                Email administrateur
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@daralhayaa.com"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    paddingLeft: '44px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    outline: 'none',
                    transition: 'border-color var(--transition-base)',
                  }}
                />
                <svg style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                  width: 20,
                  height: 20,
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--gray-700)',
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    paddingLeft: '44px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    outline: 'none',
                    transition: 'border-color var(--transition-base)',
                  }}
                />
                <svg style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                  width: 20,
                  height: 20,
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--gold)',
                color: 'var(--navy)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {isLoading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                  </svg>
                  <span>Connexion...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--gray-100)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            <svg style={{ color: 'var(--gray-500)', width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--gray-600)',
              margin: 0,
            }}>
              Accès sécurisé. Toute tentative d'accès non autorisée sera enregistrée.
            </p>
          </div>
        </div>

        {/* Back to site */}
        <div style={{
          marginTop: 'var(--space-6)',
          textAlign: 'center',
        }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--gray-400)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            transition: 'color var(--transition-base)',
          }}>
            <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
