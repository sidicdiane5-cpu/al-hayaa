import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, SlidersHorizontal, Grid3X3, List, Search, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/products';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'En Vedette' },
  { value: 'newest', label: 'Plus Récents' },
  { value: 'price-asc', label: 'Prix Croissant' },
  { value: 'price-desc', label: 'Prix Décroissant' },
  { value: 'rating', label: 'Mieux Notés' },
  { value: 'bestsellers', label: 'Meilleures Ventes' },
];

const PRICE_RANGES = [
  { label: 'Tous les prix', min: 0, max: Infinity },
  { label: 'Moins de 25€', min: 0, max: 25 },
  { label: '25€ – 50€', min: 25, max: 50 },
  { label: '50€ – 100€', min: 50, max: 100 },
  { label: 'Plus de 100€', min: 100, max: Infinity },
];

export default function Shop({ categoryFilter = null, subcategoryFilter = null, title = 'Boutique', products = null, showPromoBanner = false, filterDiscount = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState(0);
  const [selectedCats, setSelectedCats] = useState(categoryFilter ? [categoryFilter] : []);
  const [selectedSubcats, setSelectedSubcats] = useState(subcategoryFilter ? [subcategoryFilter] : []);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const search = searchParams.get('search') || '';

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    
    // Filter by discount if requested
    if (filterDiscount) {
      result = result.filter(p => p.discount && p.discount > 0);
    }
    
    // Use custom products if provided
    if (products) {
      result = [...products];
    }

    // Only apply category/subcategory filters if not using custom products
    if (!products && !filterDiscount) {
      // Category filter
      if (selectedCats.length > 0) {
        result = result.filter((p) => selectedCats.includes(p.category));
      }

      // Subcategory filter
      if (selectedSubcats.length > 0) {
        result = result.filter((p) => selectedSubcats.includes(p.subcategory));
      }
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.subcategory.toLowerCase().includes(q)
      );
    }

    // Price filter
    const range = PRICE_RANGES[priceRange];
    result = result.filter((p) => p.price >= range.min && p.price <= range.max);

    // Sort
    switch (sort) {
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'bestsellers': result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [selectedCats, selectedSubcats, sort, priceRange, search, products, showPromoBanner, filterDiscount]);

  const toggleCat = (catId) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const toggleSubcat = (subcatId) => {
    setSelectedSubcats((prev) =>
      prev.includes(subcatId) ? prev.filter((c) => c !== subcatId) : [...prev, subcatId]
    );
  };

  // Get available subcategories based on selected categories
  const availableSubcategories = useMemo(() => {
    if (selectedCats.length === 0) return [];
    const subcats = new Set();
    PRODUCTS.forEach((p) => {
      if (selectedCats.includes(p.category)) {
        subcats.add(p.subcategory);
      }
    });
    return Array.from(subcats);
  }, [selectedCats]);

  return (
    <>
      <Helmet>
        <title>{title} — Dar Al Hayaa | Mode Islamique Premium</title>
        <meta name="description" content="Découvrez notre sélection de vêtements islamiques, accessoires et produits de beauté halal." />
      </Helmet>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.pageHeaderContent}>
            <span className="section-tag">{PRODUCTS.length}+ Produits</span>
            <h1 className={styles.pageTitle}>{title}</h1>
            {search && (
              <p className={styles.searchInfo}>
                Résultats pour "<strong>{search}</strong>" — {filtered.length} article(s)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      {showPromoBanner && (
        <div className={styles.promoBanner}>
          <div className={styles.promoBannerImage}>
            <img src="/images/promo-person.png" alt="Promotions" />
            <div className={styles.promoBannerOverlay}>
              <h2 className={styles.promoBannerTitle}>Promotions Beauté</h2>
              <p className={styles.promoBannerDesc}>JUSQU'À -30% sur les produits sélectionnés</p>
            </div>
          </div>
        </div>
      )}

      <div className="container section-sm">
        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}><SlidersHorizontal size={16} /> Filtres</h3>
              <button className={styles.closeSidebar} onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Catégories</h4>
              {CATEGORIES.map((cat) => (
                <label key={cat.id} className={styles.filterCheck}>
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat.id)}
                    onChange={() => toggleCat(cat.id)}
                  />
                  <span className={styles.filterCheckBox} />
                  <span>{cat.icon} {cat.name}</span>
                  <span className={styles.filterCount}>{PRODUCTS.filter((p) => p.category === cat.id).length}</span>
                </label>
              ))}
            </div>

            {/* Subcategories */}
            {availableSubcategories.length > 0 && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterLabel}>Sous-catégories</h4>
                {availableSubcategories.map((subcat) => (
                  <label key={subcat} className={styles.filterCheck}>
                    <input
                      type="checkbox"
                      checked={selectedSubcats.includes(subcat)}
                      onChange={() => toggleSubcat(subcat)}
                    />
                    <span className={styles.filterCheckBox} />
                    <span style={{ textTransform: 'capitalize' }}>{subcat}</span>
                    <span className={styles.filterCount}>{PRODUCTS.filter((p) => p.subcategory === subcat).length}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Price */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Prix</h4>
              {PRICE_RANGES.map((r, i) => (
                <label key={i} className={styles.filterCheck}>
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === i}
                    onChange={() => setPriceRange(i)}
                  />
                  <span className={styles.filterCheckBox} />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            {/* Active filters reset */}
            {(selectedCats.length > 0 || selectedSubcats.length > 0 || priceRange > 0) && (
              <button
                className={styles.resetFilters}
                onClick={() => { setSelectedCats([]); setSelectedSubcats([]); setPriceRange(0); }}
              >
                <X size={14} /> Réinitialiser les filtres
              </button>
            )}
          </aside>

          {/* Main Content */}
          <div className={styles.main}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={16} />
                  Filtres
                  {(selectedCats.length + selectedSubcats.length + (priceRange > 0 ? 1 : 0)) > 0 && (
                    <span className={styles.filterBadge}>
                      {selectedCats.length + selectedSubcats.length + (priceRange > 0 ? 1 : 0)}
                    </span>
                  )}
                </button>
                <span className={styles.resultCount}>
                  {filtered.length} produit{filtered.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className={styles.toolbarRight}>
                <div className={styles.sortSelect}>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className={styles.sortDropdown}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.sortIcon} />
                </div>
                <div className={styles.viewBtns}>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grille"
                  ><Grid3X3 size={16} /></button>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="Liste"
                  ><List size={16} /></button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filtered.length === 0 ? (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez de modifier vos filtres ou votre recherche.</p>
                <button className={styles.resetBtn} onClick={() => { setSelectedCats([]); setPriceRange(0); }}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filterOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
