import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore'
import { getProducts } from '../api'
import CartModal from '../components/CartModal'
import AddressModal from '../components/AddressModal'
import { getActiveAddress } from '../store/addressStore'
import OrdersPage from './OrdersPage'

const FEE = 5000

const CATS = [
  { id:'all',      label:'Barcha mahsulotlar', short:'Barchasi', emoji:'🏪' },
  { id:'sabzavot', label:'Sabzavot',           short:'Sabzavot', emoji:'🥬' },
  { id:'meva',     label:'Meva',               short:'Meva',     emoji:'🍎' },
  { id:'sut',      label:'Sut mahsulot',       short:'Sut',      emoji:'🥛' },
  { id:'non',      label:'Non & xamir',        short:'Non',      emoji:'🍞' },
  { id:'gosht',    label:"Go'sht",             short:"Go'sht",   emoji:'🥩' },
  { id:'ichimlik', label:'Ichimliklar',        short:'Ichimlik', emoji:'🧃' },
]

const PRODUCTS = [
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

// ─────────────────────────────────────────────────────
function ProfilePopup({ user, onClose, onAddress, onOrders }) {
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    setTimeout(() => document.addEventListener('mousedown', h), 0)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position:'absolute', right:0, top:46, background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, minWidth:220, boxShadow:'0 8px 32px rgba(0,0,0,0.13)', zIndex:300, overflow:'hidden' }}>
    <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid #f5f5f5' }}>
    <div style={{ fontSize:15, fontWeight:800, marginBottom:3 }}>{user.name}</div>
    <div style={{ fontSize:12, color:'#888', marginBottom:2 }}>📞 {user.phone}</div>
    <div onClick={onAddress} style={{ fontSize:12, color:'#21a95a', cursor:'pointer', fontWeight:700, marginTop:8 }}>📍 Manzillarni boshqarish →</div>
    <div onClick={onOrders} style={{ fontSize:12, color:'#555', cursor:'pointer', fontWeight:700, marginTop:6 }}>📦 Barcha buyurtmalar →</div>
    </div>
    <div style={{ padding:'10px 16px 14px' }}>
    <button onClick={() => { localStorage.removeItem('shovot_user'); window.location.reload() }}
    style={{ width:'100%', padding:'8px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
    Chiqish
    </button>
    </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
function Card({ p, mobile }) {
  const { items, add, remove } = useCartStore()
  const qty = items[p.id] || 0
  return (
    <div style={{ background:'#fff', borderRadius:mobile?14:16, overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
    <div style={{ position:'relative', paddingTop: mobile ? '80%' : '72%', background:'#f7f7f7', flexShrink:0 }}>
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize: mobile ? 48 : 56 }}>{p.emoji}</div>
    {qty === 0
      ? <button onClick={()=>add(p)}
      style={{ position:'absolute', bottom:8, right:8, width:mobile?28:32, height:mobile?28:32, borderRadius:'50%', background:'#fff', border:'1.5px solid #e0e0e0', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#21a95a', fontWeight:800, boxShadow:'0 2px 6px rgba(0,0,0,0.1)' }}>+</button>
      : <div style={{ position:'absolute', bottom:8, right:8, display:'flex', alignItems:'center', gap:4, background:'#21a95a', borderRadius:20, padding:'3px 8px' }}>
      <button onClick={()=>remove(p.id)} style={{ background:'none', border:'none', color:'#fff', fontSize:16, cursor:'pointer', lineHeight:1, padding:0, fontWeight:800 }}>−</button>
      <span style={{ color:'#fff', fontSize:12, fontWeight:800, minWidth:14, textAlign:'center' }}>{qty}</span>
      <button onClick={()=>add(p)} style={{ background:'none', border:'none', color:'#fff', fontSize:16, cursor:'pointer', lineHeight:1, padding:0, fontWeight:800 }}>+</button>
      </div>
    }
    </div>
    <div style={{ padding: mobile ? '8px 10px 10px' : '10px 12px 14px', flex:1 }}>
    <div style={{ fontSize: mobile ? 13 : 15, fontWeight:800, color:'#111', marginBottom:2 }}>{p.price.toLocaleString('uz-UZ')} so'm</div>
    <div style={{ fontSize: mobile ? 12 : 13, color:'#333' }}>{p.name}</div>
    <div style={{ fontSize:11, color:'#aaa', marginTop:1 }}>{p.weight}</div>
    </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
function CartSide({ products, onOpen }) {
  const { items, add, remove, getCartItems, getTotal } = useCartStore()
  const list = getCartItems(products)
  const sub = getTotal(products)
  const total = sub + FEE
  const count = Object.values(items).reduce((s,v)=>s+v,0)
  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f0f0f0', overflow:'hidden', position:'sticky', top:84 }}>
    <div style={{ padding:'16px 18px 12px', borderBottom:'1px solid #f5f5f5' }}>
    <div style={{ fontSize:17, fontWeight:800, color:'#111' }}>Savat</div>
    <div style={{ fontSize:12, color:'#21a95a', fontWeight:700, marginTop:3 }}>⚡ 10–30 daqiqada yetkaziladi</div>
    </div>
    {list.length === 0
      ? <div style={{ padding:'36px 18px', textAlign:'center' }}>
      <div style={{ fontSize:40, marginBottom:8 }}>🛒</div>
      <div style={{ fontSize:13, fontWeight:600, color:'#bbb' }}>Savat bo'sh</div>
      </div>
      : <>
      <div style={{ maxHeight:340, overflowY:'auto' }}>
      {list.map(item => (
        <div key={item.id} style={{ padding:'8px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #f8f8f8' }}>
        <span style={{ fontSize:24, flexShrink:0 }}>{item.emoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
        <div style={{ fontSize:11, color:'#aaa' }}>{item.price.toLocaleString('uz-UZ')} so'm</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
        <button onClick={()=>remove(item.id)} style={{ width:24, height:24, borderRadius:8, border:'1.5px solid #e8e8e8', background:'#fff', cursor:'pointer', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
        <span style={{ fontSize:13, fontWeight:800, minWidth:16, textAlign:'center' }}>{item.qty}</span>
        <button onClick={()=>add(item)} style={{ width:24, height:24, borderRadius:8, background:'#21a95a', border:'none', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
        </div>
        </div>
      ))}
      </div>
      <div style={{ padding:'12px 16px 16px', borderTop:'1px solid #f5f5f5' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#aaa', marginBottom:4 }}>
      <span>Mahsulotlar ({count} ta)</span><span>{sub.toLocaleString('uz-UZ')} so'm</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#aaa', marginBottom:12 }}>
      <span>Yetkazib berish</span><span>{FEE.toLocaleString('uz-UZ')} so'm</span>
      </div>
      <button onClick={onOpen}
      style={{ width:'100%', padding:'13px', background:'#ffd700', border:'none', borderRadius:12, fontSize:14, fontWeight:800, fontFamily:'inherit', cursor:'pointer', display:'flex', justifyContent:'space-between' }}>
      <span>Buyurtma berish</span><span>{total.toLocaleString('uz-UZ')} so'm</span>
      </button>
      </div>
      </>
    }
    </div>
  )
}

// ─────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState(PRODUCTS)
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [addrOpen, setAddrOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [addr, setAddr] = useState(() => getActiveAddress())
  const [showProfile, setShowProfile] = useState(false)
  const [w, setW] = useState(window.innerWidth)
  
  const { items } = useCartStore()
  const count = Object.values(items).reduce((s,v)=>s+v,0)
  const sub = useCartStore(s => s.getTotal(products))
  const user = (() => { try { return JSON.parse(localStorage.getItem('shovot_user')||'null') } catch { return null } })()
  
  const isMobile = w < 768
  const isDesktop = w >= 1024
  
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  
  useEffect(() => {
    getProducts().then(r => { if (r.data?.length) setProducts(r.data) }).catch(() => {})
    }, [])
  
  const list = products.filter(p => {
    const c = cat === 'all' || p.category === cat || p.category_slug === cat
    return c && p.name.toLowerCase().includes(q.toLowerCase())
  })
  
  const addrLabel = addr
  ? `${addr.mahalla}${addr.uy ? ', ' + addr.uy : ''}`
  : 'Manzil tanlang'
  
  if (ordersOpen) return (
    <div style={{ position:'fixed', inset:0, zIndex:150, overflowY:'auto', background:'#f5f5f5' }}>
    <OrdersPage onBack={() => setOrdersOpen(false)} />
    </div>
  )
  
  const gridCols = isMobile ? 2 : !isDesktop ? 3 : 4
  
  return (
    <>
    <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }
        body { font-family: 'Nunito', sans-serif; background: #f5f5f5; -webkit-font-smoothing: antialiased; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { scrollbar-width: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
      `}</style>
      
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      
      {/* ══ HEADER ══════════════════════════════════════ */}
      <header style={{ background:'#fff', borderBottom:'1px solid #ebebeb', position:'sticky', top:0, zIndex:100 }}>
      
      {/* Top row */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding: isMobile ? '0 12px' : '0 24px', height: isMobile ? 52 : 60, display:'flex', alignItems:'center', gap: isMobile ? 8 : 16 }}>
      
      {/* Logo */}
      <div onClick={() => setOrdersOpen(false)}
      style={{ fontSize: isMobile ? 15 : 18, fontWeight:900, color:'#111', whiteSpace:'nowrap', cursor:'pointer', letterSpacing:'-0.3px', flexShrink:0 }}>
      Shovot <span style={{ color:'#21a95a' }}>Express</span>
      </div>
      
      {/* Address */}
      <button onClick={() => setAddrOpen(true)}
      style={{ display:'flex', alignItems:'center', gap:5, padding: isMobile ? '5px 10px' : '7px 14px', background:'#f5f5f5', border:'1.5px solid transparent', borderRadius:24, cursor:'pointer', fontFamily:'inherit', maxWidth: isMobile ? 160 : 300, minWidth:0, flexShrink: isMobile ? 1 : 0, transition:'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#21a95a'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#21a95a" style={{ flexShrink:0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      <span style={{ fontSize: isMobile ? 12 : 13, fontWeight:700, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{addrLabel}</span>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" style={{ flexShrink:0 }}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      
      {/* Search — tablet/desktop only */}
      {!isMobile && (
        <div style={{ flex:1, position:'relative', maxWidth:560 }}>
        <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Mahsulot qidiring..."
        style={{ width:'100%', padding:'9px 14px 9px 36px', background:'#f5f5f5', border:'1.5px solid transparent', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', transition:'all .15s' }}
        onFocus={e => { e.target.style.borderColor = '#21a95a'; e.target.style.background = '#fff' }}
        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f5' }} />
        {q && <button onClick={() => setQ('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:15 }}>✕</button>}
        </div>
      )}
      
      <div style={{ flexShrink:0, fontSize: isMobile ? 11 : 13, fontWeight:700, color:'#21a95a', whiteSpace:'nowrap' }}>
      ⚡ {isMobile ? '10–30' : '10–30 daqiqa'}
      </div>
      
      {/* Profile */}
      {user && (
        <div style={{ position:'relative', flexShrink:0 }}>
        <button onClick={() => setShowProfile(!showProfile)}
        style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius:'50%', background:'#21a95a', border:'none', color:'#fff', fontSize: isMobile ? 13 : 15, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {user.name[0].toUpperCase()}
        </button>
        {showProfile && <ProfilePopup user={user} onClose={() => setShowProfile(false)}
        onAddress={() => { setShowProfile(false); setAddrOpen(true) }}
        onOrders={() => { setShowProfile(false); setOrdersOpen(true) }} />}
        </div>
      )}
      
      {/* Mobile cart badge */}
      {isMobile && count > 0 && (
        <button onClick={() => setCartOpen(true)}
        style={{ flexShrink:0, background:'#21a95a', border:'none', borderRadius:10, padding:'5px 10px', color:'#fff', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
        🛒 {count}
        </button>
      )}
      </div>
      
      {/* Mobile search row */}
      {isMobile && (
        <div style={{ padding:'0 12px 8px', position:'relative' }}>
        <svg style={{ position:'absolute', left:22, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Mahsulot qidiring..."
        style={{ width:'100%', padding:'9px 14px 9px 32px', background:'#f5f5f5', border:'1.5px solid transparent', borderRadius:12, fontSize:13, fontFamily:'inherit', outline:'none' }}
        onFocus={e => { e.target.style.borderColor = '#21a95a'; e.target.style.background = '#fff' }}
        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f5' }} />
        </div>
      )}
      
      {/* Mobile category chips */}
      {isMobile && (
        <div className="no-scroll" style={{ display:'flex', gap:6, padding:'0 12px 10px', overflowX:'auto' }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => { setCat(c.id); setQ('') }}
          style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:20, border:`1.5px solid ${cat===c.id?'#21a95a':'#e8e8e8'}`, background:cat===c.id?'#21a95a':'#fff', color:cat===c.id?'#fff':'#555', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0 }}>
          <span style={{ fontSize:14 }}>{c.emoji}</span>{c.short}
          </button>
        ))}
        </div>
      )}
      </header>
      
      {/* ══ MAIN ════════════════════════════════════════ */}
      <div style={{ flex:1, maxWidth:1400, margin:'0 auto', width:'100%', padding: isMobile ? '0' : '0 24px', display:'flex', gap:0, alignItems:'flex-start' }}>
      
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{ width:210, flexShrink:0, paddingTop:24, paddingRight:8 }}>
        <nav style={{ background:'#fff', borderRadius:16, border:'1px solid #f0f0f0', overflow:'hidden', position:'sticky', top:84 }}>
        {CATS.map((c,i) => (
          <button key={c.id} onClick={() => { setCat(c.id); setQ('') }}
          style={{ width:'100%', padding:'11px 16px', border:'none', borderBottom:i<CATS.length-1?'1px solid #f8f8f8':'none', background:cat===c.id?'#f0faf5':'#fff', color:cat===c.id?'#21a95a':'#444', fontWeight:cat===c.id?800:500, fontSize:14, fontFamily:'inherit', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:10, borderLeft:cat===c.id?'3px solid #21a95a':'3px solid transparent', transition:'all .12s' }}>
          <span style={{ fontSize:17 }}>{c.emoji}</span>{c.label}
          </button>
        ))}
        </nav>
        </aside>
      )}
      
      {/* Products */}
      <main style={{ flex:1, minWidth:0, padding: isMobile ? '14px 12px 100px' : '24px 16px 40px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: isMobile ? 12 : 18 }}>
      <h1 style={{ fontSize: isMobile ? 17 : 22, fontWeight:800, color:'#111' }}>
      {q ? `"${q}"` : CATS.find(c=>c.id===cat)?.label}
      </h1>
      <span style={{ fontSize:12, color:'#bbb', fontWeight:600, marginTop:2 }}>{list.length} ta</span>
      </div>
      {list.length === 0
        ? <div style={{ textAlign:'center', padding:'60px 0', color:'#ccc' }}>
        <div style={{ fontSize:48, marginBottom:10 }}>🔍</div>
        <div style={{ fontSize:14, fontWeight:600, color:'#aaa' }}>Topilmadi</div>
        </div>
        : <div style={{ display:'grid', gridTemplateColumns:`repeat(${gridCols}, 1fr)`, gap: isMobile ? 8 : 12 }}>
        {list.map(p => <Card key={p.id} p={p} mobile={isMobile} />)}
        </div>
      }
      </main>
      
      {/* Desktop cart */}
      {isDesktop && (
        <aside style={{ width:300, flexShrink:0, paddingTop:24, paddingLeft:8 }}>
        <CartSide products={products} onOpen={() => setCartOpen(true)} />
        </aside>
      )}
      </div>
      
      {/* Mobile sticky cart button */}
      {isMobile && count > 0 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'10px 12px 18px', background:'#fff', borderTop:'1px solid #f0f0f0', zIndex:50 }}>
        <button onClick={() => setCartOpen(true)}
        style={{ width:'100%', padding:'14px 16px', background:'#21a95a', color:'#fff', border:'none', borderRadius:14, fontSize:15, fontWeight:800, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span>🛒 Savat · {count} ta</span>
        <span>{(sub + FEE).toLocaleString('uz-UZ')} so'm</span>
        </button>
        </div>
      )}
      
      {/* Tablet cart button */}
      {!isMobile && !isDesktop && count > 0 && (
        <div style={{ position:'fixed', bottom:20, right:24, zIndex:50 }}>
        <button onClick={() => setCartOpen(true)}
        style={{ padding:'13px 22px', background:'#21a95a', color:'#fff', border:'none', borderRadius:14, fontSize:14, fontWeight:800, fontFamily:'inherit', cursor:'pointer', boxShadow:'0 4px 20px rgba(33,169,90,.35)', display:'flex', alignItems:'center', gap:10 }}>
        <span>🛒 {count} ta</span>
        <span>·</span>
        <span>{(sub + FEE).toLocaleString('uz-UZ')} so'm</span>
        </button>
        </div>
      )}
      </div>
      
      <CartModal products={products} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <AddressModal isOpen={addrOpen} onClose={() => setAddrOpen(false)} onSelect={a => setAddr(a)} />
      </>
    )
  }