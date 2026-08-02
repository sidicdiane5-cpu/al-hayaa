import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, ArrowRight, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';
import toast from 'react-hot-toast';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    applyCoupon, couponCode, discount,
    getSubtotal, getDiscount, getShipping, getTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setTimeout(() => {
      const result = applyCoupon(couponInput);
      toast(result.message, {
        icon: result.success ? '🎉' : '❌',
        style: { background: 'var(--navy)', color: 'var(--off-white)', border: '1px solid var(--gold)' },
      });
      setCouponLoading(false);
      if (result.success) setCouponInput('');
    }, 600);
  };

  // Fermer avec Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCart]);

  // Bloquer scroll body quand ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const subtotal = getSubtotal();
  const discountAmt = getDiscount();
  const shipping = getShipping();
  const total = getTotal();
  const freeShippingLeft = Math.max(0, 80 - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <ShoppingBag size={20} />
                <span>Mon Panier</span>
                {items.length > 0 && (
                  <span className={styles.itemCount}>{items.reduce((s, i) => s + i.quantity, 0)}</span>
                )}
              </div>
              <button className={styles.closeBtn} onClick={closeCart} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Banner */}
            {freeShippingLeft > 0 && items.length > 0 ? (
              <div className={styles.freeShipping}>
                <Gift size={14} />
                <span>Plus que <strong>{freeShippingLeft.toLocaleString()} FCFA</strong> pour la livraison gratuite !</span>
              </div>
            ) : items.length > 0 ? (
              <div className={styles.freeShippingDone}>
                ✅ Vous bénéficiez de la <strong>livraison gratuite</strong> !
              </div>
            ) : null}

            {/* Items */}
            <div className={styles.items}>
              {items.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>🛍️</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Votre panier est vide</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 24 }}>
                    Découvrez nos collections et ajoutez vos articles favoris.
                  </p>
                  <Link to="/boutique" className={styles.shopBtn} onClick={closeCart}>
                    Découvrir la boutique <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.key}
                      className={styles.item}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      layout
                    >
                      <Link to={`/produit/${item.id}`} onClick={closeCart}>
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className={styles.itemImage}
                        />
                      </Link>
                      <div className={styles.itemInfo}>
                        <Link to={`/produit/${item.id}`} className={styles.itemName} onClick={closeCart}>
                          {item.name}
                        </Link>
                        <div className={styles.itemMeta}>
                          {item.selectedColor && (
                            <span
                              className={styles.itemColor}
                              style={{ background: item.selectedColor }}
                            />
                          )}
                          {item.selectedSize && (
                            <span className={styles.itemSize}>{item.selectedSize}</span>
                          )}
                        </div>
                        <div className={styles.itemBottom}>
                          <div className={styles.qty}>
                            <button
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              aria-label="Diminuer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className={styles.qtyNum}>{item.quantity}</span>
                            <button
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              aria-label="Augmenter"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className={styles.itemPrice}>
                            {(item.price * item.quantity).toLocaleString()} FCFA
                          </span>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => removeItem(item.key)}
                            aria-label="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className={styles.footer}>
                {/* Coupon */}
                <div className={styles.coupon}>
                  <div className={styles.couponInput}>
                    <Tag size={14} className={styles.couponIcon} />
                    <input
                      type="text"
                      placeholder="Code promo (ex: NOUR10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className={styles.couponField}
                    />
                    <button
                      className={styles.couponBtn}
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? '...' : 'Appliquer'}
                    </button>
                  </div>
                  {couponCode && (
                    <div className={styles.couponApplied}>
                      🎉 Code <strong>{couponCode}</strong> appliqué — -{discount}%
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className={styles.totals}>
                  <div className={styles.totalRow}>
                    <span>Sous-total</span>
                    <span>{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className={`${styles.totalRow} ${styles.totalDiscount}`}>
                      <span>Réduction ({discount}%)</span>
                      <span>-{discountAmt.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className={styles.totalRow}>
                    <span>Livraison</span>
                    <span className={shipping === 0 ? styles.freeText : ''}>
                      {shipping === 0 ? '🚚 Gratuite' : `${shipping.toLocaleString()} FCFA`}
                    </span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <span>Total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>
                </div>

                {/* CTA */}
                <Link to="/paiement" className={styles.checkoutBtn} onClick={closeCart}>
                  Passer la commande
                  <ArrowRight size={18} />
                </Link>
                <Link to="/paiement" className={styles.viewCartLink} onClick={closeCart}>
                  Passer au paiement sécurisé
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
