import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'
import { createOrder } from '../api'
import { useTelegram } from '../hooks/useTelegram'

const DELIVERY_FEE = 5000

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

const getSavedUser = () => {
  try { return JSON.parse(localStorage.getItem('shovot_user') || 'null') } catch { return null }
}

export default function CartModal({ products, isOpen, onClose }) {
  const { items, add, remove, clear, getCartItems, getTotal } = useCartStore()
  const { user, queryId } = useTelegram()
  const cartItems = getCartItems(products)
  const subtotal = getTotal(products)
  const total = subtotal + DELIVERY_FEE
  
  const [step, setStep] = useState('cart')
  const [address, setAddress] = useState({ mahalla: '', uy: '', izoh: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      const u = getSavedUser()
      if (u?.address) {
        setAddress({ mahalla: u.address.mahalla || '', uy: u.address.uy || '', izoh: '' })
      }
      setStep('cart')
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const savedUser = getSavedUser()
  
  const resetAndClose = () => { setStep('cart'); setErrors({}); onClose() }
  
  const validateAddress = () => {
    const e = {}
    if (!address.mahalla) e.mahalla = 'Mahallani tanlang'
    if (!address.uy.trim()) e.uy = "Uy raqamini kiriting"
    setErrors(e)
    return Object.keys(e).length === 0
  }
  
  const handleOrder = async () => {
    setLoading(true)
    try {
      const fullAddress = `${address.mahalla}, uy: ${address.uy}${address.izoh ? ', ' + address.izoh : ''}`
      if (savedUser) {
        savedUser.address = { mahalla: address.mahalla, uy: address.uy }
        localStorage.setItem('shovot_user', JSON.stringify(savedUser))
      }
      await createOrder({
        items: cartItems.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
        total, deliveryFee: DELIVERY_FEE, address: fullAddress,
        customerName: savedUser?.name, customerPhone: savedUser?.phone,
        telegramUser: user, queryId,
      })
      clear()
      setStep('success')
    } catch { alert('Xato yuz berdi.') }
    finally { setLoading(false) }
  }
  
  const s = { fontFamily: "'Nunito', sans-serif" }
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', ...s }}
    onClick={e => e.target === e.currentTarget && resetAndClose()}>
    <div style={{ background: '#fff', width: '100%', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
    <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '10px auto 0' }} />
    
    {/* STEP 1: Cart */}
    {step === 'cart' && (
      <>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5' }}>
      <div>
      <div style={{ fontSize: 17, fontWeight: 800 }}>Savat</div>
      {savedUser && <div style={{ fontSize: 12, color: '#21a95a', marginTop: 1, fontWeight: 600 }}>👋 {savedUser.name}</div>}
      </div>
      <button onClick={resetAndClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      
      <div style={{ padding: '6px 16px' }}>
      {cartItems.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < cartItems.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
        <div style={{ fontSize: 30, width: 40, textAlign: 'center' }}>{item.emoji}</div>
        <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
        <div style={{ fontSize: 12, color: '#aaa' }}>{item.price.toLocaleString('uz-UZ')} so'm</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => remove(item.id)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e8e8e8', background: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ fontSize: 14, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
        <button onClick={() => add(item)} style={{ width: 28, height: 28, borderRadius: 8, background: '#21a95a', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, minWidth: 72, textAlign: 'right' }}>{(item.price * item.qty).toLocaleString('uz-UZ')}</div>
        </div>
      ))}
      </div>
      
      <div style={{ margin: '8px 16px', background: '#f9f9f9', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 6 }}><span>Mahsulotlar</span><span>{subtotal.toLocaleString('uz-UZ')} so'm</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 10 }}><span>Yetkazib berish</span><span>{DELIVERY_FEE.toLocaleString('uz-UZ')} so'm</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, paddingTop: 10, borderTop: '1px solid #e8e8e8' }}><span>Jami</span><span style={{ color: '#21a95a' }}>{total.toLocaleString('uz-UZ')} so'm</span></div>
      </div>
      
      <div style={{ padding: '8px 16px 28px' }}>
      <button onClick={() => setStep('address')} style={{ width: '100%', padding: '15px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
      Davom etish → Manzil
      </button>
      </div>
      </>
    )}
    
    {/* STEP 2: Address */}
    {step === 'address' && (
      <>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f5f5f5' }}>
      <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555', padding: 0 }}>←</button>
      <div style={{ fontSize: 17, fontWeight: 800 }}>Yetkazib berish manzili</div>
      </div>
      
      <div style={{ margin: '14px 16px 0', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10 }}>
      <span>📍</span>
      <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Faqat Shovot tumani</div>
      <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>Yetkazib berish faqat Shovot tumani ichida</div>
      </div>
      </div>
      
      {savedUser?.address?.mahalla && (
        <div style={{ margin: '8px 16px 0', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#92400e', fontWeight: 600 }}>
        💾 Saqlangan: {savedUser.address.mahalla}, {savedUser.address.uy}
        </div>
      )}
      
      <div style={{ padding: '14px 16px' }}>
      <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>Mahalla *</label>
      <select value={address.mahalla} onChange={e => { setAddress({ ...address, mahalla: e.target.value }); setErrors({ ...errors, mahalla: '' }) }}
      style={{ width: '100%', padding: '11px 12px', border: `1.5px solid ${errors.mahalla ? '#dc2626' : '#e8e8e8'}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
      <option value="">Mahallani tanlang...</option>
      {MAHALLALAR.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      {errors.mahalla && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errors.mahalla}</div>}
      </div>
      
      <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>Uy / Xonadon *</label>
      <input value={address.uy} onChange={e => { setAddress({ ...address, uy: e.target.value }); setErrors({ ...errors, uy: '' }) }}
      placeholder="12-uy, 3-xonadon"
      style={{ width: '100%', padding: '11px 12px', border: `1.5px solid ${errors.uy ? '#dc2626' : '#e8e8e8'}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
      {errors.uy && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errors.uy}</div>}
      </div>
      
      <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>Izoh <span style={{ color: '#aaa', fontWeight: 500 }}>(ixtiyoriy)</span></label>
      <textarea value={address.izoh} onChange={e => setAddress({ ...address, izoh: e.target.value })}
      placeholder="2-qavat, yashil darvoza..." rows={2}
      style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box', resize: 'none' }} />
      </div>
      
      <button onClick={() => validateAddress() && setStep('confirm')}
      style={{ width: '100%', padding: '15px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
      Davom etish → Tasdiqlash
      </button>
      </div>
      </>
    )}
    
    {/* STEP 3: Confirm */}
    {step === 'confirm' && (
      <>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f5f5f5' }}>
      <button onClick={() => setStep('address')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555', padding: 0 }}>←</button>
      <div style={{ fontSize: 17, fontWeight: 800 }}>Tasdiqlash</div>
      </div>
      <div style={{ padding: '14px 16px' }}>
      {savedUser && (
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6 }}>👤 Mijoz</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{savedUser.name}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>📞 {savedUser.phone}</div>
        </div>
      )}
      <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6 }}>📍 Manzil</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{address.mahalla}</div>
      <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Uy: {address.uy}</div>
      {address.izoh && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{address.izoh}</div>}
      </div>
      <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>🛒 Mahsulotlar</div>
      {cartItems.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
        <span>{item.emoji} {item.name} × {item.qty}</span>
        <span style={{ fontWeight: 700 }}>{(item.price * item.qty).toLocaleString('uz-UZ')}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', padding: '6px 0 2px' }}><span>Yetkazib berish</span><span>{DELIVERY_FEE.toLocaleString('uz-UZ')} so'm</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, paddingTop: 8, borderTop: '1px solid #e8e8e8', marginTop: 4 }}><span>Jami</span><span style={{ color: '#21a95a' }}>{total.toLocaleString('uz-UZ')} so'm</span></div>
      </div>
      <div style={{ background: '#fff8e1', border: '1px solid #ffd54f', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ fontSize: 20 }}>💵</span>
      <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f57f17' }}>To'lov naqd pul — kuryerga</div>
      <div style={{ fontSize: 12, color: '#f9a825' }}>⚡ 10–30 daqiqada yetkaziladi</div>
      </div>
      </div>
      <button onClick={handleOrder} disabled={loading}
      style={{ width: '100%', padding: '15px', background: loading ? '#aaa' : '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer' }}>
      {loading ? 'Yuborilmoqda...' : `✅ Buyurtma berish — ${total.toLocaleString('uz-UZ')} so'm`}
      </button>
      </div>
      </>
    )}
    
    {/* STEP 4: Success */}
    {step === 'success' && (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Buyurtma qabul qilindi!</div>
      <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
      {savedUser?.name}, tez orada siz bilan bog'lanamiz
      </div>
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 16px', margin: '0 0 12px', fontSize: 13, color: '#166534', fontWeight: 600 }}>📍 {address.mahalla}, {address.uy}</div>
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 16px', margin: '0 0 24px', fontSize: 13, color: '#166534', fontWeight: 600 }}>📞 {savedUser?.phone}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#21a95a', marginBottom: 24 }}>Jami: {total.toLocaleString('uz-UZ')} so'm</div>
      <button onClick={() => { setStep('cart'); onClose() }}
      style={{ padding: '13px 32px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
      Bosh sahifaga qaytish
      </button>
      </div>
    )}
    </div>
    </div>
  )
}