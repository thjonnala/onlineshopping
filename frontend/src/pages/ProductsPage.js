import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: categoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const [priceInputs, setPriceInputs] = useState({ min: minPrice, max: maxPrice });

  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize, ...(sort && { sort }), ...(search && { search }), ...(minPrice && { minPrice }), ...(maxPrice && { maxPrice }) });
      const url = categoryId ? `/products/category/${categoryId}?${params}` : `/products?${params}`;
      const { data } = await api.get(url);
      setProducts(data.products);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [categoryId, page, sort, search, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (categoryId) {
      api.get(`/categories/${categoryId}`).then(r => setCategory(r.data)).catch(() => setCategory(null));
    } else { setCategory(null); }
  }, [categoryId]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const applyPrice = () => {
    const next = new URLSearchParams(searchParams);
    if (priceInputs.min) next.set('minPrice', priceInputs.min); else next.delete('minPrice');
    if (priceInputs.max) next.set('maxPrice', priceInputs.max); else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
    setSidebarOpen(false);
  };

  return (
    <div style={styles.page}>
      <div className="products-layout">
        {/* Mobile filter toggle */}
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? '✕ Close Filters' : '⚙️ Filters & Categories'}
        </button>

        {/* Sidebar */}
        <aside className={`products-sidebar${sidebarOpen ? ' open' : ''}`}>
          <h3 style={styles.filterTitle}>Filters</h3>

          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>Price Range (₹)</p>
            <div style={styles.priceRow}>
              <input type="number" placeholder="Min" value={priceInputs.min} onChange={e => setPriceInputs(p => ({ ...p, min: e.target.value }))} style={styles.priceInput} />
              <span>–</span>
              <input type="number" placeholder="Max" value={priceInputs.max} onChange={e => setPriceInputs(p => ({ ...p, max: e.target.value }))} style={styles.priceInput} />
            </div>
            <button onClick={applyPrice} style={styles.applyBtn}>Apply</button>
          </div>

          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>Min Rating</p>
            {[4, 3, 2].map(r => (
              <label key={r} style={styles.radioLabel}>
                <input type="radio" name="rating" checked={searchParams.get('minRating') === String(r)} onChange={() => { updateParam('minRating', r); setSidebarOpen(false); }} />
                {'★'.repeat(r)} & above
              </label>
            ))}
            {searchParams.get('minRating') && (
              <button onClick={() => updateParam('minRating', '')} style={styles.clearBtn}>Clear</button>
            )}
          </div>

          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>Categories</p>
            <Link to="/products" style={{ ...styles.catLink, ...(!categoryId ? styles.catLinkActive : {}) }} onClick={() => setSidebarOpen(false)}>All Products</Link>
            {[1,2,3,4,5,6].map(id => (
              <Link key={id} to={`/category/${id}`} style={{ ...styles.catLink, ...(categoryId === String(id) ? styles.catLinkActive : {}) }} onClick={() => setSidebarOpen(false)}>
                Category {id}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="products-main">
          <div style={styles.topBar}>
            <h2 style={styles.pageTitle}>
              {category ? category.name : search ? `Results for "${search}"` : 'All Products'}
              <span style={styles.count}> ({total})</span>
            </h2>
            <select value={sort} onChange={e => updateParam('sort', e.target.value)} style={styles.sortSelect}>
              <option value="">Best Sellers</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={styles.empty}>No products found. Try adjusting your filters.</div>
          ) : (
            <div style={styles.grid}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => updateParam('page', p)} style={{ ...styles.pageBtn, ...(page === p ? styles.pageBtnActive : {}) }}>{p}</button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f7f7f7', minHeight: '100vh', padding: '16px' },
  filterTitle: { fontSize: 16, fontWeight: 700, color: '#212121', margin: '0 0 16px' },
  filterSection: { borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16 },
  filterLabel: { fontSize: 13, fontWeight: 600, color: '#4a5568', margin: '0 0 10px' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  priceInput: { width: 70, padding: '6px 8px', border: '1px solid #cbd5e0', borderRadius: 4, fontSize: 13 },
  applyBtn: { background: '#1a73e8', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  radioLabel: { display: 'block', fontSize: 13, marginBottom: 6, cursor: 'pointer', color: '#4a5568' },
  clearBtn: { fontSize: 12, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  catLink: { display: 'block', fontSize: 13, color: '#4a5568', padding: '4px 0', textDecoration: 'none' },
  catLinkActive: { color: '#1a73e8', fontWeight: 700 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  pageTitle: { fontSize: 18, fontWeight: 700, color: '#212121', margin: 0 },
  count: { fontSize: 13, fontWeight: 400, color: '#666' },
  sortSelect: { padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, outline: 'none' },
  loading: { textAlign: 'center', padding: 60, color: '#666' },
  empty: { textAlign: 'center', padding: 60, color: '#999', fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  pagination: { display: 'flex', gap: 8, marginTop: 32, justifyContent: 'center', flexWrap: 'wrap' },
  pageBtn: { padding: '8px 14px', border: '1px solid #cbd5e0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 },
  pageBtnActive: { background: '#1a73e8', borderColor: '#1a73e8', color: '#fff', fontWeight: 700 },
};
