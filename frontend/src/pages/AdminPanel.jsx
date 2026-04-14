import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://shovot-express.onrender.com/api'

const TABS = [
    { id: 'orders', label: '📦 Buyurtmalar' },
    { id: 'products', label: '🛍️ Mahsulotlar' },
]

const STATUS_COLORS = {
    new:        { bg: '#fff3cd', color: '#856404', label: 'Yangi' },
    confirmed:  { bg: '#cce5ff', color: '#004085', label: 'Tasdiqlandi' },
    delivering: { bg: '#d4edda', color: '#155724', label: 'Yetkazilmoqda' },
    done:       { bg: '#d1ecf1', color: '#0c5460', label: 'Bajarildi' },
    cancelled:  { bg: '#f8d7da', color: '#721c24', label: 'Bekor qilindi' },
}

// ─── ORDERS TAB ───────────────────────────────────────
function OrdersTab() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    
    const load = async () => {
        try {
            const res = await axios.get(`${API}/orders`)
            setOrders(res.data)
        } catch {
            // fallback mock
            setOrders([])
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => { load() }, [])
    
    const changeStatus = async (id, status) => {
        await axios.patch(`${API}/orders/${id}/status`, { status })
        load()
        setSelected(s => s ? { ...s, status } : s)
    }
    
    if (loading) return <div style={s.center}>Yuklanmoqda...</div>
    
    if (orders.length === 0) return (
        <div style={s.center}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <p style={{ color: '#6b7280' }}>Hali buyurtma yo'q</p>
        </div>
    )
    
    return (
        <div style={{ display: 'flex', gap: 16, height: '100%' }}>
        {/* List */}
        <div style={{ width: 340, overflowY: 'auto', borderRight: '1px solid #e5e7eb' }}>
        {orders.map(o => {
            const st = STATUS_COLORS[o.status] || STATUS_COLORS.new
            const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items
            return (
                <div
                key={o.id}
                onClick={() => setSelected({ ...o, items })}
                style={{
                    ...s.orderRow,
                    background: selected?.id === o.id ? '#f0fdf4' : '#fff',
                    borderLeft: selected?.id === o.id ? '3px solid #2db67d' : '3px solid transparent',
                }}
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>#{o.id} buyurtma</span>
                <span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
                {o.telegram_username ? `@${o.telegram_username}` : 'Noma\'lum'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2db67d' }}>
                {o.total?.toLocaleString('uz-UZ')} so'm
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                {new Date(o.created_at).toLocaleString('uz-UZ')}
                </div>
                </div>
            )
        })}
        </div>
        
        {/* Detail */}
        {selected ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Buyurtma #{selected.id}</h2>
            <button onClick={() => setSelected(null)} style={s.closeBtn}>✕</button>
            </div>
            
            {/* Info */}
            <div style={s.infoCard}>
            <div style={s.infoRow}>
            <span style={s.infoLabel}>Mijoz</span>
            <span>{selected.telegram_username ? `@${selected.telegram_username}` : 'Noma\'lum'}</span>
            </div>
            <div style={s.infoRow}>
            <span style={s.infoLabel}>Sana</span>
            <span>{new Date(selected.created_at).toLocaleString('uz-UZ')}</span>
            </div>
            <div style={s.infoRow}>
            <span style={s.infoLabel}>Status</span>
            <span style={{ ...s.badge, background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color }}>
            {STATUS_COLORS[selected.status]?.label}
            </span>
            </div>
            </div>
            
            {/* Items */}
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 16 }}>Mahsulotlar</h3>
            <div style={s.infoCard}>
            {selected.items?.map((item, i) => (
                <div key={i} style={{ ...s.infoRow, borderBottom: i < selected.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <span>{item.name || `Mahsulot #${item.productId}`} × {item.qty}</span>
                <span style={{ fontWeight: 600 }}>{(item.price * item.qty)?.toLocaleString('uz-UZ')} so'm</span>
                </div>
            ))}
            <div style={{ ...s.infoRow, fontWeight: 700, borderTop: '1px solid #e5e7eb', marginTop: 4, paddingTop: 8 }}>
            <span>Jami</span>
            <span style={{ color: '#2db67d' }}>{selected.total?.toLocaleString('uz-UZ')} so'm</span>
            </div>
            </div>
            
            {/* Status change */}
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 16 }}>Status o'zgartirish</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <button
                key={key}
                onClick={() => changeStatus(selected.id, key)}
                style={{
                    ...s.statusBtn,
                    background: selected.status === key ? val.bg : '#f9fafb',
                    color: selected.status === key ? val.color : '#374151',
                    border: `1px solid ${selected.status === key ? val.color : '#e5e7eb'}`,
                    fontWeight: selected.status === key ? 700 : 400,
                }}
                >
                {val.label}
                </button>
            ))}
            </div>
            </div>
        ) : (
            <div style={s.center}>
            <p style={{ color: '#9ca3af' }}>Buyurtmani tanlang</p>
            </div>
        )}
        </div>
    )
}

// ─── PRODUCTS TAB ─────────────────────────────────────
function ProductsTab() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', weight: '', price: '', category_slug: 'sabzavot', emoji: '' })
    const [adding, setAdding] = useState(false)
    
    const CATS = ['sabzavot', 'meva', 'sut', 'non', 'gosht', 'ichimlik']
    
    const load = async () => {
        try {
            const res = await axios.get(`${API}/products`)
            setProducts(res.data)
        } catch {
            setProducts([])
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => { load() }, [])
    
    const addProduct = async () => {
        if (!form.name || !form.price) return alert('Nom va narx majburiy!')
            try {
            await axios.post(`${API}/products`, { ...form, price: parseInt(form.price) })
            setForm({ name: '', weight: '', price: '', category_slug: 'sabzavot', emoji: '' })
            setAdding(false)
            load()
        } catch {
            alert('Xato yuz berdi')
        }
    }
    
    const deleteProduct = async (id) => {
        if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
        await axios.delete(`${API}/products/${id}`)
        load()
    }
    
    if (loading) return <div style={s.center}>Yuklanmoqda...</div>
    
    return (
        <div>
        {/* Add button */}
        <div style={{ marginBottom: 16 }}>
        <button onClick={() => setAdding(!adding)} style={s.addBtn}>
        {adding ? '✕ Bekor qilish' : '+ Yangi mahsulot'}
        </button>
        </div>
        
        {/* Add form */}
        {adding && (
            <div style={{ ...s.infoCard, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Yangi mahsulot</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
            <label style={s.formLabel}>Nomi *</label>
            <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Pomidor" />
            </div>
            <div>
            <label style={s.formLabel}>Og'irligi</label>
            <input style={s.input} value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="1 kg" />
            </div>
            <div>
            <label style={s.formLabel}>Narxi (so'm) *</label>
            <input style={s.input} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="12000" />
            </div>
            <div>
            <label style={s.formLabel}>Emoji</label>
            <input style={s.input} value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🍅" />
            </div>
            <div>
            <label style={s.formLabel}>Kategoriya</label>
            <select style={s.input} value={form.category_slug} onChange={e => setForm({ ...form, category_slug: e.target.value })}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            </div>
            </div>
            <button onClick={addProduct} style={{ ...s.addBtn, marginTop: 12 }}>Saqlash</button>
            </div>
        )}
        
        {/* Products table */}
        <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
        <thead>
        <tr style={{ background: '#f9fafb' }}>
        <th style={s.th}>Emoji</th>
        <th style={s.th}>Nomi</th>
        <th style={s.th}>Og'irligi</th>
        <th style={s.th}>Narxi</th>
        <th style={s.th}>Kategoriya</th>
        <th style={s.th}>Amal</th>
        </tr>
        </thead>
        <tbody>
        {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={s.td}><span style={{ fontSize: 22 }}>{p.emoji}</span></td>
            <td style={{ ...s.td, fontWeight: 600 }}>{p.name}</td>
            <td style={s.td}>{p.weight}</td>
            <td style={{ ...s.td, color: '#2db67d', fontWeight: 700 }}>{p.price?.toLocaleString('uz-UZ')} so'm</td>
            <td style={s.td}>{p.category_slug}</td>
            <td style={s.td}>
            <button onClick={() => deleteProduct(p.id)} style={s.delBtn}>O'chirish</button>
            </td>
            </tr>
        ))}
        </tbody>
        </table>
        </div>
        </div>
    )
}

// ─── STYLES ───────────────────────────────────────────
const s = {
    center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 },
    badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
    orderRow: { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' },
    infoCard: { background: '#f9fafb', borderRadius: 12, padding: '12px 16px', border: '1px solid #f3f4f6' },
    infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 },
    infoLabel: { color: '#6b7280', fontWeight: 500 },
    statusBtn: { padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' },
    closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' },
    addBtn: { padding: '8px 18px', background: '#2db67d', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    delBtn: { padding: '4px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: { padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '10px 12px' },
    formLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' },
}

// ─── MAIN ADMIN APP ───────────────────────────────────
export default function AdminPanel() {
    const [tab, setTab] = useState('orders')
    const [auth, setAuth] = useState(false)
    const [pass, setPass] = useState('')
    const ADMIN_PASS = 'shovot2024'
    
    if (!auth) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7faf9' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Admin Panel</h1>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Shovot Express</p>
        </div>
        <input
        type="password"
        placeholder="Parol"
        value={pass}
        onChange={e => setPass(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && pass === ADMIN_PASS && setAuth(true)}
        style={{ ...s.input, marginBottom: 12, padding: '10px 14px' }}
        />
        <button
        onClick={() => pass === ADMIN_PASS ? setAuth(true) : alert('Parol noto\'g\'ri!')}
        style={{ ...s.addBtn, width: '100%', padding: '12px' }}
        >
        Kirish
        </button>
        </div>
        </div>
    )
    
    return (
        <div style={{ minHeight: '100vh', background: '#f7faf9', fontFamily: 'Nunito, sans-serif' }}>
        {/* Header */}
        <div style={{ background: '#2db67d', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>
        🛒 Shovot Express — Admin
        </h1>
        <button onClick={() => setAuth(false)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
        Chiqish
        </button>
        </div>
        
        {/* Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', gap: 4 }}>
        {TABS.map(t => (
            <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
                padding: '12px 20px',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid #2db67d' : '2px solid transparent',
                background: 'none',
                fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? '#2db67d' : '#6b7280',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
            }}
            >
            {t.label}
            </button>
        ))}
        </div>
        
        {/* Content */}
        <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        </div>
        </div>
    )
}
