import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { getProducts, deleteProduct } from '../../lib/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'Toutes les catégories' },
    { id: 'femmes', name: 'Femmes' },
    { id: 'hommes', name: 'Hommes' },
    { id: 'beaute', name: 'Beauté' },
    { id: 'electronique', name: 'Électronique' },
    { id: 'accessoires', name: 'Accessoires' },
  ];

  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
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
            Produits
          </h1>
          <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Gérer votre catalogue de produits</p>
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
            borderRadius: 'var(--radius-lg)',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
          }}
        >
          <Plus size={20} />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--gray-100)' }}>
              <tr>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Produit
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Catégorie
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Prix
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Stock
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Statut
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ borderBottom: '1px solid var(--gray-200)' }}>
              {filteredProducts.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--gray-200)' }}>
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                            <Filter size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--navy)' }}>{product.name}</p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--gray-600)', textTransform: 'capitalize' }}>
                    {product.category}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--navy)' }}>
                    {product.price?.toLocaleString() || 0} FCFA
                    {product.discount > 0 && (
                      <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--success)' }}>-{product.discount}%</span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: (product.stock || 0) > 10 ? 'var(--success)' : (product.stock || 0) > 0 ? 'var(--warning)' : 'var(--error)',
                      color: 'white'
                    }}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: (product.stock || 0) > 0 ? 'var(--success)' : 'var(--error)',
                      color: 'white'
                    }}>
                      {(product.stock || 0) > 0 ? 'Actif' : 'Rupture'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => {}}
                        style={{ padding: 'var(--space-2)', color: 'var(--gray-600)', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{ padding: 'var(--space-2)', color: '#3b82f6', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{ padding: 'var(--space-2)', color: 'var(--error)', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Filter size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
            <p style={{ color: 'var(--gray-500)' }}>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', maxWidth: '768px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--navy)' }}>
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <p style={{ color: 'var(--gray-500)' }}>Formulaire d'ajout/modification de produit</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-400)', marginTop: 'var(--space-2)' }}>À implémenter avec tous les champs nécessaires</p>
            </div>
            <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', backgroundColor: 'transparent', color: 'var(--gray-600)', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--gold)', color: 'var(--navy)', borderRadius: 'var(--radius-md)', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                {editingProduct ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
