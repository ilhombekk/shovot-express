import { useState, useEffect, useRef } from 'react'
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
const CAT_LIST = [
    { slug: 'sabzavot', label: 'Sabzavot',     emoji: '🥬' },
    { slug: 'meva',     label: 'Meva',         emoji: '🍎' },
    { slug: 'sut',      label: 'Sut mahsulot', emoji: '🥛' },
    { slug: 'non',      label: 'Non & xamir',  emoji: '🍞' },
    { slug: 'gosht',    label: "Go'sht",       emoji: '🥩' },
    { slug: 'ichimlik', label: 'Ichimlik',     emoji: '🧃' },
]

function ProductModal({ item, onSave, onClose }) {
    const [form, setForm] = useState({
        name: item?.name || '',
        weight: item?.weight || '',
        price: item?.price || '',
        category_slug: item?.category_slug || item?.category || 'sabzavot',
        in_stock: item?.in_stock ?? 1,
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(item?.image_url || null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [errors, setErrors] = useState({})
    const fileRef = useRef(null)
    
    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Nom kiritilishi shart'
        if (!form.price || parseInt(form.price) <= 0) e.price = 'Narx kiritilishi shart'
        setErrors(e)
        return Object.keys(e).length === 0
    }
    
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { alert("Rasm 5MB dan kichik bo'lishi kerak"); return }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }
    
    const save = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            const data = { ...form, price: parseInt(form.price), in_stock: form.in_stock ? 1 : 0 }
            let productId = item?.id
            
            if (item) {
                await axios.put(`${API}/products/${item.id}`, data)
            } else {
                const res = await axios.post(`${API}/products`, data)
                productId = res.data.id
            }
            
            // Rasm yuklash
            if (imageFile && productId) {
                setUploading(true)
                const fd = new FormData()
                fd.append('image', imageFile)
                await axios.post(`${API}/products/${productId}/image`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                setUploading(false)
            }
            
            onSave()
        } catch (e) {
            console.error(e)
            alert('Xato: ' + (e.response?.data?.error || e.message))
        }
        setSaving(false)
    }
    
    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Nunito', sans-serif" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        
        {/* Header */}
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f5f5f5', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
        <div style={{ fontSize:17, fontWeight:800, color:'#111' }}>{item ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</div>
        <div style={{ fontSize:12, color:'#aaa', marginTop:1 }}>{item ? `ID: #${item.id}` : "Yangi mahsulot qo'shish"}</div>
        </div>
        <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'#f5f5f5', border:'none', cursor:'pointer', fontSize:15, color:'#888', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        
        <div style={{ padding:'18px 22px 22px' }}>
        
        {/* Rasm yuklash */}
        <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#888', marginBottom:8 }}>MAHSULOT RASMI</div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
        {/* Preview */}
        <div onClick={() => fileRef.current?.click()}
        style={{ width:90, height:90, borderRadius:16, border:`2px dashed ${imagePreview?'#21a95a':'#ddd'}`, background:imagePreview?'#f0fdf4':'#fafafa', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', flexShrink:0, transition:'all .15s' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#21a95a'}
        onMouseLeave={e=>e.currentTarget.style.borderColor=imagePreview?'#21a95a':'#ddd'}>
        {imagePreview
            ? <img src={imagePreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:24, color:'#ccc' }}>📷</div>
            <div style={{ fontSize:10, color:'#ccc', marginTop:3 }}>Rasm</div>
            </div>
        }
        </div>
        
        <div style={{ flex:1 }}>
        <button onClick={() => fileRef.current?.click()}
        style={{ width:'100%', padding:'9px', background:'#f5f5f5', border:'1px solid #e8e8e8', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:6, color:'#333' }}>
        📁 Rasm yuklash
        </button>
        <div style={{ fontSize:11, color:'#aaa', lineHeight:1.5 }}>
        JPG, PNG, WEBP · Max 5MB<br/>
        Tavsiya: 500×500 px, kvadrat
        </div>
        {imagePreview && (
            <button onClick={() => { setImageFile(null); setImagePreview(null) }}
            style={{ marginTop:6, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
            ✕ Rasmni olib tashlash
            </button>
        )}
        </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }} />
        </div>
        
        {/* Nomi */}
        <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, fontWeight:700, color:errors.name?'#dc2626':'#888', display:'block', marginBottom:5 }}>
        NOMI * {errors.name && `— ${errors.name}`}
        </label>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
        placeholder="Masalan: Pomidor"
        style={{ ...C.input, borderColor:errors.name?'#dc2626':'#e8e8e8', padding:'10px 12px', fontSize:14 }} />
        </div>
        
        {/* Weight + Price */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div>
        <label style={{ fontSize:11, fontWeight:700, color:'#888', display:'block', marginBottom:5 }}>OG'IRLIGI</label>
        <input value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})}
        placeholder="1 kg, 500 g..."
        style={{ ...C.input, padding:'10px 12px', fontSize:14 }} />
        </div>
        <div>
        <label style={{ fontSize:11, fontWeight:700, color:errors.price?'#dc2626':'#888', display:'block', marginBottom:5 }}>
        NARXI * {errors.price && `— ${errors.price}`}
        </label>
        <div style={{ position:'relative' }}>
        <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}
        placeholder="12000"
        style={{ ...C.input, borderColor:errors.price?'#dc2626':'#e8e8e8', padding:'10px 44px 10px 12px', fontSize:14 }} />
        <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:11, color:'#aaa' }}>so'm</span>
        </div>
        {form.price > 0 && <div style={{ fontSize:11, color:'#21a95a', marginTop:3, fontWeight:600 }}>{parseInt(form.price).toLocaleString('uz-UZ')} so'm</div>}
        </div>
        </div>
        
        {/* Kategoriya */}
        <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:11, fontWeight:700, color:'#888', display:'block', marginBottom:8 }}>KATEGORIYA</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {CAT_LIST.map(c => (
            <button key={c.slug} onClick={() => setForm({...form,category_slug:c.slug})}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', border:`1.5px solid ${form.category_slug===c.slug?'#21a95a':'#e8e8e8'}`, borderRadius:20, background:form.category_slug===c.slug?'#21a95a':'#fff', color:form.category_slug===c.slug?'#fff':'#555', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {c.emoji} {c.label}
            </button>
        ))}
        </div>
        </div>
        
        {/* Sotuvda toggle */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#f9f9f9', borderRadius:12, marginBottom:18 }}>
        <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#333' }}>Sotuvda mavjud</div>
        <div style={{ fontSize:11, color:'#aaa', marginTop:1 }}>{form.in_stock ? "Ko'rinadi" : "Yashirilgan"}</div>
        </div>
        <div onClick={() => setForm({...form, in_stock: form.in_stock?0:1})}
        style={{ width:44, height:24, borderRadius:12, background:form.in_stock?'#21a95a':'#ddd', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
        <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:form.in_stock?22:2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
        </div>
        
        {/* Buttons */}
        <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:'12px', background:'#f5f5f5', color:'#555', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
        Bekor
        </button>
        <button onClick={save} disabled={saving||uploading}
        style={{ flex:2, padding:'12px', background:saving||uploading?'#aaa':'#ffd700', color:'#111', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:saving?'default':'pointer', fontFamily:'inherit' }}>
        {uploading ? '📤 Rasm yuklanmoqda...' : saving ? 'Saqlanmoqda...' : item ? '✓ Saqlash' : '+ Qo\'shish'}
        </button>
        </div>
        </div>
        </div>
        </div>
    )
}

function Products({ products, onRefresh }) {
    const [showModal, setShowModal] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('all')
    const [showHidden, setShowHidden] = useState(true)
    
    const filtered = products.filter(p => {
        const nameOk = p.name.toLowerCase().includes(search.toLowerCase())
        const catOk = catFilter === 'all' || p.category_slug === catFilter || p.category === catFilter
        const stockOk = showHidden || p.in_stock !== 0
        return nameOk && catOk && stockOk
    })
    
    const openAdd = () => { setEditItem(null); setShowModal(true) }
    const openEdit = (p) => { setEditItem(p); setShowModal(true) }
    
    const del = async (p) => {
        if (!confirm(`"${p.name}" ni o'chirishni tasdiqlaysizmi?`)) return
        await axios.delete(`${API}/products/${p.id}`)
        onRefresh()
    }
    
    const toggleStock = async (p) => {
        const newStock = p.in_stock ? 0 : 1
        await axios.patch(`${API}/products/${p.id}/stock`, { in_stock: newStock })
        onRefresh()
    }
    
    const visible = products.filter(p => p.in_stock !== 0).length
    const hidden = products.filter(p => p.in_stock === 0).length
    
    return (
        <div>
        {/* Toolbar */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
        <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#ccc' }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Mahsulot qidirish..."
        style={{ ...C.input, paddingLeft:32 }} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {[{slug:'all',label:'Barchasi'}, ...CAT_LIST].map(c => (
            <button key={c.slug} onClick={()=>setCatFilter(c.slug)}
            style={{ padding:'6px 12px', borderRadius:20, border:`1px solid ${catFilter===c.slug?'#1a1a1a':'#e8e8e8'}`, background:catFilter===c.slug?'#1a1a1a':'#fff', color:catFilter===c.slug?'#fff':'#666', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            {c.emoji && c.slug!=='all' && <span style={{marginRight:3}}>{c.emoji}</span>}{c.label}
            </button>
        ))}
        </div>
        <button onClick={()=>setShowHidden(!showHidden)}
        style={{ padding:'7px 12px', borderRadius:20, border:'1px solid #e8e8e8', background:showHidden?'#f0fdf4':'#fff', color:showHidden?'#21a95a':'#666', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
        {showHidden ? '👁 Yashirilganlar ko\'rinadi' : '🙈 Yashirilganlar yashirin'}
        </button>
        <button onClick={openAdd}
        style={{ padding:'9px 18px', background:'#ffd700', border:'none', borderRadius:10, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
        + Yangi mahsulot
        </button>
        </div>
        
        {/* Stats */}
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        {[
            { label:'Jami', val:products.length, color:'#111' },
            { label:'Sotuvda', val:visible, color:'#21a95a' },
            { label:'Yashirilgan', val:hidden, color:'#dc2626' },
        ].map((s,i) => (
            <div key={i} style={{ flex:1, background:'#fff', borderRadius:10, padding:'10px 14px', border:'1px solid #f0f0f0' }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:11, color:'#aaa', fontWeight:600, marginTop:1 }}>{s.label}</div>
            </div>
        ))}
        </div>
        
        {/* Cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:12 }}>
        {filtered.map(p => (
            <div key={p.id} style={{ background:'#fff', borderRadius:14, border:`1.5px solid ${p.in_stock===0?'#fca5a5':'#f0f0f0'}`, overflow:'hidden', opacity:p.in_stock===0?0.75:1, transition:'box-shadow .15s' }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            
            {/* Image */}
            <div style={{ height:120, background:'#f7f7f7', position:'relative', overflow:'hidden' }}>
            {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ddd', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:36 }}>📦</span>
                <span style={{ fontSize:11, color:'#ccc' }}>Rasm yo'q</span>
                </div>
            }
            {p.in_stock === 0 && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ background:'#dc2626', color:'#fff', fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:8 }}>YASHIRILGAN</span>
                </div>
            )}
            </div>
            
            {/* Info */}
            <div style={{ padding:'10px 12px 12px' }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#111', marginBottom:2 }}>{p.name}</div>
            <div style={{ fontSize:11, color:'#aaa', marginBottom:6 }}>{p.weight}</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:14, fontWeight:800, color:'#21a95a' }}>{p.price?.toLocaleString('uz-UZ')} so'm</span>
            <span style={{ fontSize:10, background:'#f5f5f5', color:'#888', padding:'2px 7px', borderRadius:8, fontWeight:600 }}>
            {CAT_LIST.find(c=>c.slug===(p.category_slug||p.category))?.emoji}
            </span>
            </div>
            
            {/* Actions */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            <button onClick={()=>openEdit(p)}
            style={{ padding:'7px', background:'#f0fdf4', color:'#166534', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            ✏️ Tahrirlash
            </button>
            <button onClick={()=>toggleStock(p)}
            style={{ padding:'7px', background:p.in_stock?'#fff8e1':'#f0fdf4', color:p.in_stock?'#92400e':'#166534', border:`1px solid ${p.in_stock?'#fde68a':'#bbf7d0'}`, borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {p.in_stock ? '🙈 Yashir' : '👁 Ko\'rsat'}
            </button>
            <button onClick={()=>del(p)}
            style={{ gridColumn:'1/-1', padding:'7px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            🗑️ O'chirish
            </button>
            </div>
            </div>
            </div>
        ))}
        
        {/* Add card */}
        <div onClick={openAdd}
        style={{ background:'#fff', borderRadius:14, border:'2px dashed #e0e0e0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:220, cursor:'pointer', transition:'all .15s', gap:8 }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#21a95a';e.currentTarget.style.background='#f0fdf4'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e0e0e0';e.currentTarget.style.background='#fff'}}>
        <div style={{ fontSize:32, color:'#ccc' }}>+</div>
        <div style={{ fontSize:13, fontWeight:700, color:'#bbb' }}>Yangi mahsulot</div>
        </div>
        </div>
        
        {showModal && (
            <ProductModal item={editItem} onSave={()=>{setShowModal(false);onRefresh()}} onClose={()=>setShowModal(false)} />
        )}
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
            const [o, p] = await Promise.all([axios.get(`${API}/orders`), axios.get(`${API}/products?all=true`)])
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