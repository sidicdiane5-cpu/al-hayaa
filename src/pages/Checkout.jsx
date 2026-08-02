import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Lock, CreditCard, ChevronLeft, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { items, getTotal, getSubtotal, getShipping, discount, getDiscount, clearCart, couponCode } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('orange');
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour passer une commande');
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location]);

  const total = getTotal();

  const handleNext = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setOrderData({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      address: formData.get('address'),
      postalCode: formData.get('postalCode'),
      city: formData.get('city'),
      phone: formData.get('phone')
    });
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simuler le paiement mobile
      const paymentResponse = await fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: 'pending',
          method: paymentMethod,
          amount: total,
          status: 'completed',
          transaction_id: `TXN-${Date.now()}`,
          phone: orderData.phone
        })
      });

      const paymentData = await paymentResponse.json();
      
      if (!paymentResponse.ok) {
        throw new Error('Erreur lors du paiement');
      }

      // Créer la commande via l'API
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          items: items,
          total: total,
          subtotal: getSubtotal(),
          shipping: getShipping(),
          discount: discount,
          coupon_code: couponCode || null,
          payment_method: paymentMethod,
          shipping_address: orderData,
          phone: orderData.phone,
          email: orderData.email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Mettre à jour le paiement avec l'ID de commande
        await fetch(`http://localhost:3001/api/payments/${paymentData.payment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_id: data.order_id })
        });

        setOrderData({ 
          ...orderData, 
          orderId: data.order_id, 
          trackingNumber: data.tracking_number,
          transactionId: paymentData.payment.transaction_id 
        });
        setLoading(false);
        setSuccess(true);
        clearCart();
      } else {
        throw new Error(data.error || 'Erreur lors de la commande');
      }
    } catch (error) {
      setLoading(false);
      console.error('Erreur:', error);
      alert('Erreur lors de la commande: ' + error.message);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className={styles.emptyWrap}>
        <h2>Votre panier est vide</h2>
        <Link to="/boutique" className={styles.emptyBtn}>Retourner à la boutique</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.successWrap}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={styles.successCard}>
          <CheckCircle2 size={64} className={styles.successIcon} />
          <h1>Commande confirmée !</h1>
          <p>Merci pour votre achat. Votre numéro de commande est <strong>{orderData?.orderId || 'N/A'}</strong>.</p>
          {orderData?.trackingNumber && (
            <p>Numéro de suivi : <strong>{orderData.trackingNumber}</strong></p>
          )}
          <p>Un email de confirmation vous sera envoyé très bientôt.</p>
          <div className={styles.successActions}>
            <Link to="/suivi-commande" state={{ trackingId: orderData?.trackingNumber || orderData?.orderId }} className={styles.primaryBtn}>Suivre ma commande</Link>
            <Link to="/" className={styles.secondaryBtn}>Retour à l'accueil</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Paiement Sécurisé — Dar Al Hayaa</title></Helmet>
      
      <div className={styles.checkoutPage}>
        <div className="container">
          <div className={styles.header}>
            <Link to="/boutique" className={styles.backLink}><ChevronLeft size={16} /> Retour à la boutique</Link>
            <div className={styles.secureBadge}><Shield size={16} /> Paiement 100% Sécurisé</div>
          </div>
          
          <div className={styles.layout}>
            {/* Form Steps */}
            <div className={styles.main}>
              <div className={styles.steps}>
                <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>1. Livraison</div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>2. Paiement</div>
              </div>

              {step === 1 ? (
                <form onSubmit={handleNext} className={styles.formCard}>
                  <h2 className={styles.formTitle}>Adresse de Livraison</h2>
                  
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Prénom</label>
                      <input type="text" name="firstName" className={styles.input} required />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Nom de famille</label>
                      <input type="text" name="lastName" className={styles.input} required />
                    </div>
                  </div>
                  
                  <div className={styles.field}>
                    <label className={styles.label}>Adresse mail</label>
                    <input type="email" name="email" className={styles.input} required />
                  </div>
                  
                  <div className={styles.field}>
                    <label className={styles.label}>Adresse</label>
                    <input type="text" name="address" className={styles.input} placeholder="N° de rue, avenue..." required />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Code postal</label>
                      <input type="text" name="postalCode" className={styles.input} required />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Ville</label>
                      <input type="text" name="city" className={styles.input} required />
                    </div>
                  </div>
                  
                  <div className={styles.field}>
                    <label className={styles.label}>Téléphone</label>
                    <input type="tel" name="phone" className={styles.input} required />
                  </div>
                  
                  <button type="submit" className={styles.nextBtn}>
                    Passer au paiement <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePayment} className={styles.formCard}>
                  <h2 className={styles.formTitle}>Moyen de Paiement</h2>
                  
                  <div className={styles.paymentMethods} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <label className={`${styles.payMethod} ${paymentMethod === 'orange' ? styles.payMethodActive : ''}`} style={{ flexDirection: 'column', padding: '12px', border: paymentMethod === 'orange' ? '1px solid #FF6600' : '' }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'orange'} onChange={() => setPaymentMethod('orange')} className={styles.payRadio} style={{ display: 'none' }} />
                      <div style={{ background: '#FF6600', color: 'white', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', width: '100%', textAlign: 'center' }}>Orange Money</div>
                    </label>
                    <label className={`${styles.payMethod} ${paymentMethod === 'mtn' ? styles.payMethodActive : ''}`} style={{ flexDirection: 'column', padding: '12px', border: paymentMethod === 'mtn' ? '1px solid #FFCC00' : '' }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'mtn'} onChange={() => setPaymentMethod('mtn')} className={styles.payRadio} style={{ display: 'none' }} />
                      <div style={{ background: '#FFCC00', color: '#000', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', width: '100%', textAlign: 'center' }}>MTN Money</div>
                    </label>
                    <label className={`${styles.payMethod} ${paymentMethod === 'wave' ? styles.payMethodActive : ''}`} style={{ flexDirection: 'column', padding: '12px', border: paymentMethod === 'wave' ? '1px solid #1CBEFF' : '' }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'wave'} onChange={() => setPaymentMethod('wave')} className={styles.payRadio} style={{ display: 'none' }} />
                      <div style={{ background: '#1CBEFF', color: 'white', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', width: '100%', textAlign: 'center' }}>Wave</div>
                    </label>
                  </div>
                  
                  <div className={styles.cardForm}>
                    <div className={styles.field} style={{ marginBottom: 0 }}>
                      <label className={styles.label}>Numéro de téléphone ({paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'orange' ? 'Orange' : 'MTN'})</label>
                      <div className={styles.inputWrap}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input type="tel" className={styles.input} placeholder="Ex: 0500000000" maxLength="10" required />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '12px' }}>
                        Vous recevrez une notification sur votre téléphone pour valider le paiement sécurisé.
                      </p>
                    </div>
                  </div>
                  
                  <button type="submit" className={styles.payBtn} disabled={loading}>
                    {loading ? <div className={styles.spinner} /> : `Payer ${total.toLocaleString()} FCFA`}
                  </button>
                  <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                    Retour à la livraison
                  </button>
                </form>
              )}
            </div>
            
            {/* Order Summary */}
            <aside className={styles.summarySidebar}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Résumé de la commande</h3>
                
                <div className={styles.orderItems}>
                  {items.map((item) => (
                    <div key={item.key} className={styles.orderItem}>
                      <div className={styles.itemBadge}>{item.quantity}</div>
                      <img src={item.images[0]} alt={item.name} className={styles.itemImage} />
                      <div className={styles.itemInfo}>
                        <span className={styles.itemTitle}>{item.name}</span>
                        <span className={styles.itemMeta}>{item.selectedSize || ''} {item.selectedColor ? `- ${item.selectedColor}` : ''}</span>
                      </div>
                      <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                
                <div className={styles.totalsList}>
                  <div className={styles.totalRow}>
                    <span>Sous-total</span>
                    <span>{getSubtotal().toLocaleString()} FCFA</span>
                  </div>
                  {getDiscount() > 0 && (
                    <div className={`${styles.totalRow} ${styles.totalDiscount}`}>
                      <span>Réduction ({discount}%)</span>
                      <span>-{getDiscount().toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className={styles.totalRow}>
                    <span>Expédition</span>
                    <span>{getShipping() === 0 ? 'Gratuite' : `${getShipping().toLocaleString()} FCFA`}</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                    <span>Total à payer</span>
                    <span className={styles.finalPrice}>{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
