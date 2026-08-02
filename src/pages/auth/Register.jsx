import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    const result = await register(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.password,
      formData.confirmPassword
    );
    
    if (result.success) {
      toast.success(result.message);
      navigate('/login');
    } else {
      toast.error(result.error || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className={styles.registerPage}>
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
              Rejoignez notre communauté et découvrez notre collection exclusive de vêtements et accessoires islamiques.
            </p>
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>
                <svg className={styles.benefitIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Accès aux promotions exclusives</span>
              </div>
              <div className={styles.benefitItem}>
                <svg className={styles.benefitIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Suivi de commande en temps réel</span>
              </div>
              <div className={styles.benefitItem}>
                <svg className={styles.benefitIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Programme fidélité</span>
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
                Créer un compte
              </h2>
              <p className={styles.formSubtitle}>
                Rejoignez-nous en quelques secondes
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.nameRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName" className={styles.inputLabel}>
                    Prénom
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Jean"
                    />
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.inputLabel}>
                    Nom
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Dupont"
                    />
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
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
                <label htmlFor="phone" className={styles.inputLabel}>
                  Téléphone
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="+225 01 02 03 04 05"
                  />
                  <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
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
                    autoComplete="new-password"
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
                <p className={styles.inputHint}>
                  Minimum 8 caractères
                </p>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>
                  Confirmer le mot de passe
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="••••••••"
                  />
                  <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
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
                    <span>Inscription...</span>
                  </>
                ) : (
                  <span>Créer mon compte</span>
                )}
              </button>

              <div className={styles.divider}>
                <div className={styles.dividerText}>
                  <span>Ou</span>
                </div>
              </div>

              <div className={styles.loginPrompt}>
                <p>
                  Déjà un compte ?{' '}
                  <Link to="/login" className={styles.loginLink}>
                    Se connecter
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
