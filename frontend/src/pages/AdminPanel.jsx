import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://shovot-express.onrender.com/api'

const STATUS = {
    new:        { label: 'Yangi',         bg: '#fef3c7', color: '#92400e' },
    confirmed:  { label: 'Tasdiqlandi',   bg: '#dbeafe', color: '#1e40af' },
    delivering: { label: 'Yetkazilmoqda', bg: '#d1fae5', color: '#065f46' },
    done:       { label: 'Bajarildi',     bg: '#f0fdf4', color: '#166534' },
    cancelled:  { label: 'Bekor',         bg: '#fee2e2', color: '#991b1b' },
}

const CATS = ['sabzavot', 'meva', 'sut', 'non', 'gosht', 'ichimlik']

// ── Styles ────────────────────────────────────────────
const C = {
    sidebar:   { width: 220, background: '#16162a', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    navItem:   (active) => ({ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: active ? '#ffd700' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: active ? 700 : 500, background: active ? 'rgba(255,215,0,0.08)' : 'transparent', borderLeft: `3px solid ${active ? '#ffd700' : 'transparent'}`, transition: 'all 0.15s', userSelect: 'none' }),
    card:      { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '14px 16px' },
    statCard:  { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '14px 16px', flex: 1 },
    btn:       (color='#ffd700', text='#1a1a1a') => ({ background: color, color: text, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' }),
    input:     { width: '100%', padding: '8px 11px', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#1a1a1a', background: '#fff', boxSizing: 'border-box' },
    select:    { width: '100%', padding: '8px 11px', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#1a1a1a', background: '#fff', boxSizing: 'border-box' },
    th:        { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#aaa', fontWeight: 700, background: '#fafafa', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
    td:        { padding: '10px 14px', fontSize: 13, color: '#333', borderBottom: '1px solid #f8f8f8' },
}

// ── Dashboard ─────────────────────────────────────────
function Dashboard({ orders, products }) {
    const todayOrders = orders.filter(o => {
        const d = new Date(o.created_at)
        const now = new Date()
        return d.toDateString() === now.toDateString()
    })
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0)
    const newOrders = orders.filter(o => o.status === 'new').length
    const avgOrder = orders.length ? Math.round(orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length) : 0
    
    return (
        <div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
            { label: "Bugungi buyurtmalar", val: todayOrders.length, sub: `${newOrders} ta yangi`, subColor: newOrders > 0 ? '#dc2626' : '#aaa' },
            { label: "Bugungi daromad", val: (todayRevenue / 1000).toFixed(0) + 'K so\'m', sub: 'bugun', subColor: '#21a95a' },
            { label: "Jami buyurtmalar", val: orders.length, sub: 'barcha vaqt', subColor: '#aaa' },
            { label: "O'rtacha buyurtma", val: (avgOrder / 1000).toFixed(0) + 'K so\'m', sub: 'o\'rtacha', subColor: '#aaa' },
        ].map((s, i) => (
            <div key={i} style={C.statCard}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 3 }}>{s.val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.subColor }}>{s.sub}</div>
            </div>
        ))}
        </div>
        
        {/* New orders alert */}
        {newOrders > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{newOrders} ta yangi buyurtma kutilmoqda!</div>
            <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>Tezda tasdiqlang va kuryer yuboring</div>
            </div>
            </div>
        )}
        
        {/* Recent orders */}
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Oxirgi buyurtmalar</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
        <tr>
        {['#', 'Mijoz', 'Summa', 'Status', 'Vaqt'].map(h => (
            <th key={h} style={C.th}>{h}</th>
        ))}
        </tr>
        </thead>
        <tbody>
        {orders.slice(0, 8).map(o => {
            const st = STATUS[o.status] || STATUS.new
            return (
                <tr key={o.id} style={{ cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                <td style={{ ...C.td, fontWeight: 700, color: '#1a1a1a' }}>#{o.id}</td>
                <td style={C.td}>{o.telegram_username ? `@${o.telegram_username}` : 'Mehmon'}</td>
                <td style={{ ...C.td, fontWeight: 700 }}>{o.total?.toLocaleString('uz-UZ')} so'm</td>
                <td style={C.td}><span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{st.label}</span></td>
                <td style={{ ...C.td, color: '#aaa' }}>{new Date(o.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            )
        })}
        {orders.length === 0 && (
            <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#ccc' }}>Hali buyurtma yo'q</td></tr>
        )}
        </tbody>
        </table>
        </div>
        </div>
    )
}

// ── Orders ────────────────────────────────────────────
function Orders({ orders, onRefresh }) {
    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('all')
    
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
    
    const changeStatus = async (id, status) => {
        await axios.patch(`${API}/orders/${id}/status`, { status })
        onRefresh()
        if (selected?.id === id) setSelected(s => ({ ...s, status }))
        }
    
    return (
        <div style={{ display: 'flex', gap: 16, height: '100%' }}>
        {/* List */}
        <div style={{ flex: 1, minWidth: 0 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[['all', 'Barchasi'], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === key ? '#1a1a1a' : '#e8e8e8'}`, background: filter === key ? '#1a1a1a' : '#fff', color: filter === key ? '#fff' : '#666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >{label} {key !== 'all' && <span style={{ opacity: 0.6 }}>({orders.filter(o => o.status === key).length})</span>}</button>
        ))}
        </div>
        
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
        <tr>{['#', 'Mijoz', 'Mahsulotlar', 'Summa', 'Status', 'Vaqt', 'Amal'].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
        {filtered.map(o => {
            const st = STATUS[o.status] || STATUS.new
            const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
            return (
                <tr key={o.id} onClick={() => setSelected({ ...o, items })}
                style={{ cursor: 'pointer', background: selected?.id === o.id ? '#f9fafb' : '' }}
                onMouseEnter={e => { if (selected?.id !== o.id) e.currentTarget.style.background = '#fafafa' }}
                onMouseLeave={e => { if (selected?.id !== o.id) e.currentTarget.style.background = '' }}
                >
                <td style={{ ...C.td, fontWeight: 700, color: '#1a1a1a' }}>#{o.id}</td>
                <td style={C.td}>{o.telegram_username ? `@${o.telegram_username}` : 'Mehmon'}</td>
                <td style={{ ...C.td, color: '#888', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {items.map(i => i.name || `#${i.productId}`).join(', ')}
                </td>
                <td style={{ ...C.td, fontWeight: 700 }}>{o.total?.toLocaleString('uz-UZ')} so'm</td>
                <td style={C.td}><span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{st.label}</span></td>
                <td style={{ ...C.td, color: '#aaa', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={C.td}>
                <select value={o.status} onChange={e => { e.stopPropagation(); changeStatus(o.id, e.target.value) }}
                style={{ ...C.select, width: 130, padding: '4px 8px', fontSize: 11 }}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                </td>
                </tr>
            )
        })}
        {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#ccc' }}>Buyurtma topilmadi</td></tr>}
        </tbody>
        </table>
        </div>
        </div>
        
        {/* Detail panel */}
        {selected && (
            <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ ...C.card, position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Buyurtma #{selected.id}</div>
            <button onClick={() => setSelected(null)} style={{ background: '#f5f5f5', border: 'none', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 13, color: '#888' }}>✕</button>
            </div>
            <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
            {[
                ['Mijoz', selected.telegram_username ? `@${selected.telegram_username}` : 'Mehmon'],
                ['Sana', new Date(selected.created_at).toLocaleString('uz-UZ')],
                ['Status', STATUS[selected.status]?.label],
            ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{v}</span>
                </div>
            ))}
            </div>
            
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#555' }}>Mahsulotlar</div>
            {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span>{item.name || `Mahsulot #${item.productId}`} × {item.qty}</span>
                <span style={{ fontWeight: 700 }}>{((item.price || 0) * item.qty).toLocaleString('uz-UZ')}</span>
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, marginTop: 10, paddingTop: 10, borderTop: '1px solid #e8e8e8' }}>
            <span>Jami</span>
            <span style={{ color: '#21a95a' }}>{selected.total?.toLocaleString('uz-UZ')} so'm</span>
            </div>
            
            <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#555' }}>Status o'zgartirish</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(STATUS).map(([key, val]) => (
                <button key={key} onClick={() => changeStatus(selected.id, key)}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${selected.status === key ? val.color : '#e8e8e8'}`, background: selected.status === key ? val.bg : '#fff', color: selected.status === key ? val.color : '#666', fontSize: 12, fontWeight: selected.status === key ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >{val.label}</button>
            ))}
            </div>
            </div>
            </div>
        )}
        </div>
    )
}

// ── Products ──────────────────────────────────────────
function Products({ products, onRefresh }) {
    const [showForm, setShowForm] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [form, setForm] = useState({ name: '', weight: '', price: '', category_slug: 'sabzavot', emoji: '' })
    const [search, setSearch] = useState('')
    
    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    
    const openAdd = () => { setForm({ name: '', weight: '', price: '', category_slug: 'sabzavot', emoji: '' }); setEditItem(null); setShowForm(true) }
    const openEdit = (p) => { setForm({ name: p.name, weight: p.weight || '', price: p.price, category_slug: p.category_slug || p.category, emoji: p.emoji || '' }); setEditItem(p); setShowForm(true) }
    
    const save = async () => {
        if (!form.name || !form.price) return alert('Nom va narx majburiy!')
            try {
            const data = { ...form, price: parseInt(form.price) }
            if (editItem) await axios.put(`${API}/products/${editItem.id}`, { ...data, in_stock: 1 })
                else await axios.post(`${API}/products`, data)
            setShowForm(false)
            onRefresh()
        } catch { alert('Xato yuz berdi') }
    }
    
    const del = async (id) => {
        if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
        await axios.delete(`${API}/products/${id}`)
        onRefresh()
    }
    
    return (
        <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, position: 'relative' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot qidirish..." style={{ ...C.input, paddingLeft: 32 }} />
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#ccc', fontSize: 14 }}>🔍</span>
        </div>
        <button onClick={openAdd} style={C.btn()}>+ Yangi mahsulot</button>
        </div>
        
        {/* Add/Edit form */}
        {showForm && (
            <div style={{ ...C.card, marginBottom: 16, borderColor: '#ffd700' }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: '#1a1a1a' }}>
            {editItem ? `Tahrirlash: ${editItem.name}` : 'Yangi mahsulot qo\'shish'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Nomi *</label><input style={C.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Pomidor" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Og'irligi</label><input style={C.input} value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="1 kg" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Narxi (so'm) *</label><input style={C.input} type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="12000" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Kategoriya</label>
            <select style={C.select} value={form.category_slug} onChange={e => setForm({...form, category_slug: e.target.value})}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            </div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: '#888', display: 'block', marginBottom: 4 }}>Emoji</label><input style={C.input} value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} placeholder="🍅" /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} style={C.btn()}>Saqlash</button>
            <button onClick={() => setShowForm(false)} style={C.btn('#f0f0f0', '#555')}>Bekor</button>
            </div>
            </div>
        )}
        
        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
        <tr>{['', 'Nomi', 'Kategoriya', 'Og\'irligi', 'Narxi', 'Amallar'].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
        {filtered.map(p => (
            <tr key={p.id}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
            >
            <td style={{ ...C.td, fontSize: 22, width: 40, textAlign: 'center' }}>{p.emoji}</td>
            <td style={{ ...C.td, fontWeight: 700, color: '#1a1a1a' }}>{p.name}</td>
            <td style={C.td}><span style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#555' }}>{p.category_slug || p.category}</span></td>
            <td style={C.td}>{p.weight}</td>
            <td style={{ ...C.td, fontWeight: 700, color: '#21a95a' }}>{p.price?.toLocaleString('uz-UZ')} so'm</td>
            <td style={C.td}>
            <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => openEdit(p)} style={{ ...C.btn('#f0fdf4', '#166534'), padding: '5px 12px', fontSize: 12 }}>Tahrirlash</button>
            <button onClick={() => del(p.id)} style={{ ...C.btn('#fee2e2', '#dc2626'), padding: '5px 12px', fontSize: 12 }}>O'chirish</button>
            </div>
            </td>
            </tr>
        ))}
        {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#ccc' }}>Mahsulot topilmadi</td></tr>}
        </tbody>
        </table>
        </div>
        </div>
    )
}

// ── Main AdminPanel ───────────────────────────────────
export default function AdminPanel() {
    const [auth, setAuth] = useState(false)
    const [pass, setPass] = useState('')
    const [tab, setTab] = useState('dashboard')
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const ADMIN_PASS = 'shovot2024'
    
    const newCount = orders.filter(o => o.status === 'new').length
    
    const loadData = async () => {
        try {
            const [o, p] = await Promise.all([axios.get(`${API}/orders`), axios.get(`${API}/products`)])
            setOrders(o.data.map(x => ({ ...x, items: typeof x.items === 'string' ? JSON.parse(x.items) : x.items })))
            setProducts(p.data)
        } catch { /* offline */ }
        setLoading(false)
    }
    
    useEffect(() => { if (auth) loadData() }, [auth])
        
    // Login screen
    if (!auth) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontFamily: "'Nunito', sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', width: 340, boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, background: '#16162a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>🛒</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>Shovot Express</div>
        <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Admin Panel</div>
        </div>
        <input type="password" placeholder="Parol kiriting" value={pass}
        onChange={e => setPass(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && pass === ADMIN_PASS && setAuth(true)}
        style={{ ...C.input, marginBottom: 12, padding: '11px 14px', background: '#f9f9f9' }}
        />
        <button onClick={() => pass === ADMIN_PASS ? setAuth(true) : alert("Parol noto'g'ri!")}
        style={{ ...C.btn(), width: '100%', padding: '13px', fontSize: 15 }}>
        Kirish
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#ccc', marginTop: 14 }}>
        Parol: shovot2024
        </div>
        </div>
        </div>
    )
    
    const NAV = [
        { id: 'dashboard', label: 'Dashboard',    icon: '📊', section: 'main' },
        { id: 'orders',    label: 'Buyurtmalar',   icon: '📦', section: 'main', badge: newCount },
        { id: 'products',  label: 'Mahsulotlar',   icon: '🛍️', section: 'main' },
        { id: 'analytics', label: 'Hisobotlar',    icon: '📈', section: 'analytics' },
        { id: 'settings',  label: 'Sozlamalar',    icon: '⚙️', section: 'settings' },
    ]
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Nunito', sans-serif", background: '#f5f5f5' }}>
        
        {/* ── SIDEBAR ── */}
        <div style={C.sidebar}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: '#ffd700', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛒</div>
        <div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>Shovot Express</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Admin Panel</div>
        </div>
        </div>
        </div>
        
        {/* Nav */}
        <div style={{ padding: '10px 0', flex: 1 }}>
        {['main', 'analytics', 'settings'].map(section => {
            const items = NAV.filter(n => n.section === section)
            if (!items.length) return null
            return (
                <div key={section}>
                <div style={{ padding: '10px 18px 4px', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {section === 'main' ? 'Asosiy' : section === 'analytics' ? 'Analitika' : 'Tizim'}
                </div>
                {items.map(item => (
                    <div key={item.id} onClick={() => setTab(item.id)} style={C.navItem(tab === item.id)}>
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                        <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>{item.badge}</span>
                    )}
                    </div>
                ))}
                </div>
            )
        })}
        </div>
        
        {/* User */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#21a95a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>A</div>
        <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Admin</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Shovot Express</div>
        </div>
        <button onClick={() => setAuth(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>⎋</button>
        </div>
        </div>
        </div>
        
        {/* ── MAIN ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>
        {NAV.find(n => n.id === tab)?.label || 'Dashboard'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {newCount > 0 && (
            <div style={{ background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>
            🔔 {newCount} yangi buyurtma
            </div>
        )}
        <button onClick={loadData} style={{ ...C.btn('#f5f5f5', '#555'), padding: '7px 14px', fontSize: 12 }}>↻ Yangilash</button>
        </div>
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Yuklanmoqda...</div>
            </div>
        ) : (
            <>
            {tab === 'dashboard' && <Dashboard orders={orders} products={products} />}
            {tab === 'orders' && <Orders orders={orders} onRefresh={loadData} />}
            {tab === 'products' && <Products products={products} onRefresh={loadData} />}
            {tab === 'analytics' && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#888' }}>Hisobotlar bo'limi</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Tez orada qo'shiladi</div>
                </div>
            )}
            {tab === 'settings' && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#888' }}>Sozlamalar</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Tez orada qo'shiladi</div>
                </div>
            )}
            </>
        )}
        </div>
        </div>
        </div>
    )
}