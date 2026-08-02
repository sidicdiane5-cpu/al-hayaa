import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star, Heart, ShoppingBag, Share2, ChevronRight, ZoomIn,
  Truck, RotateCcw, Shield, Minus, Plus, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '../data/products';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  // Charger les avis depuis la base de données
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/reviews/product/${id}`);
        const data = await response.json();
        if (data.length > 0) {
          setReviews(data);
        } else {
          // Fallback aux avis mock si aucun avis dans la BD
          const { REVIEWS } = await import('../data/products.js');
          setReviews(REVIEWS.filter(r => r.product === product?.name));
        }
      } catch (error) {
        // Fallback aux avis mock en cas d'erreur
        const { REVIEWS } = await import('../data/products.js');
        setReviews(REVIEWS.filter(r => r.product === product?.name));
      }
    };

    if (product) {
      loadReviews();
    }
  }, [id, product]);

  if (!product) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Produit introuvable</h1>
        <Link to="/boutique" className={styles.backLink}>← Retour à la boutique</Link>
      </div>
    );
  }

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const inWish = isInWishlist(product.id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'guest', // À remplacer par l'ID utilisateur réel quand l'auth sera intégrée
          product_id: id,
          rating: newReview.rating,
          comment: newReview.comment,
          verified: false
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviews([...reviews, data.review]);
        setNewReview({ rating: 5, comment: '' });
        toast.success('Avis ajouté avec succès !');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    }
  };

  const handleAddToCart = () => {
    if (product.sizes.length > 1 && !selectedSize) {
      toast.error('Veuillez sélectionner une taille !', {
        style: { background: 'var(--navy)', color: 'var(--off-white)' },
      });
      return;
    }
    addItem(product, qty, selectedColor, selectedSize || product.sizes[0]);
    openCart();
    toast.success('Ajouté au panier ! 🛍️', {
      style: { background: 'var(--navy)', color: 'var(--off-white)', border: '1px solid var(--gold)' },
    });
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <>
      <Helmet>
        <title>{product.name} — Dar Al Hayaa</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <nav className={styles.breadcrumbNav}>
            <Link to="/">Accueil</Link>
            <ChevronRight size={14} />
            <Link to="/boutique">Boutique</Link>
            <ChevronRight size={14} />
            <Link to={`/${product.category}`}>{product.category}</Link>
            <ChevronRight size={14} />
            <span>{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container section-sm">
        <div className={styles.productLayout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
            <div
              className={styles.mainImage}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={styles.image}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={
                    zoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: 'scale(1.6)',
                          cursor: 'crosshair',
                        }
                      : {}
                  }
                />
              </AnimatePresence>

              {/* Badges */}
              <div className={styles.galleryBadges}>
                {product.isNew && <span className={`${styles.badge} ${styles.badgeNew}`}>Nouveau</span>}
                {product.discount > 0 && (
                  <span className={`${styles.badge} ${styles.badgeSale}`}>-{product.discount}%</span>
                )}
              </div>

              <button className={styles.zoomBtn} aria-label="Zoom">
                <ZoomIn size={18} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            {/* Category */}
            <div className={styles.infoCategory}>
              <Link to={`/${product.category}`}>{product.category}</Link>
              &nbsp;/&nbsp;{product.subcategory}
            </div>

            {/* Name */}
            <h1 className={styles.infoName}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.infoRating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16}
                    fill={i < Math.floor(product.rating) ? 'var(--gold)' : 'transparent'}
                    color={i < Math.floor(product.rating) ? 'var(--gold)' : 'var(--gray-300)'}
                  />
                ))}
              </div>
              <span className={styles.ratingScore}>{product.rating}</span>
              <span className={styles.ratingCount}>({product.reviews} avis)</span>
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>{product.price.toLocaleString()} FCFA</span>
              {product.originalPrice && (
                <>
                  <span className={styles.originalPrice}>{product.originalPrice.toLocaleString()} FCFA</span>
                  <span className={styles.savings}>
                    Économisez {(product.originalPrice - product.price).toLocaleString()} FCFA
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className={styles.description}>{product.description}</p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>
                  Couleur : {selectedColor && <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>Sélectionnée</span>}
                </div>
                <div className={styles.colorPicker}>
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      className={`${styles.colorSwatch} ${selectedColor === c ? styles.colorSwatchActive : ''}`}
                      style={{ background: c }}
                      onClick={() => setSelectedColor(c)}
                      aria-label={`Couleur ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>
                  Taille :
                  {selectedSize
                    ? <span className={styles.selectedValue}>{selectedSize}</span>
                    : <span className={styles.sizeNote}>Sélectionner une taille</span>
                  }
                </div>
                <div className={styles.sizePicker}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className={styles.stockStatus}>
              {product.stock > 0 ? (
                <span className={styles.inStock}>
                  <CheckCircle size={15} />
                  En stock
                  {product.stock <= 5 && ` — Plus que ${product.stock} disponible(s) !`}
                </span>
              ) : (
                <span className={styles.outOfStock}>Rupture de stock</span>
              )}
            </div>

            {/* Qty + Add to Cart */}
            <div className={styles.addToCart}>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus size={16} />
                </button>
                <span className={styles.qtyValue}>{qty}</span>
                <button className={styles.qtyBtn} onClick={() => setQty(Math.min(product.stock, qty + 1))}>
                  <Plus size={16} />
                </button>
              </div>
              <button
                className={styles.addBtn}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag size={20} />
                Ajouter au panier
              </button>
              <button
                className={`${styles.wishBtn} ${inWish ? styles.wishBtnActive : ''}`}
                onClick={() => {
                  const added = toggleItem(product);
                  toast(added ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris', {
                    style: { background: 'var(--navy)', color: 'var(--off-white)' },
                  });
                }}
                aria-label="Favoris"
              >
                <Heart size={20} fill={inWish ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className={styles.guarantees}>
              <div className={styles.guarantee}><Truck size={16} /> Livraison gratuite dès 80€</div>
              <div className={styles.guarantee}><RotateCcw size={16} /> Retours gratuits 30 jours</div>
              <div className={styles.guarantee}><Shield size={16} /> Paiement 100% sécurisé</div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className={styles.related}>
            <div className="section-header">
              <span className="section-tag">Dans la même catégorie</span>
              <h2 className="section-title">Vous aimerez aussi</h2>
              <div className="gold-line" />
            </div>
            <div className={styles.relatedGrid}>
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
