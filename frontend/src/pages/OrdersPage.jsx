import { useState, useEffect } from 'react'
import { getOrders } from '../api'
import { getActiveAddress } from '../store/addressStore'
import AddressModal from '../components/AddressModal'

const STATUS = {
    new:        { label: 'Yangi',         color: '#92400e', bg: '#fef3c7', icon: '🔔' },
    confirmed:  { label: 'Tasdiqlandi',   color: '#1e40af', bg: '#dbeafe', icon: '✅' },
    delivering: { label: 'Yetkazilmoqda', color: '#065f46', bg: '#d1fae5', icon: '🚴' },
    done:       { label: 'Yetkazildi',    color: '#166534', bg: '#f0fdf4', icon: '🎉' },
    cancelled:  { label: 'Bekor',         color: '#991b1b', bg: '#fee2e2', icon: '❌' },
}

export default function OrdersPage({ onBack }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [addressOpen, setAddressOpen] = useState(false)
    const [activeAddress, setActiveAddress] = useState(() => getActiveAddress())
    
    const savedUser = (() => { try { return JSON.parse(localStorage.getItem('shovot_user') || 'null') } catch { return null } })()
    
    useEffect(() => {
        getOrders()
        .then(res => {
            const mine = res.data.filter(o =>
                o.customer_phone === savedUser?.phone ||
                o.telegram_username === savedUser?.username
            )
            setOrders(mine)
        })
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }, [])
    
    const addressLabel = activeAddress
    ? `${activeAddress.mahalla}${activeAddress.uy ? ', ' + activeAddress.uy : ''}`
    : 'Manzil tanlang'
    
    return (
        <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Nunito', sans-serif" }}>
        
        {/* Header — asosiy header bilan bir xil */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14, height: 58 }}>
        <div onClick={onBack} style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', whiteSpace: 'nowrap', cursor: 'pointer' }}>
        Shovot <span style={{ color: '#21a95a' }}>Express</span>
        </div>
        
        {/* Address button */}
        <button onClick={() => setAddressOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#f5f5f5', border: '1.5px solid #e8e8e8', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', maxWidth: 320, flexShrink: 0, transition: 'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#21a95a'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#21a95a"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addressLabel}</span>
        <span style={{ fontSize: 11, color: '#aaa' }}>›</span>
        </button>
        
        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input placeholder="Mahsulot qidiring..."
        style={{ width: '100%', padding: '8px 12px 8px 34px', background: '#f5f5f5', border: '1.5px solid transparent', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#1a1a1a', boxSizing: 'border-box', cursor: 'pointer' }}
        onFocus={() => onBack()}
        />
        </div>
        
        <div style={{ fontSize: 13, color: '#21a95a', fontWeight: 700, whiteSpace: 'nowrap' }}>⚡ 10–30 daqiqa</div>
        
        {/* Profile avatar */}
        {savedUser && (
            <button onClick={onBack}
            style={{ width: 34, height: 34, borderRadius: '50%', background: '#21a95a', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {savedUser.name[0].toUpperCase()}
            </button>
        )}
        </div>
        </div>
        
        {/* Breadcrumb */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px 0' }}>
        <button onClick={onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 12 }}>
        ← Katalogga qaytish
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>Mening buyurtmalarim</h1>
        </div>
        
        {/* Orders list */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 40px' }}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Yuklanmoqda...</div>
            </div>
        ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#999', marginBottom: 6 }}>Buyurtmalar yo'q</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>Hali hech narsa buyurtma qilmadingiz</div>
            <button onClick={onBack}
            style={{ padding: '12px 28px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            Xarid qilish →
            </button>
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => {
                const st = STATUS[o.status] || STATUS.new
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
                const isOpen = selected?.id === o.id
                
                return (
                    <div key={o.id}
                    onClick={() => setSelected(isOpen ? null : { ...o, items })}
                    style={{ background: '#f7f7f7', borderRadius: 20, padding: '18px 20px', cursor: 'pointer', border: `1.5px solid ${isOpen ? '#21a95a' : 'transparent'}`, transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#f0f0f0' }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = '#f7f7f7' }}>
                    
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>
                    {new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} da{' '}
                    {new Date(o.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 20 }}>
                    {st.label}
                    </span>
                    </div>
                    
                    {/* Price + address */}
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                    {o.total?.toLocaleString('uz-UZ')} so'm
                    {o.address && <span> · {o.address.split(',')[0]}</span>}
                    </div>
                    
                    {/* Emojis */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {items.slice(0, 6).map((item, i) => (
                        <span key={i} style={{ fontSize: 32, lineHeight: 1 }}>{item.emoji || '🛍️'}</span>
                    ))}
                    {items.length > 6 && (
                        <span style={{ fontSize: 13, color: '#aaa', alignSelf: 'center' }}>+{items.length - 6}</span>
                    )}
                    </div>
                    
                    {/* Expanded */}
                    {isOpen && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < items.length - 1 ? '1px solid #ebebeb' : 'none' }}>
                            <span style={{ fontSize: 13, color: '#333' }}>
                            {item.emoji} {item.name || 'Mahsulot'} × {item.qty}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {((item.price || 0) * item.qty).toLocaleString('uz-UZ')} so'm
                            </span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginTop: 8 }}>
                        <span>Yetkazib berish</span>
                        <span>{(o.delivery_fee || 5000).toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
                        <span>Jami</span>
                        <span style={{ color: '#21a95a' }}>{o.total?.toLocaleString('uz-UZ')} so'm</span>
                        </div>
                        {o.address && (
                            <div style={{ marginTop: 10, fontSize: 12, color: '#888', display: 'flex', gap: 6 }}>
                            <span>📍</span><span>{o.address}</span>
                            </div>
                        )}
                        
                        {/* Status progress */}
                        <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                        {['new', 'confirmed', 'delivering', 'done'].map((s) => {
                            const steps = ['new', 'confirmed', 'delivering', 'done']
                            const isDone = steps.indexOf(s) <= steps.indexOf(o.status) && o.status !== 'cancelled'
                            return (
                                <div key={s} style={{ flex: 1 }}>
                                <div style={{ height: 4, borderRadius: 2, background: isDone ? '#21a95a' : '#e0e0e0', marginBottom: 4 }} />
                                <div style={{ fontSize: 10, color: isDone ? '#21a95a' : '#ccc', fontWeight: isDone ? 700 : 400, textAlign: 'center' }}>
                                {STATUS[s].label}
                                </div>
                                </div>
                            )
                        })}
                        </div>
                        </div>
                        </div>
                    )}
                    </div>
                )
            })}
            </div>
        )}
        </div>
        
        <AddressModal
        isOpen={addressOpen}
        onClose={() => setAddressOpen(false)}
        onSelect={(addr) => setActiveAddress(addr)}
        />
        </div>
    )
}