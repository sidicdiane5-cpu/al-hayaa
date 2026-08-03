// Fonction serverless Vercel : POST /api/upload
export { default } from './_upload-handler.mjs';

// Le handler lit le flux brut lui-meme : on desactive le parsing automatique
// du corps de requete, sinon les octets de l'image seraient consommes.
export const config = {
  api: {
    bodyParser: false,
  },
};
