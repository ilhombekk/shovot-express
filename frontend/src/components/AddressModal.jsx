import { useState } from 'react'
import {
    getAddresses, getActiveAddress, setActiveAddress,
    addAddress, updateAddress, deleteAddress
} from '../store/addressStore'

const MAHALLALAR = [
    'Shovot shahri (markaz)',
    "Bog'ot ko'chasi",
    "Mustaqillik ko'chasi",
    'Yoshlik mahallasi',
    'Tinchlik mahallasi',
    "Navro'z mahallasi",
    "Do'stlik mahallasi",
    'Mehnat mahallasi',
    'Yangi hayot mahallasi',
    'Boshqa (Shovot tumani)',
]

const LABELS = [
    { id: 'home', label: 'Uy', icon: '🏠' },
    { id: 'work', label: 'Ish', icon: '💼' },
    { id: 'other', label: 'Boshqa', icon: '📍' },
]

function AddressForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        label: initial?.label || 'home',
        mahalla: initial?.mahalla || '',
        uy: initial?.uy || '',
        izoh: initial?.izoh || '',
    })
    const [errors, setErrors] = useState({})
    
    const validate = () => {
        const e = {}
        if (!form.mahalla) e.mahalla = 'Mahallani tanlang'
        if (!form.uy.trim()) e.uy = "Uy raqamini kiriting"
        setErrors(e)
        return Object.keys(e).length === 0
    }
    
    return (
        <div style={{ padding: '16px' }}>
        {/* Label tanlash */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {LABELS.map(l => (
            <button key={l.id} onClick={() => setForm({ ...form, label: l.id })}
            style={{ flex: 1, padding: '8px', border: `1.5px solid ${form.label === l.id ? '#21a95a' : '#e8e8e8'}`, borderRadius: 10, background: form.label === l.id ? '#f0fdf4' : '#fff', color: form.label === l.id ? '#21a95a' : '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>{l.icon}</span> {l.label}
            </button>
        ))}
        </div>
        
        <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 5 }}>Mahalla *</label>
        <select value={form.mahalla} onChange={e => { setForm({ ...form, mahalla: e.target.value }); setErrors({ ...errors, mahalla: '' }) }}
        style={{ width: '100%', padding: '11px 12px', border: `1.5px solid ${errors.mahalla ? '#dc2626' : '#e8e8e8'}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
        <option value="">Tanlang...</option>
        {MAHALLALAR.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {errors.mahalla && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 3 }}>{errors.mahalla}</div>}
        </div>
        
        <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 5 }}>Uy / Xonadon *</label>
        <input value={form.uy} onChange={e => { setForm({ ...form, uy: e.target.value }); setErrors({ ...errors, uy: '' }) }}
        placeholder="12-uy, 3-xonadon"
        style={{ width: '100%', padding: '11px 12px', border: `1.5px solid ${errors.uy ? '#dc2626' : '#e8e8e8'}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        {errors.uy && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 3 }}>{errors.uy}</div>}
        </div>
        
        <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 5 }}>
        Izoh <span style={{ color: '#aaa', fontWeight: 400 }}>(ixtiyoriy)</span>
        </label>
        <textarea value={form.izoh} onChange={e => setForm({ ...form, izoh: e.target.value })}
        placeholder="2-qavat, yashil darvoza..."
        rows={2}
        style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box', resize: 'none' }} />
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel}
        style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Bekor
        </button>
        <button onClick={() => validate() && onSave(form)}
        style={{ flex: 2, padding: '12px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Saqlash
        </button>
        </div>
        </div>
    )
}

export default function AddressModal({ isOpen, onClose, onSelect }) {
    const [addresses, setAddresses] = useState(() => getAddresses())
    const [active, setActive] = useState(() => getActiveAddress())
    const [mode, setMode] = useState('list') // list | add | edit
    const [editItem, setEditItem] = useState(null)
    
    if (!isOpen) return null
    
    const reload = () => {
        setAddresses(getAddresses())
        setActive(getActiveAddress())
    }
    
    const handleAdd = (form) => {
        const newAddr = addAddress(form)
        reload()
        setMode('list')
        onSelect?.(newAddr)
    }
    
    const handleEdit = (form) => {
        updateAddress(editItem.id, form)
        reload()
        setMode('list')
    }
    
    const handleDelete = (id) => {
        if (!confirm("Manzilni o'chirishni tasdiqlaysizmi?")) return
        deleteAddress(id)
        reload()
    }
    
    const handleSelect = (addr) => {
        setActiveAddress(addr)
        setActive(addr)
        onSelect?.(addr)
        onClose()
    }
    
    const getLabelIcon = (label) => LABELS.find(l => l.id === label)?.icon || '📍'
    const getLabelText = (label) => LABELS.find(l => l.id === label)?.label || 'Boshqa'
    
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', fontFamily: "'Nunito', sans-serif" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background: '#fff', width: '100%', borderRadius: '20px 20px 0 0', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '10px auto 0' }} />
        
        {/* Header */}
        <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {mode !== 'list' && (
            <button onClick={() => setMode('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555', padding: 0 }}>←</button>
        )}
        <div style={{ fontSize: 17, fontWeight: 800 }}>
        {mode === 'list' ? 'Mening manzillarim' : mode === 'add' ? 'Yangi manzil' : 'Manzilni tahrirlash'}
        </div>
        </div>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        
        {/* List mode */}
        {mode === 'list' && (
            <>
            {/* Add new */}
            <button onClick={() => setMode('add')}
            style={{ width: '100%', padding: '14px 16px', border: 'none', borderBottom: '1px solid #f5f5f5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#21a95a', fontWeight: 700 }}>+</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#21a95a' }}>Yangi manzil qo'shish</span>
            </button>
            
            {/* Addresses */}
            {addresses.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: '#bbb' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Manzil qo'shilmagan</div>
                </div>
            ) : (
                addresses.map(addr => {
                    const isActive = active?.id === addr.id
                    return (
                        <div key={addr.id}
                        style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 12, background: isActive ? '#f0fdf4' : '#fff', cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => handleSelect(addr)}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: isActive ? '#21a95a' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {getLabelIcon(addr.label)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#21a95a' : '#1a1a1a' }}>
                        {getLabelText(addr.label)}
                        {isActive && <span style={{ fontSize: 11, background: '#21a95a', color: '#fff', padding: '1px 7px', borderRadius: 10, marginLeft: 8, fontWeight: 600 }}>Faol</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {addr.mahalla}, {addr.uy}{addr.izoh ? `, ${addr.izoh}` : ''}
                        </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={e => { e.stopPropagation(); setEditItem(addr); setMode('edit') }}
                        style={{ padding: '6px 10px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#666' }}>✏️</button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(addr.id) }}
                        style={{ padding: '6px 10px', background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>🗑️</button>
                        </div>
                        </div>
                    )
                })
            )}
            <div style={{ height: 20 }} />
            </>
        )}
        
        {/* Add mode */}
        {mode === 'add' && (
            <AddressForm onSave={handleAdd} onCancel={() => setMode('list')} />
        )}
        
        {/* Edit mode */}
        {mode === 'edit' && editItem && (
            <AddressForm initial={editItem} onSave={handleEdit} onCancel={() => setMode('list')} />
        )}
        </div>
        </div>
    )
}