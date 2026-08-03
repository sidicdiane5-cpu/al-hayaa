import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { getProducts } from '../../lib/api';

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
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
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.stock < 10 && product.stock > 0) ||
      (stockFilter === 'out' && product.stock === 0) ||
      (stockFilter === 'ok' && product.stock >= 10);
    return matchesSearch && matchesStock;
  });

  const stockOptions = [
    { id: 'all', label: 'Tous les stocks' },
    { id: 'low', label: 'Stock faible (< 10)' },
    { id: 'out', label: 'Rupture de stock' },
    { id: 'ok', label: 'Stock OK (≥ 10)' },
  ];

  const lowStockCount = products.filter(p => p.stock < 10 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

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
          Gestion du Stock
        </h1>
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--gray-500)' }}>Surveiller et gérer les niveaux de stock</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-500)' }}>Total produits</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--navy)', marginTop: 'var(--space-1)' }}>{products.length}</p>
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: '#DBEAFE', color: '#2563EB' }}>
              <Package size={24} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-500)' }}>Stock faible</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: '#D97706', marginTop: 'var(--space-1)' }}>{lowStockCount}</p>
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--gray-500)' }}>Rupture de stock</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: '#DC2626', marginTop: 'var(--space-1)' }}>{outOfStockCount}</p>
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
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
          
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            >
              {stockOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
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
                  Stock actuel
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Statut
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Prix
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
                            <Package size={24} />
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
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <input
                        type="number"
                        defaultValue={product.stock || 0}
                        style={{
                          width: 80,
                          padding: 'var(--space-1) var(--space-2)',
                          border: '1px solid var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <button style={{ padding: 'var(--space-1)', color: '#16A34A', backgroundColor: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        <TrendingUp size={16} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)' }}>
                    <span style={{
                      padding: 'var(--space-1) var(--space-3)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: (product.stock || 0) === 0 ? '#FEE2E2' :
                                   (product.stock || 0) < 10 ? '#FEF3C7' : '#D1FAE5',
                      color: (product.stock || 0) === 0 ? '#991B1B' :
                             (product.stock || 0) < 10 ? '#92400E' : '#065F46',
                    }}>
                      {(product.stock || 0) === 0 ? 'Rupture' :
                       (product.stock || 0) < 10 ? 'Faible' : 'OK'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--navy)' }}>
                    {product.price.toLocaleString()} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <Package size={64} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
            <p style={{ color: 'var(--gray-500)' }}>Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
