import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/coupons');
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
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
      await fetch(`http://localhost:3001/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    }
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) {
      try {
        await fetch(`http://localhost:3001/api/coupons/${couponId}`, {
          method: 'DELETE',
        });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="mt-2 text-gray-600">Gérer les codes promo et réductions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un coupon</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un coupon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div key={coupon.code} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-navy to-navy-light p-4">
              <div className="flex items-center justify-between">
                <Tag className="w-8 h-8 text-gold" />
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  coupon.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {coupon.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-white">{coupon.discount}%</p>
                <p className="text-white/80 text-sm">de réduction</p>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Code</p>
                <p className="font-mono font-bold text-lg text-gray-900">{coupon.code}</p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Achat min: {coupon.min_purchase.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Percent className="w-4 h-4" />
                <span>Utilisations: {coupon.uses_count || 0}</span>
              </div>
            </div>
            
            <div className="px-4 pb-4 flex items-center space-x-2">
              <button
                onClick={() => handleToggleStatus(coupon.code, coupon.is_active)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  coupon.is_active
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {coupon.is_active ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => handleEdit(coupon)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(coupon.code)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun coupon trouvé</p>
        </div>
      )}

      {/* Modal for Add/Edit Coupon */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCoupon ? 'Modifier le coupon' : 'Ajouter un coupon'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Formulaire d'ajout/modification de coupon</p>
              <p className="text-sm text-gray-400 mt-2">À implémenter avec tous les champs nécessaires</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors">
                {editingCoupon ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
