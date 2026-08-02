import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Les variables fournies par l'integration Supabase de Vercel sont prefixees
  // NEXT_PUBLIC_. On autorise ce prefixe (en plus de VITE_) afin que
  // import.meta.env les expose au client, en local comme sur Vercel.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
