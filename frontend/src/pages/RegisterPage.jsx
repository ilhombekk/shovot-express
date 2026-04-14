import { useState } from 'react'

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

export default function RegisterPage({ onDone }) {
    const [form, setForm] = useState({ name: '', phone: '', mahalla: '', uy: '' })
    const [errors, setErrors] = useState({})
    const [step, setStep] = useState(1)
    
    const validate1 = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Ismingizni kiriting'
        if (!form.phone.trim()) e.phone = 'Telefon raqamini kiriting'
        else if (!/^[\+]?[0-9]{9,13}$/.test(form.phone.replace(/\s/g, ''))) e.phone = "To'g'ri raqam kiriting"
        setErrors(e)
        return Object.keys(e).length === 0
    }
    
    const validate2 = () => {
        const e = {}
        if (!form.mahalla) e.mahalla = 'Mahallani tanlang'
        if (!form.uy.trim()) e.uy = "Uy raqamini kiriting"
        setErrors(e)
        return Object.keys(e).length === 0
    }
    
    const handleDone = () => {
        if (!validate2()) return
        const userData = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: { mahalla: form.mahalla, uy: form.uy },
            registeredAt: new Date().toISOString(),
        }
        localStorage.setItem('shovot_user', JSON.stringify(userData))
        onDone(userData)
    }
    
    const inp = (field, error) => ({
        value: form[field],
        onChange: e => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }) },
        style: {
            width: '100%', padding: '13px 14px',
            border: `1.5px solid ${error ? '#dc2626' : '#e8e8e8'}`,
            borderRadius: 12, fontSize: 15,
            fontFamily: "'Nunito', sans-serif",
            outline: 'none', color: '#1a1a1a',
            background: '#fff', boxSizing: 'border-box',
            transition: 'border-color 0.2s',
        },
        onFocus: e => { if (!error) e.target.style.borderColor = '#21a95a' },
        onBlur: e => { if (!error) e.target.style.borderColor = '#e8e8e8' },
    })
    
    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🛒</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>
        Shovot <span style={{ color: '#21a95a' }}>Express</span>
        </div>
        <div style={{ fontSize: 13, color: '#aaa', marginTop: 4, fontWeight: 600 }}>
        Tez yetkazib berish xizmati
        </div>
        </div>
        
        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s ? '#21a95a' : '#f0f0f0',
                color: step >= s ? '#fff' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, transition: 'all 0.2s',
            }}>{step > s ? '✓' : s}</div>
            {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? '#21a95a' : '#f0f0f0', transition: 'background 0.3s' }} />}
            </div>
        ))}
        </div>
        
        {/* Step 1: Ism + Telefon */}
        {step === 1 && (
            <>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>
            Ismingiz va telefon
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20, fontWeight: 600 }}>
            Buyurtmani qabul qilish uchun kerak
            </div>
            
            <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 }}>Ism *</label>
            <input placeholder="Ismingiz" {...inp('name', errors.name)} />
            {errors.name && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>{errors.name}</div>}
            </div>
            
            <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 }}>Telefon *</label>
            <input placeholder="+998 90 123 45 67" {...inp('phone', errors.phone)} />
            {errors.phone && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>{errors.phone}</div>}
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Kuryer siz bilan shu raqam orqali bog'lanadi</div>
            </div>
            
            <button onClick={() => validate1() && setStep(2)} style={{ width: '100%', padding: '14px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
            Davom etish →
            </button>
            </>
        )}
        
        {/* Step 2: Manzil */}
        {step === 2 && (
            <>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>
            Yetkazib berish manzili
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20, fontWeight: 600 }}>
            📍 Faqat Shovot tumani
            </div>
            
            <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 }}>Mahalla *</label>
            <select
            value={form.mahalla}
            onChange={e => { setForm({ ...form, mahalla: e.target.value }); setErrors({ ...errors, mahalla: '' }) }}
            style={{ width: '100%', padding: '13px 14px', border: `1.5px solid ${errors.mahalla ? '#dc2626' : '#e8e8e8'}`, borderRadius: 12, fontSize: 15, fontFamily: 'inherit', outline: 'none', color: form.mahalla ? '#1a1a1a' : '#aaa', background: '#fff', boxSizing: 'border-box' }}
            >
            <option value="">Mahallani tanlang...</option>
            {MAHALLALAR.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.mahalla && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>{errors.mahalla}</div>}
            </div>
            
            <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 }}>Uy / Xonadon *</label>
            <input placeholder="Masalan: 12-uy, 3-xonadon" {...inp('uy', errors.uy)} />
            {errors.uy && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>{errors.uy}</div>}
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
            ← Orqaga
            </button>
            <button onClick={handleDone} style={{ flex: 2, padding: '14px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
            Boshlash ✓
            </button>
            </div>
            </>
        )}
        
        <div style={{ textAlign: 'center', fontSize: 11, color: '#ccc', marginTop: 16 }}>
        Ma'lumotlaringiz faqat yetkazib berish uchun ishlatiladi
        </div>
        </div>
        </div>
    )
}