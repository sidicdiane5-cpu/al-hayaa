import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Le lien recu par email ouvre une session de recuperation.
  const [hasSession, setHasSession] = useState(null);

  useEffect(() => {
    // Supabase traite le fragment de l'URL puis emet PASSWORD_RECOVERY.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession((prev) => prev ?? !!session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await resetPassword(null, password, confirmPassword);

    if (result.success) {
      toast.success(result.message);
      navigate('/login');
    } else {
      toast.error(result.error || 'Erreur lors de la reinitialisation');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-navy-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Choisissez un nouveau mot de passe pour votre compte
          </p>
        </div>

        {hasSession === false ? (
          <div className="mt-8 space-y-6 text-center">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-200">
                Ce lien de réinitialisation est invalide ou a expiré. Veuillez en
                demander un nouveau.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-navy bg-gold hover:bg-gold-light transition-colors"
            >
              Demander un nouveau lien
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-navy bg-gold hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="font-medium text-gold hover:text-gold-light transition-colors">
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
