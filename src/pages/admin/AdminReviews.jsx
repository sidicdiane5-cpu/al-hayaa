import { useState, useEffect } from 'react';
import { Search, Star, Trash2, Check, X } from 'lucide-react';
import { getAllReviews, updateReviewStatus, deleteReview } from '../../lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const ratingOptions = [
    { id: 'all', label: 'Toutes les notes' },
    { id: '5', label: '5 étoiles' },
    { id: '4', label: '4 étoiles' },
    { id: '3', label: '3 étoiles' },
    { id: '2', label: '2 étoiles' },
    { id: '1', label: '1 étoile' },
  ];

  const statusOptions = [
    { id: 'all', label: 'Tous les statuts' },
    { id: 'pending', label: 'En attente' },
    { id: 'approved', label: 'Approuvé' },
    { id: 'rejected', label: 'Rejeté' },
  ];

  const handleApprove = async (reviewId) => {
    try {
      await updateReviewStatus(reviewId, 'approved');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await updateReviewStatus(reviewId, 'rejected');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        await deleteReview(reviewId);
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#FBBF24' : 'none'}
        color={i < rating ? '#FBBF24' : '#D1D5DB'}
      />
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
      case 'approved': return { bg: '#D1FAE5', text: '#065F46' };
      case 'rejected': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
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
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--navy)' }}>
          Avis Clients
        </h1>
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Modérer et gérer les avis clients</p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={20} />
            <input
              type="text"
              placeholder="Rechercher un avis..."
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              {ratingOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            
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

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredReviews.map((review) => {
          const statusColors = getStatusColor(review.status);
          return (
            <div key={review.id} style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {renderStars(review.rating)}
                    </div>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                    }}>
                      {getStatusLabel(review.status)}
                    </span>
                  </div>
                  
                  <h3 style={{ fontWeight: 600, color: 'var(--navy)' }}>{review.product_name || 'Produit inconnu'}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
                    Par {review.customer_name || 'Client anonyme'} • {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  
                  {review.comment && (
                    <p style={{ marginTop: 'var(--space-3)', color: 'var(--gray-700)' }}>{review.comment}</p>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'var(--space-4)' }}>
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        style={{ padding: 'var(--space-2)', color: '#16A34A', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                        title="Approuver"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        style={{ padding: 'var(--space-2)', color: '#DC2626', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                        title="Rejeter"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    style={{ padding: 'var(--space-2)', color: 'var(--gray-600)', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <Star size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
            <p style={{ color: 'var(--gray-500)' }}>Aucun avis trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
