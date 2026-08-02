import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const navigate = useNavigate();

  const inWish = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.colors[0] || null, product.sizes[0] || null);
    openCart();
    toast.success(`${product.name} ajouté au panier ! 🛍️`, {
      style: { background: 'var(--navy)', color: 'var(--off-white)', border: '1px solid var(--gold)' },
      iconTheme: { primary: 'var(--gold)', secondary: 'var(--navy)' },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem(product);
    toast(added ? `Ajouté aux favoris ❤️` : `Retiré des favoris`, {
      style: { background: 'var(--navy)', color: 'var(--off-white)', border: '1px solid var(--gold)' },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <div
        className={styles.card}
        onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
        onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
      >
        {/* Image */}
        <div className={styles.imageWrap}>
          <Link to={`/produit/${product.id}`}>
            <img
              src={product.images[imgIdx] || product.images[0]}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className={styles.badges}>
            {product.isNew && <span className={`${styles.badge} ${styles.badgeNew}`}>Nouveau</span>}
            {product.isBestseller && <span className={`${styles.badge} ${styles.badgeBest}`}>⭐ Best-seller</span>}
            {product.discount > 0 && (
              <span className={`${styles.badge} ${styles.badgeSale}`}>Promotion</span>
            )}
          </div>

          {/* Actions */}
          <div className={`${styles.actions} ${hovered ? styles.actionsVisible : ''}`}>
            <button
              className={`${styles.action} ${inWish ? styles.actionActive : ''}`}
              onClick={handleWishlist}
              aria-label="Ajouter aux favoris"
            >
              <Heart size={16} fill={inWish ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/produit/${product.id}`}
              className={styles.action}
              aria-label="Voir le produit"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Quick Add */}
          <div className={`${styles.quickAdd} ${hovered ? styles.quickAddVisible : ''}`}>
            <button className={styles.quickAddBtn} onClick={handleAddToCart}>
              <ShoppingBag size={15} />
              Ajouter au panier
            </button>
          </div>

          {/* Stock Warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className={styles.stockWarning}>
              <Zap size={11} /> Plus que {product.stock} en stock
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Colors */}
          {product.colors.length > 0 && (
            <div className={styles.colorDots}>
              {product.colors.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className={styles.colorDot}
                  style={{ background: c }}
                  title={c}
                />
              ))}
              {product.colors.length > 5 && (
                <div className={styles.colorMore}>+{product.colors.length - 5}</div>
              )}
            </div>
          )}

          {/* Name */}
          <Link to={`/produit/${product.id}`} className={styles.name}>
            {product.name}
          </Link>

          {/* Rating */}
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(product.rating) ? 'var(--gold)' : 'transparent'}
                  color={i < Math.floor(product.rating) ? 'var(--gold)' : 'var(--gray-300)'}
                />
              ))}
            </div>
            <span className={styles.ratingCount}>({product.reviews})</span>
          </div>

          {/* Price */}
          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price.toLocaleString()} FCFA</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>{product.originalPrice.toLocaleString()} FCFA</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
