import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  
  const from = location.state?.from || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password, formData.rememberMe);
    
    if (result.success) {
      toast.success('Connexion réussie !');
      navigate(from);
    } else {
      toast.error(result.error || 'Erreur lors de la connexion');
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Side - Branding */}
      <div className={styles.leftSide}>
        {/* Decorative elements */}
        <div className={styles.decorativeElements}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.circleRing}></div>
        </div>

        <div className={styles.brandingContent}>
          <div>
            <h1 className={styles.brandingTitle}>
              Dar Al-Hayaa
            </h1>
            <p className={styles.brandingSubtitle}>
              Élégance & Tradition
            </p>
          </div>
          
          <div>
            <p className={styles.brandingDesc}>
              Découvrez notre collection exclusive de vêtements et accessoires islamiques, alliant modernité et tradition.
            </p>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>500+</div>
                <div className={styles.statLabel}>Produits</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>10K+</div>
                <div className={styles.statLabel}>Clients</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>4.9</div>
                <div className={styles.statLabel}>Note</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          {/* Mobile Logo */}
          <div className={styles.mobileLogo}>
            <h1 className={styles.mobileLogoTitle}>Dar Al-Hayaa</h1>
            <p className={styles.mobileLogoSubtitle}>Élégance & Tradition</p>
          </div>

          {/* Form Card */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>
                Bienvenue
              </h2>
              <p className={styles.formSubtitle}>
                Connectez-vous à votre compte pour continuer
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="votre@email.com"
                  />
                  <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.inputLabel}>
                  Mot de passe
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="••••••••"
                  />
                  <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className={styles.formActions}>
                <div className={styles.rememberMe}>
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <label htmlFor="remember-me" className={styles.rememberLabel}>
                    Se souvenir
                  </label>
                </div>

                <Link to="/forgot-password" className={styles.forgotPassword}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>

              <div className={styles.divider}>
                <div className={styles.dividerText}>
                  <span>Ou</span>
                </div>
              </div>

              <div className={styles.registerPrompt}>
                <p>
                  Pas encore de compte ?{' '}
                  <Link to="/register" className={styles.registerLink}>
                    Créer un compte
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Back to home */}
          <div className={styles.backToHome}>
            <Link to="/" className={styles.backLink}>
              <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
