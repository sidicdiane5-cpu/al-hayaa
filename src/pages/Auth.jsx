import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = login(email, password);
    if (result.success) {
      toast.success(`Bienvenue ${result.user.name} ! 🌙`, {
        style: { background: 'var(--navy)', color: 'var(--off-white)', border: '1px solid var(--gold)' },
      });
      navigate(result.user.role === 'admin' ? '/admin' : '/compte');
    } else {
      toast.error(result.message || 'Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Connexion — Dar Al Hayaa</title></Helmet>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.authLogo}>
              <div className={styles.logoIcon}>🌙</div>
              <div className={styles.logoText}>Dar Al Hayaa</div>
            </div>
            <h1 className={styles.authTitle}>Connexion</h1>
            <p className={styles.authSubtitle}>Accédez à votre espace personnel</p>

            {/* Demo hint */}
            <div className={styles.demoHint}>
              <strong>Démo Admin :</strong> admin@daralhayaa.com / admin123
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrap}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Mot de passe</label>
                  <Link to="/mot-de-passe-oublie" className={styles.forgotLink}>Oublié ?</Link>
                </div>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <div className={styles.spinner} />
                ) : (
                  <><ArrowRight size={18} /> Se connecter</>
                )}
              </button>
            </form>

            <p className={styles.switchText}>
              Pas encore de compte ?{' '}
              <Link to="/inscription" className={styles.switchLink}>Créer un compte</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = register(name, email, password);
    if (result.success) {
      toast.success(`Bienvenue ${name} ! Compte créé avec succès. 🌙`, {
        style: { background: 'var(--navy)', color: 'var(--off-white)', border: '1px solid var(--gold)' },
      });
      navigate('/compte');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Créer un Compte — Dar Al Hayaa</title></Helmet>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.authLogo}>
              <div className={styles.logoIcon}>🌙</div>
              <div className={styles.logoText}>Dar Al Hayaa</div>
            </div>
            <h1 className={styles.authTitle}>Créer un Compte</h1>
            <p className={styles.authSubtitle}>Rejoignez notre communauté</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nom complet</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input type="text" className={styles.input} placeholder="Votre nom"
                    value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <div className={styles.inputWrap}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input type="email" className={styles.input} placeholder="votre@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Mot de passe</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input type={showPwd ? 'text' : 'password'} className={styles.input} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <div className={styles.spinner} /> : <><ArrowRight size={18} /> S'inscrire</>}
              </button>
            </form>

            <p className={styles.switchText}>
              Déjà un compte ?{' '}
              <Link to="/connexion" className={styles.switchLink}>Se connecter</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
