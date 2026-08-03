import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
} from 'lucide-react';
import { getDashboardStats, subscribeToTables } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import {
  RevenueLineChart,
  TopProductsBarChart,
  StatusDonutChart,
  formatFcfa,
  STATUS_LABELS,
} from '../../components/admin/Charts';

const card = {
  background: 'var(--white)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--gray-200)',
};

const sectionTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-lg)',
  fontWeight: 600,
  color: 'var(--navy)',
  marginBottom: 'var(--space-4)',
};

const gridAuto = (min) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
  gap: 'var(--space-4)',
});

function StatCard({ icon: Icon, label, value, growth, accent, to }) {
  const positive = growth != null && growth >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  const body = (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{label}</span>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: accent ?? 'rgba(201, 168, 76, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--navy)',
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </span>
      </div>

      <strong
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--navy)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </strong>

      {growth != null && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: positive ? 'var(--success)' : 'var(--error)',
          }}
        >
          <TrendIcon size={14} />
          {Math.abs(growth)}%
          <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>vs mois dernier</span>
        </span>
      )}
    </div>
  );

  return to ? (
    <Link to={to} style={{ textDecoration: 'none' }}>
      {body}
    </Link>
  ) : (
    body
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [live, setLive] = useState(false);

  // Evite les rechargements en rafale quand plusieurs lignes changent d'un coup.
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('[v0] getDashboardStats:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeToTables(
      ['orders', 'order_items', 'products', 'payments'],
      () => {
        setLive(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(load, 400);
      }
    );

    return () => {
      clearTimeout(debounceRef.current);
      unsubscribe();
    };
  }, [load]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: 44, maxWidth: 320 }} />
        <div style={gridAuto(210)}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 132 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...card, borderColor: 'var(--error)' }}>
        <h1 style={sectionTitle}>Impossible de charger le tableau de bord</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>{error}</p>
        <button
          type="button"
          onClick={load}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--navy)',
            color: 'var(--off-white)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--navy)' }}>
            Bonjour {user?.firstName || 'Admin'}
          </h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
            Vue d&apos;ensemble de la boutique Dar Al-Hayaa
          </p>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            color: live ? 'var(--success)' : 'var(--gray-500)',
            background: live ? 'rgba(39, 174, 96, 0.12)' : 'var(--gray-100)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
          }}
        >
          <Radio size={14} />
          {live ? 'Temps réel actif' : 'En écoute'}
          {lastUpdate && (
            <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>
              · {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          )}
        </span>
      </header>

      {/* KPIs */}
      <div style={gridAuto(210)}>
        <StatCard
          icon={TrendingUp}
          label="Chiffre d'affaires"
          value={formatFcfa(stats.totalRevenue)}
          growth={stats.revenueGrowth}
        />
        <StatCard
          icon={ShoppingCart}
          label="Commandes"
          value={stats.totalOrders}
          growth={stats.ordersGrowth}
          to="/admin/orders"
          accent="rgba(46, 134, 193, 0.15)"
        />
        <StatCard icon={Package} label="Produits" value={stats.totalProducts} to="/admin/products" />
        <StatCard
          icon={Users}
          label="Clients"
          value={stats.totalCustomers}
          to="/admin/customers"
          accent="rgba(39, 174, 96, 0.15)"
        />
      </div>

      {/* Alertes reelles */}
      <div style={gridAuto(240)}>
        <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <ShoppingCart size={22} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--navy)', display: 'block' }}>
                {stats.pendingOrders} en attente
              </strong>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                Commandes à confirmer
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/stock" style={{ textDecoration: 'none' }}>
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <AlertTriangle size={22} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--navy)', display: 'block' }}>
                {stats.lowStock} en stock bas
              </strong>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                5 unités ou moins
              </span>
            </div>
          </div>
        </Link>

        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <TrendingUp size={22} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--navy)', display: 'block' }}>
              {formatFcfa(stats.averageOrderValue)}
            </strong>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Panier moyen</span>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div style={gridAuto(320)}>
        <section style={card}>
          <h2 style={sectionTitle}>Chiffre d&apos;affaires — 6 derniers mois</h2>
          <RevenueLineChart data={stats.revenueByMonth} />
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Commandes par statut</h2>
          <StatusDonutChart counts={stats.statusCounts} />
        </section>
      </div>

      <div style={gridAuto(320)}>
        <section style={card}>
          <h2 style={sectionTitle}>Meilleures ventes</h2>
          <TopProductsBarChart data={stats.topProducts} />
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Stock à réapprovisionner</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
              Tous les produits ont un stock suffisant.
            </p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {stats.lowStockProducts.map((p) => (
                <li
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    paddingBottom: 'var(--space-3)',
                    borderBottom: '1px solid var(--gray-200)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--navy)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </span>
                  <span
                    className={p.stock === 0 ? 'badge badge-error' : 'badge badge-gold'}
                    style={{ flexShrink: 0 }}
                  >
                    {p.stock === 0 ? 'Rupture' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Dernieres commandes */}
      <section style={card}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Dernières commandes</h2>
          <Link to="/admin/orders" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-dark)', fontWeight: 600 }}>
            Tout voir
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
            Aucune commande pour le moment.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--gray-500)' }}>
                  <th style={{ padding: 'var(--space-2)' }}>Commande</th>
                  <th style={{ padding: 'var(--space-2)' }}>Client</th>
                  <th style={{ padding: 'var(--space-2)' }}>Statut</th>
                  <th style={{ padding: 'var(--space-2)' }}>Date</th>
                  <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderTop: '1px solid var(--gray-200)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', color: 'var(--navy)', fontWeight: 500 }}>
                      {order.id}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', color: 'var(--gray-600)' }}>
                      {order.customerName || order.email || '—'}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)' }}>
                      <span className="badge badge-gold">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-2)', color: 'var(--gray-500)' }}>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td
                      style={{
                        padding: 'var(--space-3) var(--space-2)',
                        textAlign: 'right',
                        color: 'var(--navy)',
                        fontWeight: 600,
                      }}
                    >
                      {formatFcfa(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
