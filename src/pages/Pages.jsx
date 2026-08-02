import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { FAQ_ITEMS } from '../data/products';
import { useState, useEffect } from 'react';
import styles from './Pages.module.css';

// ── Contact Page ──
export function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <Helmet><title>Contact — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <span className="section-tag">Nous contacter</span>
          <h1 className={styles.heroTitle}>Parlons-en !</h1>
          <p className={styles.heroDesc}>Notre équipe est disponible 7j/7 pour vous aider.</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className={styles.contactLayout}>
          <div className={styles.contactInfo}>
            {[
              { icon: <Phone size={20} />, label: 'Téléphone', value: '05 03 74 43 36', sub: 'Lun-Sam 9h-19h' },
              { icon: <Mail size={20} />, label: 'Email', value: 'contact@daralhayaa.com', sub: 'Réponse sous 24h' },
              { icon: <MapPin size={20} />, label: 'Adresse', value: 'Cocody, Abidjan', sub: 'France' },
              { icon: <Clock size={20} />, label: 'Horaires', value: 'Lun-Sam 9h-19h', sub: 'Dimanche fermé' },
            ].map((item, i) => (
              <div key={i} className={styles.infoCard}>
                <div className={styles.infoIcon}>{item.icon}</div>
                <div>
                  <div className={styles.infoLabel}>{item.label}</div>
                  <div className={styles.infoValue}>{item.value}</div>
                  <div className={styles.infoSub}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Envoyer un message</h2>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Prénom</label>
                <input type="text" className={styles.input} placeholder="Votre prénom" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nom</label>
                <input type="text" className={styles.input} placeholder="Votre nom" required />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input type="email" className={styles.input} placeholder="votre@email.com" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Sujet</label>
              <select className={styles.input}>
                <option>Commande & Livraison</option>
                <option>Retour & Remboursement</option>
                <option>Produit & Stock</option>
                <option>Autre</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Message</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Décrivez votre demande..."
                rows={5}
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              {sent ? '✅ Message envoyé !' : <><Send size={16} /> Envoyer le message</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ── FAQ Page ──
export function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <Helmet><title>FAQ — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <span className="section-tag">Questions fréquentes</span>
          <h1 className={styles.heroTitle}>FAQ</h1>
          <p className={styles.heroDesc}>Toutes les réponses à vos questions les plus fréquentes.</p>
        </div>
      </div>

      <div className="container-sm section">
        {FAQ_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <button className={styles.faqQuestion} onClick={() => setOpen(open === i ? null : i)}>
              {item.question}
              <span className={styles.faqToggle}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <motion.div
                className={styles.faqAnswer}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {item.answer}
              </motion.div>
            )}
          </motion.div>
        ))}

        <div className={styles.faqCta}>
          <p>Vous n'avez pas trouvé votre réponse ?</p>
          <Link to="/contact" className={styles.faqCtaBtn}>Contacter notre équipe</Link>
        </div>
      </div>
    </>
  );
}

// ── About Page ──
export function AboutPage() {
  return (
    <>
      <Helmet><title>À Propos — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <span className="section-tag">Notre Histoire</span>
          <h1 className={styles.heroTitle}>À Propos de Dar Al Hayaa</h1>
          <p className={styles.heroDesc}>Une passion pour la mode islamique, une mission de qualité.</p>
        </div>
      </div>

      <div className="container-sm section">
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2 className={styles.aboutTitle}>Notre Mission</h2>
            <p>
              Dar Al Hayaa est née d'une conviction simple : chaque femme et chaque homme mérite de s'habiller 
              avec élégance, qualité et dans le respect de ses valeurs islamiques. 
            </p>
            <p>
              Notre boutique propose une sélection rigoureuse de vêtements pudiques, 
              accessoires islamiques, parfums halal et équipements électroniques, le tout 
              dans un cadre de confiance et de qualité certifiée.
            </p>
            <h2 className={styles.aboutTitle} style={{ marginTop: 32 }}>Nos Valeurs</h2>
            <div className={styles.values}>
              {[
                { emoji: '✦', title: 'Qualité', desc: 'Chaque article est sélectionné avec soin pour sa durabilité et son authenticité.' },
                { emoji: '🌙', title: 'Confiance', desc: 'Certifications halal, paiement sécurisé et service client transparent.' },
                { emoji: '💛', title: 'Communauté', desc: '+15 000 familles nous font confiance à travers toute la Côte d\'Ivoire.' },
                { emoji: '🌿', title: 'Éthique', desc: 'Partenariats avec des artisans respectueux des traditions islamiques.' },
              ].map((v, i) => (
                <div key={i} className={styles.valueCard}>
                  <div className={styles.valueEmoji}>{v.emoji}</div>
                  <div>
                    <div className={styles.valueTitle}>{v.title}</div>
                    <div className={styles.valueDesc}>{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Legal Pages ──
export function PrivacyPage() {
  return (
    <>
      <Helmet><title>Politique de Confidentialité — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Politique de Confidentialité</h1>
        </div>
      </div>
      <div className="container-sm section">
        <div className={styles.legalContent}>
          <h2>1. Données collectées</h2>
          <p>Nous collectons uniquement les données nécessaires à votre commande : nom, prénom, adresse email, adresse de livraison, numéro de téléphone et informations de paiement. Ces données sont stockées de manière sécurisée dans notre base de données.</p>
          
          <h2>2. Utilisation des données</h2>
          <p>Vos données personnelles sont utilisées exclusivement pour :</p>
          <ul>
            <li>Traiter et expédier vos commandes</li>
            <li>Vous envoyer les confirmations de commande et mises à jour de livraison</li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
            <li>Vous contacter si nécessaire concernant votre commande</li>
          </ul>
          <p><strong>Vos données ne sont jamais vendues à des tiers.</strong></p>
          
          <h2>3. Protection des données</h2>
          <p>Nous utilisons des protocoles de sécurité avancés (SSL 256-bit) pour protéger vos données. Notre base de données est sécurisée et accessible uniquement par le personnel autorisé.</p>
          
          <h2>4. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> Modifier vos données inexactes</li>
            <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à privacy@daralhayaa.com</p>
          
          <h2>5. Cookies</h2>
          <p>Nous utilisons des cookies techniques essentiels au fonctionnement du site (panier, authentification). Avec votre consentement, nous utilisons également des cookies analytiques pour améliorer notre service.</p>
          
          <h2>6. Conservation des données</h2>
          <p>Vos données sont conservées pendant la durée nécessaire au traitement de vos commandes et conformément aux obligations légales (5 ans pour les données comptables).</p>
          
          <h2>7. Contact</h2>
          <p>Pour toute question concernant votre confidentialité : privacy@daralhayaa.com ou 05 03 74 43 36</p>
        </div>
      </div>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <Helmet><title>Conditions Générales de Vente — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Conditions Générales de Vente</h1>
        </div>
      </div>
      <div className="container-sm section">
        <div className={styles.legalContent}>
          <h2>1. Objet</h2>
          <p>Les présentes Conditions Générales de Vente (CGV) régissent toutes les ventes de produits effectuées sur le site internet Dar Al Hayaa entre la société Dar Al Hayaa et tout acheteur.</p>
          
          <h2>2. Acceptation des conditions</h2>
          <p>Le fait de passer commande sur notre site implique l'acceptation pleine et entière des présentes CGV. Ces conditions sont accessibles à tout moment sur le site et prévalent sur tout autre document.</p>
          
          <h2>3. Produits</h2>
          <p>Les produits proposés à la vente sont décrits et présentés avec la plus grande précision possible. Cependant, si des erreurs ou omissions ont pu se produire, notre responsabilité ne pourra être engagée. Les photos sont contractuelles mais la couleur peut varier légèrement selon votre écran.</p>
          
          <h2>4. Commandes</h2>
          <p>Toute commande validée par le client ne sera considérée comme définitive qu'après confirmation du paiement. Une confirmation de commande sera envoyée par email à l'adresse fournie par le client.</p>
          
          <h2>5. Prix</h2>
          <p>Les prix sont indiqués en euros TTC (toutes taxes comprises). Dar Al Hayaa se réserve le droit de modifier ses prix à tout moment mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.</p>
          
          <h2>6. Paiement</h2>
          <p>Le paiement est exigible immédiatement à la commande. Nous acceptons les moyens de paiement suivants :</p>
          <ul>
            <li>Orange Money</li>
            <li>MTN Money</li>
            <li>Wave</li>
          </ul>
          <p>Les transactions sont sécurisées via SSL. Dar Al Hayaa ne stocke jamais vos informations bancaires complètes.</p>
          
          <h2>7. Livraison</h2>
          <p>Les produits sont livrés à l'adresse indiquée par le client lors de la commande. Les délais de livraison sont de 3 à 5 jours ouvrables pour la Côte d'Ivoire. La livraison est gratuite dès 80€ d'achat, sinon 5.99€.</p>
          
          <h2>8. Droit de rétractation</h2>
          <p>Conformément à la législation en vigueur, vous disposez d'un délai de 30 jours à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.</p>
          
          <h2>9. Retours et remboursements</h2>
          <p>Les articles retournés doivent être neufs, non portés, dans leur emballage d'origine et accompagnés de tous les accessoires. Les frais de retour sont à la charge du client sauf si le produit est défectueux. Le remboursement sera effectué sous 5 à 7 jours ouvrables après réception et vérification du produit.</p>
          
          <h2>10. Garantie</h2>
          <p>Tous nos produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés. En cas de défaut, vous pouvez demander le remplacement ou le remboursement du produit.</p>
          
          <h2>11. Propriété intellectuelle</h2>
          <p>Tous les éléments du site Dar Al Hayaa (textes, images, vidéos, logos) sont protégés par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
          
          <h2>12. Données personnelles</h2>
          <p>Les informations collectées sont nécessaires au traitement de vos commandes et font l'objet d'un traitement conforme à notre Politique de Confidentialité.</p>
          
          <h2>13. Litiges</h2>
          <p>En cas de litige, le client est invité à contacter le service client avant toute action contentieuse. Si aucun accord n'est trouvé, le litige sera soumis aux tribunaux compétents.</p>
          
          <h2>14. Contact</h2>
          <p>Pour toute question relative aux CGV : contact@daralhayaa.com ou 05 03 74 43 36</p>
        </div>
      </div>
    </>
  );
}

export function ShippingPage() {
  return (
    <>
      <Helmet><title>Politique de Livraison — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Politique de Livraison</h1>
        </div>
      </div>
      <div className="container-sm section">
        <div className={styles.legalContent}>
          <h2>1. Zones de livraison</h2>
          <p>Nous livrons dans toute la Côte d'Ivoire (Abidjan, Bouaké, Yamoussoukro, Korhogo, San-Pédro, etc.) et dans les pays limitrophes.</p>
          
          <h2>2. Délais de livraison</h2>
          <ul>
            <li><strong>Abidjan et environs :</strong> 2 à 3 jours ouvrables</li>
            <li><strong>Intérieur de la Côte d'Ivoire :</strong> 3 à 5 jours ouvrables</li>
            <li><strong>Pays limitrophes :</strong> 5 à 7 jours ouvrables</li>
          </ul>
          
          <h2>3. Frais de livraison</h2>
          <ul>
            <li><strong>Gratuite</strong> dès 80€ d'achat en Côte d'Ivoire</li>
            <li><strong>5.99€</strong> pour les commandes inférieures à 80€</li>
            <li><strong>12.99€</strong> pour les livraisons internationales</li>
          </ul>
          
          <h2>4. Modes de livraison</h2>
          <p>Nous proposons plusieurs options de livraison :</p>
          <ul>
            <li><strong>Livraison à domicile :</strong> Notre livreur vous remet votre colis directement à votre adresse</li>
            <li><strong>Point relais :</strong> Retrait dans l'un de nos points de relais partenaires</li>
            <li><strong>Click & Collect :</strong> Retrait en magasin (disponible à Abidjan)</li>
          </ul>
          
          <h2>5. Suivi de commande</h2>
          <p>Vous recevrez un email de confirmation avec un numéro de suivi dès l'expédition de votre commande. Vous pouvez suivre l'avancement de votre livraison en temps réel sur la page "Suivi de commande" de notre site.</p>
          
          <h2>6. Réception de la commande</h2>
          <p>À la réception de votre colis, nous vous recommandons de :</p>
          <ul>
            <li>Vérifier l'intégrité de l'emballage</li>
            <li>Contrôler la conformité des produits</li>
            <li>Signaler tout dommage immédiatement au livreur</li>
          </ul>
          
          <h2>7. Absence lors de la livraison</h2>
          <p>Si vous êtes absent lors de la livraison, le livrera laissera un avis de passage. Vous pourrez contacter le service client pour convenir d'une nouvelle livraison ou récupérer votre colis au point relais indiqué.</p>
          
          <h2>8. Retours et échanges</h2>
          <p>En cas de produit non conforme ou défectueux, contactez-nous dans les 48h suivant la réception. Nous organiserons le retour et l'échange ou le remboursement selon vos préférences.</p>
          
          <h2>9. Contact</h2>
          <p>Pour toute question relative à la livraison : contact@daralhayaa.com ou 05 03 74 43 36</p>
        </div>
      </div>
    </>
  );
}

export function OrderTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Pré-remplir si on vient du checkout
  useEffect(() => {
    if (location.state?.trackingId) {
      setTrackingId(location.state.trackingId);
    }
  }, [location.state]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/orders/tracking/${trackingId}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Commande non trouvée');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Suivi de Commande — Dar Al Hayaa</title></Helmet>
      <div className={styles.pageHero}>
        <div className="container">
          <span className="section-tag">Tracking</span>
          <h1 className={styles.heroTitle}>Suivi de Commande</h1>
        </div>
      </div>
      <div className="container-sm section">
        <form className={styles.trackForm} onSubmit={handleTrack}>
          <input
            type="text"
            className={styles.trackInput}
            placeholder="Entrez votre numéro de commande (ex: ORD-1234567890)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            required
          />
          <button type="submit" className={styles.trackBtn} disabled={loading}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '16px', 
            borderRadius: '8px', 
            marginTop: '24px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {result && (
          <motion.div
            className={styles.trackResult}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.trackHeader}>
              <div>
                <div className={styles.trackId}>Commande {result.id}</div>
                <div className={styles.trackStatus}>📦 {result.status}</div>
                {result.tracking_number && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                    Numéro de suivi : {result.tracking_number}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.trackSteps}>
              {result.steps.map((step, i) => (
                <div key={i} className={`${styles.step} ${step.done ? styles.stepDone : ''}`}>
                  <div className={styles.stepDot} />
                  {i < result.steps.length - 1 && <div className={styles.stepLine} />}
                  <div className={styles.stepInfo}>
                    <div className={styles.stepLabel}>{step.label}</div>
                    <div className={styles.stepDate}>{step.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
