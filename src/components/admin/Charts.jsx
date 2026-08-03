// Graphiques legers en SVG pur : pas de dependance supplementaire, et le
// rendu reste net a n'importe quelle taille grace au viewBox + preserveAspectRatio.
const GOLD = 'var(--gold)';
const NAVY = 'var(--navy)';

export function formatFcfa(value) {
  return `${Math.round(Number(value) || 0).toLocaleString('fr-FR')} FCFA`;
}

// ── Courbe : chiffre d'affaires par mois ─────────────────────
export function RevenueLineChart({ data = [], height = 220 }) {
  if (!data.length) return <EmptyChart />;

  const width = 640;
  const padding = { top: 16, right: 16, bottom: 32, left: 16 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.revenue / max) * innerH,
    ...d,
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`;

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`Chiffre d'affaires des ${data.length} derniers mois`}
        preserveAspectRatio="none"
      >
        {/* Lignes de repere horizontales */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <line
            key={r}
            x1={padding.left}
            x2={padding.left + innerW}
            y1={padding.top + innerH * r}
            y2={padding.top + innerH * r}
            stroke="var(--gray-200)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill="rgba(201, 168, 76, 0.15)" />
        <path d={line} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" />

        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="4" fill={GOLD} stroke="var(--white)" strokeWidth="2" />
            <title>{`${p.label} : ${formatFcfa(p.revenue)}`}</title>
          </g>
        ))}

        {points.map((p) => (
          <text
            key={`lbl-${p.label}`}
            x={p.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="12"
            fill="var(--gray-500)"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </figure>
  );
}

// ── Barres horizontales : meilleures ventes ──────────────────
export function TopProductsBarChart({ data = [] }) {
  if (!data.length) return <EmptyChart />;

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', listStyle: 'none' }}>
      {data.map((item) => (
        <li key={item.productId}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: NAVY,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--gray-600)',
                flexShrink: 0,
              }}
            >
              {formatFcfa(item.revenue)}
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: 'var(--gray-200)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(item.revenue / max) * 100}%`,
                height: '100%',
                background: 'var(--gradient-gold)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            {item.quantity} vendu{item.quantity > 1 ? 's' : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Anneau : repartition par statut de commande ──────────────
const STATUS_COLORS = {
  pending: 'var(--warning)',
  paid: '#2E86C1',
  confirmed: '#2E86C1',
  processing: 'var(--gold)',
  shipped: 'var(--navy-light)',
  delivered: 'var(--success)',
  cancelled: 'var(--error)',
};

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export function StatusDonutChart({ counts = {} }) {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  const total = entries.reduce((s, [, n]) => s + n, 0);

  if (!total) return <EmptyChart />;

  const size = 160;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Répartition des commandes par statut"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {entries.map(([status, count]) => {
            const fraction = count / total;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={status}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={STATUS_COLORS[status] ?? 'var(--gray-400)'}
                strokeWidth="20"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              >
                <title>{`${STATUS_LABELS[status] ?? status} : ${count}`}</title>
              </circle>
            );
            offset += dash;
            return circle;
          })}
        </g>
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fontSize="24"
          fontWeight="600"
          fill={NAVY}
        >
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="11" fill="var(--gray-500)">
          commandes
        </text>
      </svg>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none' }}>
        {entries.map(([status, count]) => (
          <li
            key={status}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: STATUS_COLORS[status] ?? 'var(--gray-400)',
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--gray-600)' }}>
              {STATUS_LABELS[status] ?? status}
            </span>
            <span style={{ fontWeight: 600, color: NAVY }}>{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyChart() {
  return (
    <p
      style={{
        color: 'var(--gray-500)',
        fontSize: 'var(--text-sm)',
        textAlign: 'center',
        padding: 'var(--space-8) 0',
      }}
    >
      Pas encore de données à afficher
    </p>
  );
}

export { STATUS_COLORS, STATUS_LABELS };
