import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'
import { createOrder } from '../api'
import { useTelegram } from '../hooks/useTelegram'
import { getActiveAddress, getAddresses } from '../store/addressStore'
import AddressModal from './AddressModal'

const DELIVERY_FEE = 5000

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
  const [activeAddress, setActiveAddress] = useState(null)
  const [addressOpen, setAddressOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      setStep('cart')
      setActiveAddress(getActiveAddress())
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const savedUser = getSavedUser()
  const hasAddress = activeAddress && activeAddress.mahalla && activeAddress.uy
  
  const handleOrder = async () => {
    if (!hasAddress) { setAddressOpen(true); return }
    setLoading(true)
    try {
      const fullAddress = `${activeAddress.mahalla}, uy: ${activeAddress.uy}${activeAddress.izoh ? ', ' + activeAddress.izoh : ''}`
      await createOrder({
        items: cartItems.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
        total, deliveryFee: DELIVERY_FEE,
        address: fullAddress,
        customerName: savedUser?.name,
        customerPhone: savedUser?.phone,
        telegramUser: user, queryId,
      })
      clear()
      setStep('success')
    } catch { alert('Xato yuz berdi.') }
    finally { setLoading(false) }
  }
  
  return (
    <>
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', fontFamily: "'Nunito', sans-serif" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
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
      <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      
      {/* Address bar */}
      <button onClick={() => setAddressOpen(true)}
      style={{ width: '100%', padding: '10px 16px', border: 'none', borderBottom: '1px solid #f5f5f5', background: hasAddress ? '#f0fdf4' : '#fff8e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit', textAlign: 'left' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={hasAddress ? '#21a95a' : '#f59e0b'}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      <div style={{ flex: 1, minWidth: 0 }}>
      {hasAddress ? (
        <>
        <div style={{ fontSize: 12, color: '#21a95a', fontWeight: 600 }}>Yetkazib berish manzili</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {activeAddress.mahalla}, {activeAddress.uy}
        </div>
        </>
      ) : (
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>Manzil tanlang →</div>
      )}
      </div>
      <span style={{ fontSize: 13, color: '#aaa' }}>›</span>
      </button>
      
      {/* Items */}
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
      
      {/* Summary */}
      <div style={{ margin: '8px 16px', background: '#f9f9f9', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 6 }}><span>Mahsulotlar</span><span>{subtotal.toLocaleString('uz-UZ')} so'm</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 10 }}><span>Yetkazib berish</span><span>{DELIVERY_FEE.toLocaleString('uz-UZ')} so'm</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, paddingTop: 10, borderTop: '1px solid #e8e8e8' }}><span>Jami</span><span style={{ color: '#21a95a' }}>{total.toLocaleString('uz-UZ')} so'm</span></div>
      </div>
      
      <div style={{ padding: '8px 16px 28px' }}>
      <button onClick={handleOrder} disabled={loading}
      style={{ width: '100%', padding: '15px', background: loading ? '#aaa' : '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer' }}>
      {loading ? 'Yuborilmoqda...' : hasAddress ? `✅ Buyurtma berish — ${total.toLocaleString('uz-UZ')} so'm` : '📍 Manzil tanlang'}
      </button>
      </div>
      </>
    )}
    
    {/* STEP: Success */}
    {step === 'success' && (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Buyurtma qabul qilindi!</div>
      <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
      {savedUser?.name}, tez orada siz bilan bog'lanamiz
      </div>
      {activeAddress && (
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 16px', margin: '0 0 12px', fontSize: 13, color: '#166534', fontWeight: 600 }}>
        📍 {activeAddress.mahalla}, {activeAddress.uy}
        </div>
      )}
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 16px', margin: '0 0 24px', fontSize: 13, color: '#166534', fontWeight: 600 }}>
      📞 {savedUser?.phone}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#21a95a', marginBottom: 24 }}>
      Jami: {total.toLocaleString('uz-UZ')} so'm
      </div>
      <button onClick={() => { setStep('cart'); onClose() }}
      style={{ padding: '13px 32px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
      Bosh sahifaga qaytish
      </button>
      </div>
    )}
    </div>
    </div>
    
    {/* Address modal */}
    <AddressModal
    isOpen={addressOpen}
    onClose={() => setAddressOpen(false)}
    onSelect={(addr) => { setActiveAddress(addr); setAddressOpen(false) }}
    />
    </>
  )
}