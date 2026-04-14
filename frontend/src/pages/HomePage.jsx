import { useState, useEffect, useRef } from 'react'
import ProductCard from '../components/ProductCard'
import CartBar from '../components/CartBar'
import CartModal from '../components/CartModal'
import { getProducts } from '../api'

const CATEGORIES = [
  { id: 'all',      label: 'Hammasi',     emoji: '🏪' },
  { id: 'sabzavot', label: 'Sabzavot',    emoji: '🥬' },
  { id: 'meva',     label: 'Meva',        emoji: '🍎' },
  { id: 'sut',      label: 'Sut',         emoji: '🥛' },
  { id: 'non',      label: 'Non',         emoji: '🍞' },
  { id: 'gosht',    label: "Go'sht",      emoji: '🥩' },
  { id: 'ichimlik', label: 'Ichimlik',    emoji: '🧃' },
]

const MOCK_PRODUCTS = [
  { id:1,  name:'Pomidor',      weight:'1 kg',    price:12000, category:'sabzavot', emoji:'🍅' },
  { id:2,  name:'Bodring',      weight:'1 kg',    price:8000,  category:'sabzavot', emoji:'🥒' },
  { id:3,  name:'Kartoshka',    weight:'1 kg',    price:5000,  category:'sabzavot', emoji:'🥔' },
  { id:4,  name:'Karam',        weight:'1 dona',  price:7000,  category:'sabzavot', emoji:'🥬' },
  { id:5,  name:'Olma',         weight:'1 kg',    price:15000, category:'meva',     emoji:'🍎' },
  { id:6,  name:'Banan',        weight:'1 kg',    price:18000, category:'meva',     emoji:'🍌' },
  { id:7,  name:'Uzum',         weight:'500 g',   price:14000, category:'meva',     emoji:'🍇' },
  { id:8,  name:'Limon',        weight:'3 ta',    price:6000,  category:'meva',     emoji:'🍋' },
  { id:9,  name:'Sut',          weight:'1 litr',  price:9000,  category:'sut',      emoji:'🥛' },
  { id:10, name:'Tuxum',        weight:'10 ta',   price:22000, category:'sut',      emoji:'🥚' },
  { id:11, name:'Qatiq',        weight:'500 ml',  price:8000,  category:'sut',      emoji:'🫙' },
  { id:12, name:"Sariyog'",     weight:'200 g',   price:19000, category:'sut',      emoji:'🧈' },
  { id:13, name:'Non',          weight:'500 g',   price:6000,  category:'non',      emoji:'🍞' },
  { id:14, name:'Lavash',       weight:'3 ta',    price:7000,  category:'non',      emoji:'🫓' },
  { id:15, name:"Mol go'shti",  weight:'500 g',   price:45000, category:'gosht',    emoji:'🥩' },
  { id:16, name:'Tovuq',        weight:'1 kg',    price:35000, category:'gosht',    emoji:'🍗' },
  { id:17, name:'Limonad',      weight:'1.5 l',   price:12000, category:'ichimlik', emoji:'🧃' },
  { id:18, name:'Suv',          weight:'1.5 l',   price:5000,  category:'ichimlik', emoji:'💧' },
]

export default function HomePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const catsRef = useRef(null)
  
  useEffect(() => {
    getProducts().then(res => {
      if (res.data?.length) setProducts(res.data)
      }).catch(() => {})
  }, [])
  
  const filtered = products.filter(p => {
    const catOk = activeCat === 'all' || p.category === activeCat || p.category_slug === activeCat
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase())
    return catOk && searchOk
  })
  
  const handleCat = (id) => {
    setActiveCat(id)
    setSearch('')
  }
  
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f5f5f5', fontFamily: "'Nunito', sans-serif" }}>
    
    {/* ── HEADER ── */}
    <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', position: 'sticky', top: 0, zIndex: 50 }}>
    {/* Top bar */}
    <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
    <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
    Shovot <span style={{ color: '#21a95a' }}>Express</span>
    </div>
    <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginTop: 1 }}>
    📍 Shovot tumani
    </div>
    </div>
    <div style={{
      background: '#f0faf4',
      color: '#21a95a',
      fontSize: 11,
      fontWeight: 800,
      padding: '5px 10px',
      borderRadius: 20,
      border: '1px solid #c3ebd4',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }}>
    <span style={{ fontSize: 13 }}>⚡</span> 30 daqiqa
    </div>
    </div>
    
    {/* Search */}
    <div style={{ padding: '0 16px 10px' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: '#f5f5f5',
      borderRadius: 12,
      padding: '9px 14px',
      gap: 8,
      border: searchFocused ? '1.5px solid #21a95a' : '1.5px solid transparent',
      transition: 'border-color 0.2s',
    }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
    value={search}
    onChange={e => setSearch(e.target.value)}
    onFocus={() => setSearchFocused(true)}
    onBlur={() => setSearchFocused(false)}
    placeholder="Mahsulot qidiring..."
    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'inherit', flex: 1, color: '#1a1a1a' }}
    />
    {search && (
      <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
    )}
    </div>
    </div>
    
    {/* Categories */}
    <div ref={catsRef} style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
    {CATEGORIES.map(cat => (
      <button
      key={cat.id}
      onClick={() => handleCat(cat.id)}
      style={{
        whiteSpace: 'nowrap',
        padding: '6px 14px',
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: activeCat === cat.id ? '1.5px solid #21a95a' : '1.5px solid #e8e8e8',
        background: activeCat === cat.id ? '#21a95a' : '#fff',
        color: activeCat === cat.id ? '#fff' : '#555',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}
      >
      <span style={{ fontSize: 14 }}>{cat.emoji}</span>
      {cat.label}
      </button>
    ))}
    </div>
    </div>
    
    {/* ── BODY ── */}
    <div style={{ flex: 1, padding: '12px 14px 0' }}>
    
    {/* Banner — only on "all" tab */}
    {activeCat === 'all' && !search && (
      <div style={{
        background: 'linear-gradient(135deg, #1a7a48 0%, #21a95a 60%, #2ed672 100%)',
        borderRadius: 18,
        padding: '16px 18px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
      }}>
      <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 90, opacity: 0.15 }}>🛒</div>
      <div>
      <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 3 }}>Birinchi buyurtma</div>
      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>Yetkazib berish bepul! 🎉</div>
      <div style={{
        marginTop: 10,
        background: 'rgba(255,255,255,0.2)',
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 20,
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
      }}>Hozir buyurtma bering →</div>
      </div>
      <div style={{ fontSize: 56, position: 'relative', zIndex: 1 }}>🎁</div>
      </div>
    )}
    
    {/* Section header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>
    {search
      ? `"${search}" natijalari`
      : CATEGORIES.find(c => c.id === activeCat)?.label || 'Hammasi'
    }
    </div>
    <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>{filtered.length} ta mahsulot</div>
    </div>
    
    {/* Products grid */}
    {filtered.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#888' }}>Topilmadi</div>
      <div style={{ fontSize: 13 }}>Boshqa so'z bilan qidiring</div>
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 8 }}>
      {filtered.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      </div>
    )}
    </div>
    
    {/* Cart bar */}
    <CartBar products={products} onOpen={() => setCartOpen(true)} />
    <CartModal products={products} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}