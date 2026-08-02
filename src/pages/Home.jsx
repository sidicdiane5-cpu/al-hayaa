import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, RefreshCw, Award, PhoneCall } from 'lucide-react';
import HeroCarousel from '../components/home/HeroCarousel';
import ProductCard from '../components/product/ProductCard';
import { PRODUCTS, CATEGORIES, REVIEWS } from '../data/products';
import styles from './Home.module.css';

// Section apparition au scroll
const FadeInSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const FEATURES = [
  { icon: <Truck size={24} />, title: 'Livraison Offerte', desc: 'Dès 80€ d\'achat partout en Côte d\'Ivoire' },
  { icon: <Shield size={24} />, title: 'Paiement Sécurisé', desc: 'Cryptage SSL 256 bits garanti' },
  { icon: <RefreshCw size={24} />, title: 'Retours 30 Jours', desc: 'Retours faciles et remboursement rapide' },
  { icon: <Award size={24} />, title: 'Qualité Certifiée', desc: 'Produits sélectionnés avec soin' },
  { icon: <PhoneCall size={24} />, title: 'Support 7j/7', desc: 'Équipe disponible pour vous aider' },
];

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Dar Al Hayaa — Mode Islamique Haut de Gamme | Vêtements Pudiques</title>
        <meta name="description" content="Boutique islamique premium : abayas, hijabs, qamis, accessoires, parfums halal et électronique. Qualité, élégance et confiance." />
      </Helmet>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features Bar */}
      <section className={styles.featuresBar}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className={styles.featureItem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <FadeInSection>
            <div className="section-header">
              <span className="section-tag">Découvrez Nos Univers</span>
              <h2 className="section-title">Nos <span className="gold-text">Catégories</span></h2>
              <div className="gold-line" />
              <p className="section-subtitle">Une sélection raffinée pour chaque membre de votre famille, dans le respect de vos valeurs.</p>
            </div>
          </FadeInSection>

          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat, i) => (
              <FadeInSection key={cat.id} delay={i * 0.1}>
                <Link to={`/${cat.id}`} className={styles.categoryCard}>
                  <div className={styles.categoryImageWrap}>
                    <img src={cat.image} alt={cat.name} className={styles.categoryImage} loading="lazy" />
                    <div className={styles.categoryOverlay} style={{ background: `linear-gradient(180deg, transparent 30%, ${cat.color}cc 100%)` }} />
                  </div>
                  <div className={styles.categoryContent}>
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    <div className={styles.categoryNameAr}>{cat.nameAr}</div>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    <p className={styles.categoryCount}>{cat.count} articles</p>
                    <div className={styles.categoryArrow}>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`${styles.featuredSection} section`}>
        <div className="container">
          <FadeInSection>
            <div className="section-header">
              <span className="section-tag">Sélection Premium</span>
              <h2 className="section-title">Notre <span className="gold-text">Coup de Cœur</span></h2>
              <div className="gold-line" />
            </div>
          </FadeInSection>
          <div className={styles.productsGrid}>
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link to="/boutique" className={styles.viewAllBtn}>
              Voir toute la collection <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className={`${styles.featuredSection} section`}>
        <div className="container">
          <FadeInSection>
            <div className="section-header">
              <span className="section-tag" style={{ color: 'var(--error)' }}>🔥 Promotions</span>
              <h2 className="section-title">Nos <span className="gold-text">Offres Spéciales</span></h2>
              <div className="gold-line" />
            </div>
          </FadeInSection>
          <div className={styles.productsGrid}>
            {PRODUCTS.filter(p => p.discount > 0).slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link to="/promotions" className={styles.viewAllBtn}>
              Voir toutes les promotions <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <FadeInSection>
        <section className={styles.promoBanner}>
          <div className="container">
            <div className={styles.promoBannerInner}>
              <div className={styles.promoText}>
                <span className={styles.promoTag}>✨ Offre Spéciale</span>
                <h2 className={styles.promoTitle}>
                  Profitez de <span className={styles.promoHighlight}>-25%</span> sur toute la beauté
                </h2>
                <p className={styles.promoDesc}>Code : <strong>BEAUTE25</strong> · Valable jusqu'au 31 janvier 2025</p>
                <Link to="/beaute" className={styles.promoBtn}>
                  Découvrir les offres <ArrowRight size={18} />
                </Link>
              </div>
              <div className={styles.promoOrb} />
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <FadeInSection>
            <div className={styles.splitHeader}>
              <div>
                <span className="section-tag">Tout Frais</span>
                <h2 className="section-title">Nouveautés</h2>
              </div>
              <Link to="/nouveautes" className={styles.seeAllLink}>
                Tout voir <ArrowRight size={16} />
              </Link>
            </div>
          </FadeInSection>
          <div className={styles.productsGrid4}>
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className={`${styles.bestsellerSection} section`}>
        <div className="container">
          <FadeInSection>
            <div className={styles.splitHeader}>
              <div>
                <span className="section-tag">Plébiscités</span>
                <h2 className="section-title light">Meilleures Ventes</h2>
              </div>
              <Link to="/boutique?sort=bestsellers" className={`${styles.seeAllLink} ${styles.seeAllLinkLight}`}>
                Tout voir <ArrowRight size={16} />
              </Link>
            </div>
          </FadeInSection>
          <div className={styles.productsGrid4}>
            {bestsellers.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section">
        <div className="container">
          <FadeInSection>
            <div className="section-header">
              <span className="section-tag">Ce qu'ils disent</span>
              <h2 className="section-title">Avis de nos <span className="gold-text">Clients</span></h2>
              <div className="gold-line" />
              <div className={styles.overallRating}>
                <div className={styles.overallStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="var(--gold)" color="var(--gold)" />
                  ))}
                </div>
                <span className={styles.overallScore}>4.9/5</span>
                <span className={styles.overallCount}>basé sur +2400 avis vérifiés</span>
              </div>
            </div>
          </FadeInSection>

          <div className={styles.reviewsGrid}>
            {REVIEWS.map((r, i) => (
              <FadeInSection key={r.id} delay={i * 0.08}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAvatar}>{r.avatar}</div>
                    <div>
                      <div className={styles.reviewName}>
                        {r.name}
                        {r.verified && <span className={styles.verifiedBadge}>✓ Vérifié</span>}
                      </div>
                      <div className={styles.reviewProduct}>{r.product}</div>
                    </div>
                    <div className={styles.reviewStars}>
                      {[...Array(r.rating)].map((_, j) => (
                        <Star key={j} size={13} fill="var(--gold)" color="var(--gold)" />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>"{r.text}"</p>
                  <div className={styles.reviewDate}>
                    {new Date(r.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <FadeInSection>
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaInner}>
              <div className={styles.ctaBg} />
              <div className={styles.ctaContent}>
                <span className="section-tag">Rejoignez-nous</span>
                <h2 className={styles.ctaTitle}>
                  Plus de <span className={styles.ctaGold}>15 000</span> familles<br />nous font confiance
                </h2>
                <p className={styles.ctaDesc}>
                  Créez votre compte et profitez d'avantages exclusifs : réductions personnalisées, accès prioritaire aux soldes et bien plus.
                </p>
                <div className={styles.ctaBtns}>
                  <Link to="/inscription" className={styles.ctaBtnPrimary}>
                    Créer un compte gratuit <ArrowRight size={18} />
                  </Link>
                  <Link to="/boutique" className={styles.ctaBtnSecondary}>
                    Explorer la boutique
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
