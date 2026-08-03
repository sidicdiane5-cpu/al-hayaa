// Store Auth — Zustand + Supabase Auth
// Le contrat public de ce store est inchange : les pages continuent de recevoir
// { success, user, error, message }. Seule l'implementation passe de
// l'API Express locale (localhost:3001) a Supabase.
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Normalise un profil Supabase vers la forme attendue par les composants.
function toUser(profile, authUser) {
  if (!profile && !authUser) return null;
  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  return {
    id: authUser?.id ?? profile?.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || (authUser?.email ?? ''),
    email: profile?.email ?? authUser?.email ?? '',
    phone: profile?.phone ?? '',
    role: profile?.role ?? 'client',
    isActive: profile?.is_active ?? true,
    avatar: authUser?.user_metadata?.avatar_url ?? null,
    createdAt: profile?.created_at ?? null,
    lastLoginAt: profile?.last_login_at ?? null,
  };
}

// Traduit les messages d'erreur Supabase en francais.
function translateError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email ou mot de passe incorrect';
  if (m.includes('email not confirmed')) return "Veuillez confirmer votre email avant de vous connecter";
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Un compte existe deja avec cet email';
  if (m.includes('password should be at least'))
    return 'Le mot de passe doit contenir au moins 6 caracteres';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Trop de tentatives, veuillez patienter quelques instants';
  if (m.includes('failed to fetch') || m.includes('networkerror'))
    return 'Connexion au serveur impossible. Verifiez votre reseau.';
  return message || 'Une erreur est survenue';
}

// Recupere le profil de l'utilisateur connecte.
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[v0] fetchProfile error:', error.message);
    return null;
  }
  return data;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  // true jusqu'a ce que la session Supabase existante soit restauree
  isInitializing: true,
  error: null,

  // ── Connexion ──────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const message = translateError(error.message);
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      const profile = await fetchProfile(data.user.id);

      // Compte desactive par un administrateur
      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        const message = 'Votre compte a ete desactive. Contactez le support.';
        set({ isLoading: false, error: message, user: null, token: null, isAuthenticated: false });
        return { success: false, error: message };
      }

      // Trace de derniere connexion (non bloquant)
      supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id)
        .then(({ error: e }) => e && console.error('[v0] last_login_at:', e.message));

      const user = toUser(profile, data.user);
      set({
        user,
        token: data.session?.access_token ?? null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      const message = translateError(err.message);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // ── Inscription ────────────────────────────────────────────
  register: async (firstName, lastName, email, phone, password, confirmPassword) => {
    set({ isLoading: true, error: null });

    if (password !== confirmPassword) {
      const message = 'Les mots de passe ne correspondent pas';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
    if (!password || password.length < 6) {
      const message = 'Le mot de passe doit contenir au moins 6 caracteres';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Le trigger handle_new_user lit ces metadonnees pour creer le profil.
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone ?? '',
            role: 'client',
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        const message = translateError(error.message);
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      set({ isLoading: false, error: null });

      // Si la confirmation d'email est activee, aucune session n'est creee.
      if (!data.session) {
        return {
          success: true,
          message:
            'Compte cree. Verifiez votre boite mail pour confirmer votre adresse.',
        };
      }

      const profile = await fetchProfile(data.user.id);
      const user = toUser(profile, data.user);
      set({ user, token: data.session.access_token, isAuthenticated: true });
      return { success: true, message: 'Compte cree avec succes', user };
    } catch (err) {
      const message = translateError(err.message);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // ── Deconnexion ────────────────────────────────────────────
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[v0] logout error:', err.message);
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  // ── Restauration / verification de session ─────────────────
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
        return false;
      }

      const profile = await fetchProfile(session.user.id);

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
        return false;
      }

      set({
        user: toUser(profile, session.user),
        token: session.access_token,
        isAuthenticated: true,
        isInitializing: false,
      });
      return true;
    } catch (err) {
      console.error('[v0] checkAuth error:', err.message);
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
      return false;
    }
  },

  // ── Mot de passe oublie ────────────────────────────────────
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      set({ isLoading: false });
      if (error) {
        return { success: false, error: translateError(error.message) };
      }
      return {
        success: true,
        message: 'Un lien de reinitialisation a ete envoye a votre adresse email.',
      };
    } catch (err) {
      const message = translateError(err.message);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // ── Reinitialisation du mot de passe ───────────────────────
  // Le lien recu par email cree deja une session : on met simplement a jour
  // le mot de passe. Le parametre `token` est conserve pour compatibilite.
  resetPassword: async (_token, password, confirmPassword) => {
    set({ isLoading: true, error: null });

    if (password !== confirmPassword) {
      const message = 'Les mots de passe ne correspondent pas';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      set({ isLoading: false });
      if (error) {
        return { success: false, error: translateError(error.message) };
      }
      return { success: true, message: 'Mot de passe mis a jour avec succes' };
    } catch (err) {
      const message = translateError(err.message);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // ── Changement de mot de passe ─────────────────────────────
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ isLoading: true, error: null });

    if (newPassword !== confirmPassword) {
      const message = 'Les mots de passe ne correspondent pas';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }

    try {
      const { user } = get();

      // Supabase ne verifie pas l'ancien mot de passe : on le valide en
      // re-authentifiant l'utilisateur avant la mise a jour.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        const message = 'Mot de passe actuel incorrect';
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      set({ isLoading: false });
      if (error) {
        return { success: false, error: translateError(error.message) };
      }
      return { success: true, message: 'Mot de passe modifie avec succes' };
    } catch (err) {
      const message = translateError(err.message);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // ── Mise a jour du profil ──────────────────────────────────
  updateProfile: async (firstName, lastName, phone) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = get();
      if (!user) {
        set({ isLoading: false });
        return { success: false, error: 'Utilisateur non connecte' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        const message = translateError(error.message);
        set({ isLoading: false, error: message });
        return { success: false, error: message };
      }

      const updated = toUser(data, { id: user.id, email: user.email });
      set({ user: updated, isLoading: false });
      return { success: true, user: updated };
    } catch (err) {
      const message = translateError(err.message);
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // ── Helpers ────────────────────────────────────────────────
  isAdmin: () => {
    const { user } = get();
    return !!user && (user.role === 'admin' || user.role === 'manager');
  },

  isClient: () => {
    const { user } = get();
    return !!user && user.role === 'client';
  },

  clearError: () => set({ error: null }),
}));

// Garde le store synchronise avec la session Supabase (refresh de token,
// deconnexion depuis un autre onglet, lien de reinitialisation, etc.).
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session?.user) {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
    });
    return;
  }

  useAuthStore.setState({ token: session.access_token, isAuthenticated: true });

  // Recharge le profil si absent (ex: restauration au chargement de la page).
  if (!useAuthStore.getState().user) {
    fetchProfile(session.user.id).then((profile) => {
      useAuthStore.setState({
        user: toUser(profile, session.user),
        isInitializing: false,
      });
    });
  } else {
    useAuthStore.setState({ isInitializing: false });
  }
});
