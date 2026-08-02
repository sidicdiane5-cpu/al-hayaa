import { Link } from 'react-router-dom';
import { Lock, Home } from 'lucide-react';
import styles from './Forbidden.module.css';

export default function Forbidden() {
  return (
    <div className={styles.forbiddenPage}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <Lock className={styles.lockIcon} size={64} />
        </div>
        
        <h1 className={styles.title}>403</h1>
        <h2 className={styles.subtitle}>Accès Interdit</h2>
        
        <p className={styles.message}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Cette zone est réservée aux administrateurs et gestionnaires autorisés.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <Link to="/admin" className={styles.secondaryButton}>
            Essayer de se connecter
          </Link>
        </div>

        <div className={styles.securityInfo}>
          <p className={styles.securityText}>
            <svg className={styles.securityIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Cette tentative d'accès a été enregistrée
          </p>
        </div>
      </div>
    </div>
  );
}
