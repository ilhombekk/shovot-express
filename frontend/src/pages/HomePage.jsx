import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'
import { getProducts } from '../api'
import CartModal from '../components/CartModal'
import AddressModal from '../components/AddressModal'
import { getActiveAddress } from '../store/addressStore'

const CATEGORIES = [
  { id: 'all',      label: 'Barcha mahsulotlar', emoji: '🏪' },
  { id: 'sabzavot', label: 'Sabzavot',            emoji: '🥬' },
  { id: 'meva',     label: 'Meva',                emoji: '🍎' },
  { id: 'sut',      label: 'Sut mahsulotlar',     emoji: '🥛' },
  { id: 'non',      label: 'Non & xamir',          emoji: '🍞' },
  { id: 'gosht',    label: "Go'sht",               emoji: '🥩' },
  { id: 'ichimlik', label: 'Ichimliklar',          emoji: '🧃' },
]

const MOCK_PRODUCTS = [
  { id:1,  name:'Pomidor',      weight:'1 kg',    price:12000, category:'sabzavot', emoji:'🍅' },
  { id:2,  name:'Bodring',      weight:'1 kg',    price:8000,  category:'sabzavot', emoji:'🥒' },
  { id:3,  name:'Kartoshka',    weight:'1 kg',    price:5000,  category:'sabzavot', emoji:'🥔' },
  { id:4,  name:'Karam',        weight:'1 dona',  price:7000,  category:'sabzavot', emoji:'🥬' },
  { id:5,  name:'Piyoz',        weight:'1 kg',    price:4000,  category:'sabzavot', emoji:'🧅' },
  { id:6,  name:'Olma',         weight:'1 kg',    price:15000, category:'meva',     emoji:'🍎' },
  { id:7,  name:'Banan',        weight:'1 kg',    price:18000, category:'meva',     emoji:'🍌' },
  { id:8,  name:'Uzum',         weight:'500 g',   price:14000, category:'meva',     emoji:'🍇' },
  { id:9,  name:'Limon',        weight:'3 ta',    price:6000,  category:'meva',     emoji:'🍋' },
  { id:10, name:'Nok',          weight:'1 kg',    price:16000, category:'meva',     emoji:'🍐' },
  { id:11, name:'Sut',          weight:'1 litr',  price:9000,  category:'sut',      emoji:'🥛' },
  { id:12, name:'Tuxum',        weight:'10 ta',   price:22000, category:'sut',      emoji:'🥚' },
  { id:13, name:'Qatiq',        weight:'500 ml',  price:8000,  category:'sut',      emoji:'🫙' },
  { id:14, name:"Sariyog'",     weight:'200 g',   price:19000, category:'sut',      emoji:'🧈' },
  { id:15, name:'Non',          weight:'500 g',   price:6000,  category:'non',      emoji:'🍞' },
  { id:16, name:'Lavash',       weight:'3 ta',    price:7000,  category:'non',      emoji:'🫓' },
  { id:17, name:'Samsa',        weight:'4 ta',    price:16000, category:'non',      emoji:'🥐' },
  { id:18, name:"Mol go'shti",  weight:'500 g',   price:45000, category:'gosht',    emoji:'🥩' },
  { id:19, name:'Tovuq',        weight:'1 kg',    price:35000, category:'gosht',    emoji:'🍗' },
  { id:20, name:'Limonad',      weight:'1.5 l',   price:12000, category:'ichimlik', emoji:'🧃' },
  { id:21, name:'Suv',          weight:'1.5 l',   price:5000,  category:'ichimlik', emoji:'💧' },
  { id:22, name:'Choy',         weight:'100 g',   price:18000, category:'ichimlik', emoji:'🍵' },
]

const DELIVERY_FEE = 5000

function ProdCard({ product }) {
  const { items, add, remove } = useCartStore()
  const qty = items[product.id] || 0
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0', transition: 'box-shadow 0.15s' }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
    <div style={{ position: 'relative', height: 120, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
    {product.emoji}
    {qty === 0 ? (
      <button onClick={() => add(product)}
      style={{ position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #ddd', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#21a95a', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#21a95a'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#21a95a' }}>+</button>
    ) : (
      <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, background: '#21a95a', borderRadius: 20, padding: '4px 8px' }}>
      <button onClick={() => remove(product.id)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, fontWeight: 700 }}>−</button>
      <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, minWidth: 14, textAlign: 'center' }}>{qty}</span>
      <button onClick={() => add(product)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, fontWeight: 700 }}>+</button>
      </div>
    )}
    </div>
    <div style={{ padding: '10px 12px 12px' }}>
    <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 3 }}>{product.price.toLocaleString('uz-UZ')} so'm</div>
    <div style={{ fontSize: 13, color: '#333', marginBottom: 2, lineHeight: 1.3 }}>{product.name}</div>
    <div style={{ fontSize: 12, color: '#aaa' }}>{product.weight}</div>
    </div>
    </div>
  )
}

function CartPanel({ products, onCheckout }) {
  const { items, add, remove, getCartItems, getTotal } = useCartStore()
  const cartItems = getCartItems(products)
  const subtotal = getTotal(products)
  const total = subtotal + DELIVERY_FEE
  const count = Object.values(items).reduce((s, q) => s + q, 0)
  
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
    <div style={{ padding: '16px', borderBottom: '1px solid #f5f5f5' }}>
    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Savat</div>
    <div style={{ fontSize: 13, color: '#21a95a', fontWeight: 700 }}>⚡ 10–30 daqiqada yetkaziladi</div>
    </div>
    {cartItems.length === 0 ? (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#bbb' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Savat bo'sh</div>
      </div>
    ) : (
      <>
      <div style={{ overflowY: 'auto', maxHeight: 320 }}>
      {cartItems.map(item => (
        <div key={item.id} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f8f8f8' }}>
        <div style={{ fontSize: 26, width: 32, textAlign: 'center' }}>{item.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: '#aaa' }}>{item.price.toLocaleString('uz-UZ')} so'm</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <button onClick={() => remove(item.id)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ fontSize: 13, fontWeight: 800, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
        <button onClick={() => add(item)} style={{ width: 22, height: 22, borderRadius: 6, background: '#21a95a', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        </div>
      ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}><span>Mahsulotlar ({count} ta)</span><span>{subtotal.toLocaleString('uz-UZ')} so'm</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 12 }}><span>Yetkazib berish</span><span>{DELIVERY_FEE.toLocaleString('uz-UZ')} so'm</span></div>
      <button onClick={onCheckout}
      style={{ width: '100%', padding: '13px', background: '#ffd700', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#f5cc00'}
      onMouseLeave={e => e.currentTarget.style.background = '#ffd700'}>
      <span>Buyurtma berish</span>
      <span>{total.toLocaleString('uz-UZ')} so'm</span>
      </button>
      </div>
      </>
    )}
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)
  const [activeAddress, setActiveAddress] = useState(() => getActiveAddress())
  const [showProfile, setShowProfile] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const { items } = useCartStore()
  const cartCount = Object.values(items).reduce((s, q) => s + q, 0)
  
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem('shovot_user') || 'null') } catch { return null } })()
  
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  
  useEffect(() => {
    getProducts().then(res => { if (res.data?.length) setProducts(res.data) }).catch(() => {})
    }, [])
  
  const filtered = products.filter(p => {
    const catOk = activeCat === 'all' || p.category === activeCat || p.category_slug === activeCat
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase())
    return catOk && searchOk
  })
  
  const addressLabel = activeAddress
  ? `${activeAddress.mahalla?.split(' ')[0]}, ${activeAddress.uy}`
  : 'Manzil tanlang'
  
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Nunito', sans-serif" }}>
    
    {/* Header */}
    <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', position: 'sticky', top: 0, zIndex: 50 }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14, height: 58 }}>
    {/* Logo */}
    <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
    Shovot <span style={{ color: '#21a95a' }}>Express</span>
    </div>
    
    {/* Address button — Yandex Lavka uslubida */}
    <button onClick={() => setAddressOpen(true)}
    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f5f5f5', border: '1.5px solid #e8e8e8', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', maxWidth: 220, transition: 'border-color 0.15s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#21a95a'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#21a95a"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addressLabel}</span>
    <span style={{ fontSize: 11, color: '#aaa' }}>›</span>
    </button>
    
    {/* Search */}
    <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
    <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot qidiring..."
    style={{ width: '100%', padding: '8px 12px 8px 34px', background: '#f5f5f5', border: '1.5px solid transparent', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#1a1a1a', boxSizing: 'border-box' }}
    onFocus={e => e.target.style.borderColor = '#21a95a'}
    onBlur={e => e.target.style.borderColor = 'transparent'} />
    </div>
    
    <div style={{ fontSize: 13, color: '#21a95a', fontWeight: 700, whiteSpace: 'nowrap' }}>⚡ 10–30 daqiqa</div>
    
    {/* User avatar */}
    {savedUser && (
      <div style={{ position: 'relative' }}>
      <button onClick={() => setShowProfile(!showProfile)}
      style={{ width: 34, height: 34, borderRadius: '50%', background: '#21a95a', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {savedUser.name[0].toUpperCase()}
      </button>
      {showProfile && (
        <div style={{ position: 'absolute', right: 0, top: 42, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '14px 16px', minWidth: 210, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{savedUser.name}</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>📞 {savedUser.phone}</div>
        <div style={{ fontSize: 12, color: '#21a95a', marginBottom: 14, cursor: 'pointer', fontWeight: 600 }}
        onClick={() => { setShowProfile(false); setAddressOpen(true) }}>
        📍 Manzillarni boshqarish →
        </div>
        <button onClick={() => { localStorage.removeItem('shovot_user'); window.location.reload() }}
        style={{ width: '100%', padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Chiqish
        </button>
        </div>
      )}
      </div>
    )}
    
    {isMobile && cartCount > 0 && (
      <button onClick={() => setCartOpen(true)}
      style={{ background: '#ffd700', border: 'none', borderRadius: 10, padding: '7px 14px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
      🛒 {cartCount}
      </button>
    )}
    </div>
    </div>
    
    {/* Body */}
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
    {/* Categories */}
    <div style={{ width: 190, flexShrink: 0 }}>
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden', position: 'sticky', top: 76 }}>
    {CATEGORIES.map((cat, i) => (
      <button key={cat.id} onClick={() => { setActiveCat(cat.id); setSearch('') }}
      style={{ width: '100%', padding: '10px 14px', border: 'none', borderBottom: i < CATEGORIES.length - 1 ? '1px solid #f8f8f8' : 'none', background: activeCat === cat.id ? '#f0faf4' : '#fff', color: activeCat === cat.id ? '#21a95a' : '#444', fontWeight: activeCat === cat.id ? 800 : 600, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, borderLeft: activeCat === cat.id ? '3px solid #21a95a' : '3px solid transparent', transition: 'all 0.15s' }}>
      <span style={{ fontSize: 15 }}>{cat.emoji}</span>{cat.label}
      </button>
    ))}
    </div>
    </div>
    
    {/* Products */}
    <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 10 }}>
    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
    {search ? `"${search}" natijalari` : CATEGORIES.find(c => c.id === activeCat)?.label}
    </h2>
    <span style={{ fontSize: 13, color: '#bbb', fontWeight: 600 }}>{filtered.length} ta</span>
    </div>
    {filtered.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc' }}>
      <div style={{ fontSize: 52, marginBottom: 10 }}>🔍</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#999' }}>Topilmadi</div>
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
      {filtered.map(p => <ProdCard key={p.id} product={p} />)}
      </div>
    )}
    </div>
    
    {/* Cart (desktop) */}
    {!isMobile && (
      <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 76 }}>
      <CartPanel products={products} onCheckout={() => setCartOpen(true)} />
      </div>
    )}
    </div>
    
    {/* Mobile sticky cart */}
    {isMobile && cartCount > 0 && (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px 16px 20px', background: '#fff', borderTop: '1px solid #f0f0f0', zIndex: 40 }}>
      <button onClick={() => setCartOpen(true)}
      style={{ width: '100%', padding: '14px', background: '#ffd700', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>🛒 Savatga o'tish · {cartCount} ta</span>
      </button>
      </div>
    )}
    
    {/* Modals */}
    <CartModal products={products} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    <AddressModal
    isOpen={addressOpen}
    onClose={() => setAddressOpen(false)}
    onSelect={(addr) => setActiveAddress(addr)}
    />
    </div>
  )
}