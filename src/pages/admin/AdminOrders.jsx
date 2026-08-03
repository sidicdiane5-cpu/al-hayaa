import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Truck } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { id: 'all', label: 'Tous les statuts' },
    { id: 'pending', label: 'En attente' },
    { id: 'confirmed', label: 'Confirmée' },
    { id: 'preparing', label: 'En préparation' },
    { id: 'shipped', label: 'Expédiée' },
    { id: 'delivered', label: 'Livrée' },
    { id: 'cancelled', label: 'Annulée' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
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
          Commandes
        </h1>
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Gérer les commandes clients</p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={20} />
            <input
              type="text"
              placeholder="Rechercher une commande..."
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
            <Filter style={{ color: 'var(--gray-400)' }} size={20} />
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

      {/* Orders Table */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--gray-100)' }}>
              <tr>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Commande
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Client
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Montant
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Statut
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ borderBottom: '1px solid var(--gray-200)' }}>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--navy)' }}>{order.id}</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{order.tracking_number}</p>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <div>
                      <p style={{ color: 'var(--navy)' }}>{order.email || 'Non spécifié'}</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{order.phone || ''}</p>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--navy)' }}>
                    {order.total?.toLocaleString() || '0'} FCFA
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        backgroundColor: getStatusBackgroundColor(order.status),
                        color: getStatusTextColor(order.status),
                      }}
                    >
                      {statusOptions.filter(s => s.id !== 'all').map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--gray-600)' }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right' }}>
                    <button
                      onClick={() => handleViewDetail(order)}
                      style={{
                        padding: 'var(--space-2)',
                        color: 'var(--gray-600)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Truck size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
            <p style={{ color: 'var(--gray-500)' }}>Aucune commande trouvée</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
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
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '672px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)' }}>
                Détail de la commande {selectedOrder.id}
              </h2>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Client</p>
                  <p style={{ fontWeight: 500 }}>{selectedOrder.email || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Téléphone</p>
                  <p style={{ fontWeight: 500 }}>{selectedOrder.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Montant total</p>
                  <p style={{ fontWeight: 500 }}>{selectedOrder.total?.toLocaleString() || '0'} FCFA</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Mode de paiement</p>
                  <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{selectedOrder.payment_method || 'N/A'}</p>
                </div>
              </div>
              
              <div style={{ marginTop: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>Adresse de livraison</p>
                <p style={{ color: 'var(--navy)' }}>{selectedOrder.shipping_address || 'Non spécifiée'}</p>
              </div>

              <div style={{ marginTop: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>Articles</p>
                <div style={{ color: 'var(--gray-600)' }}>
                  <p>Détails des articles à charger depuis l'API</p>
                </div>
              </div>
            </div>
            <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--gold)',
                  color: 'var(--navy)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBackgroundColor(status) {
  switch (status) {
    case 'pending': return '#FEF3C7';
    case 'confirmed': return '#DBEAFE';
    case 'preparing': return '#E9D5FF';
    case 'shipped': return '#E0E7FF';
    case 'delivered': return '#D1FAE5';
    case 'cancelled': return '#FEE2E2';
    default: return '#F3F4F6';
  }
}

function getStatusTextColor(status) {
  switch (status) {
    case 'pending': return '#92400E';
    case 'confirmed': return '#1E40AF';
    case 'preparing': return '#6B21A8';
    case 'shipped': return '#3730A3';
    case 'delivered': return '#065F46';
    case 'cancelled': return '#991B1B';
    default: return '#374151';
  }
}
