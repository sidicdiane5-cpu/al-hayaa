import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Shield, Ban, Check, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getCustomers, setCustomerRole, setCustomerActive, deleteCustomer } from '../../lib/api';

export default function AdminCustomers() {
  const { user: currentUser } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && customer.is_active) ||
      (statusFilter === 'inactive' && !customer.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleOptions = [
    { id: 'all', label: 'Tous les rôles' },
    { id: 'client', label: 'Clients' },
    { id: 'manager', label: 'Managers' },
    { id: 'admin', label: 'Admins' },
  ];

  const statusOptions = [
    { id: 'all', label: 'Tous les statuts' },
    { id: 'active', label: 'Actifs' },
    { id: 'inactive', label: 'Inactifs' },
  ];

  const handleToggleStatus = async (customerId, currentStatus) => {
    try {
      await setCustomerActive(customerId, !currentStatus);
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleChangeRole = async (customerId, newRole) => {
    try {
      await setCustomerRole(customerId, newRole);
      fetchCustomers();
    } catch (error) {
      console.error('Error changing user role:', error);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteCustomer(customerId);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
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
          Clients
        </h1>
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Gérer les utilisateurs et leurs rôles</p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={20} />
            <input
              type="text"
              placeholder="Rechercher un client..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              {roleOptions.map(option => (
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

      {/* Customers Table */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--gray-100)' }}>
              <tr>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Client
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Email
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Rôle
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Statut
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Inscrit le
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ borderBottom: '1px solid var(--gray-200)' }}>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                        {customer.first_name?.[0] || customer.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--navy)' }}>
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{customer.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--gray-600)' }}>
                    {customer.email}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <select
                      value={customer.role}
                      onChange={(e) => handleChangeRole(customer.id, e.target.value)}
                      disabled={customer.id === currentUser?.id}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-300)',
                        outline: 'none',
                        cursor: customer.id === currentUser?.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <option value="client">Client</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <button
                      onClick={() => handleToggleStatus(customer.id, customer.is_active)}
                      disabled={customer.id === currentUser?.id}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        cursor: customer.id === currentUser?.id ? 'not-allowed' : 'pointer',
                        backgroundColor: customer.is_active ? 'var(--success)' : 'var(--error)',
                        color: 'white',
                      }}
                    >
                      {customer.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--gray-600)' }}>
                    {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        disabled={customer.id === currentUser?.id}
                        style={{
                          padding: 'var(--space-2)',
                          color: 'var(--error)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          cursor: customer.id === currentUser?.id ? 'not-allowed' : 'pointer',
                        }}
                        title="Supprimer"
                      >
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Shield size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
            <p style={{ color: 'var(--gray-500)' }}>Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
