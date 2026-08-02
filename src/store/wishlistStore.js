// Store Favoris — Zustand + Supabase
// Les favoris d'un visiteur non connecte restent en local (persist) et sont
// synchronises vers Supabase des qu'il se connecte.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addFavorite, removeFavorite, getFavorites } from '../lib/api';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      isLoading: false,

      setUserId: (userId) => set({ userId }),

      // Ajouter / Retirer des favoris
      toggleItem: async (product) => {
        const { items, userId } = get();
        const exists = items.find((i) => i.id === product.id);

        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) });
          if (userId) {
            try {
              await removeFavorite(userId, product.id);
            } catch (error) {
              console.error('[v0] Erreur suppression favori:', error.message);
            }
          }
          return false; // retire
        }

        set({ items: [...items, { ...product, favoriteId: null }] });
        if (userId) {
          try {
            const favoriteId = await addFavorite(userId, product.id);
            set({
              items: get().items.map((i) =>
                i.id === product.id ? { ...i, favoriteId } : i
              ),
            });
          } catch (error) {
            console.error('[v0] Erreur ajout favori:', error.message);
          }
        }
        return true; // ajoute
      },

      isInWishlist: (productId) => get().items.some((i) => i.id === productId),

      removeItem: async (productId) => {
        const { items, userId } = get();
        set({ items: items.filter((i) => i.id !== productId) });

        if (userId) {
          try {
            await removeFavorite(userId, productId);
          } catch (error) {
            console.error('[v0] Erreur suppression favori:', error.message);
          }
        }
      },

      clearWishlist: () => set({ items: [] }),

      getCount: () => get().items.length,

      // Charge les favoris depuis Supabase et fusionne les favoris locaux
      // ajoutes avant la connexion.
      loadFavorites: async (userId) => {
        if (!userId) return;
        set({ isLoading: true, userId });

        try {
          const remote = await getFavorites();
          const remoteIds = new Set(remote.map((p) => p.id));

          // Favoris ajoutes hors connexion -> on les pousse en base.
          const pending = get().items.filter((i) => !remoteIds.has(i.id));
          for (const item of pending) {
            try {
              await addFavorite(userId, item.id);
            } catch (error) {
              console.error('[v0] Erreur sync favori:', error.message);
            }
          }

          const merged = pending.length ? await getFavorites() : remote;
          set({ items: merged, isLoading: false });
        } catch (error) {
          console.error('[v0] Erreur chargement favoris:', error.message);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'daralhayaa-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
