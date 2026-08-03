import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import { getCoupons, updateCouponStatus, deleteCoupon } from '../../lib/api';

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && coupon.is_active) ||
      (statusFilter === 'inactive' && !coupon.is_active);
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { id: 'all', label: 'Tous les statuts' },
    { id: 'active', label: 'Actifs' },
    { id: 'inactive', label: 'Inactifs' },
  ];

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await updateCouponStatus(couponId, !currentStatus);
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    }
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) {
      try {
        await deleteCoupon(couponId);
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: 'var(--gray-500)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--navy)' }}>
            Promotions
          </h1>
          <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Gérer les codes promo et réductions</p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--gold)',
            color: 'var(--navy)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Plus size={20} />
          <span>Ajouter un coupon</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={20} />
            <input
              type="text"
              placeholder="Rechercher un coupon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                padding: 'var(--space-2)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        {filteredCoupons.map((coupon) => (
          <div key={coupon.code} style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(to right, var(--navy), #1e3a5f)', padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Tag size={32} style={{ color: 'var(--gold)' }} />
                <span style={{
                  padding: 'var(--space-1) var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: coupon.is_active ? '#22C55E' : '#6B7280',
                  color: 'white',
                }}>
                  {coupon.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'white' }}>{coupon.discount}%</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'var(--text-sm)' }}>de réduction</p>
              </div>
            </div>
            
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Code</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--navy)' }}>{coupon.code}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                <Calendar size={16} />
                <span>Achat min: {coupon.min_purchase?.toLocaleString() || '0'} FCFA</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                <Percent size={16} />
                <span>Utilisations: {coupon.uses_count || 0}</span>
              </div>
            </div>
            
            <div style={{ padding: '0 var(--space-4) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                onClick={() => handleToggleStatus(coupon.code, coupon.is_active)}
                style={{
                  flex: 1,
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: coupon.is_active ? '#FEF3C7' : '#D1FAE5',
                  color: coupon.is_active ? '#92400E' : '#065F46',
                }}
              >
                {coupon.is_active ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => handleEdit(coupon)}
                style={{ padding: 'var(--space-2)', color: '#2563EB', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(coupon.code)}
                style={{ padding: 'var(--space-2)', color: '#DC2626', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <Tag size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
          <p style={{ color: 'var(--gray-500)' }}>Aucun coupon trouvé</p>
        </div>
      )}

      {/* Modal for Add/Edit Coupon */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
        }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', maxWidth: '448px', width: '100%' }}>
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)' }}>
                {editingCoupon ? 'Modifier le coupon' : 'Ajouter un coupon'}
              </h2>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <p style={{ color: 'var(--gray-600)' }}>Formulaire d'ajout/modification de coupon</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: 'var(--space-2)' }}>À implémenter avec tous les champs nécessaires</p>
            </div>
            <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--gray-700)',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                Annuler
              </button>
              <button style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--gold)',
                color: 'var(--navy)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
              }}>
                {editingCoupon ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
