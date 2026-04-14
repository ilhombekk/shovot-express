import { useCartStore } from '../store/cartStore'
import { createOrder } from '../api'
import { useTelegram } from '../hooks/useTelegram'

const DELIVERY_FEE = 5000

export default function CartModal({ products, isOpen, onClose }) {
  const { items, add, remove, clear, getCartItems, getTotal } = useCartStore()
  const { user, queryId } = useTelegram()
  const cartItems = getCartItems(products)
  const subtotal = getTotal(products)
  const total = subtotal + DELIVERY_FEE
  
  if (!isOpen) return null
  
  const handleOrder = async () => {
    try {
      await createOrder({
        items: cartItems.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
        total,
        deliveryFee: DELIVERY_FEE,
        telegramUser: user,
        queryId,
      })
      clear()
      onClose()
      alert('✅ Buyurtmangiz qabul qilindi! Tez orada bog\'lanamiz.')
    } catch {
      alert('Xato yuz berdi. Qayta urinib ko\'ring.')
    }
  }
  
  return (
    <div
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'flex-end',
    }}
    onClick={e => e.target === e.currentTarget && onClose()}
    >
    <div style={{
      background: '#fff',
      width: '100%',
      borderRadius: '20px 20px 0 0',
      maxHeight: '85vh',
      overflowY: 'auto',
      fontFamily: 'inherit',
    }}>
    {/* Handle */}
    <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '10px auto 0' }} />
    
    {/* Header */}
    <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5' }}>
    <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>Savatingiz</div>
    <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: 20, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
    </div>
    
    {/* Items */}
    <div style={{ padding: '8px 16px' }}>
    {cartItems.map((item, i) => (
      <div key={item.id} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: i < cartItems.length - 1 ? '1px solid #f5f5f5' : 'none',
      }}>
      <div style={{ fontSize: 32, width: 44, textAlign: 'center' }}>{item.emoji}</div>
      <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{item.name}</div>
      <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>{item.price.toLocaleString('uz-UZ')} so'm</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
      onClick={() => remove(item.id)}
      style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e8e8e8', background: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#333' }}
      >−</button>
      <span style={{ fontSize: 15, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
      <button
      onClick={() => add(item)}
      style={{ width: 28, height: 28, borderRadius: 8, background: '#21a95a', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}
      >+</button>
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', minWidth: 70, textAlign: 'right' }}>
      {(item.price * item.qty).toLocaleString('uz-UZ')}
      </div>
      </div>
    ))}
    </div>
    
    {/* Summary */}
    <div style={{ margin: '8px 16px', background: '#f9f9f9', borderRadius: 14, padding: '12px 14px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>
    <span>Mahsulotlar</span>
    <span>{subtotal.toLocaleString('uz-UZ')} so'm</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 10 }}>
    <span>Yetkazib berish</span>
    <span>{DELIVERY_FEE.toLocaleString('uz-UZ')} so'm</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1a1a1a', paddingTop: 10, borderTop: '1px solid #e8e8e8' }}>
    <span>Jami</span>
    <span style={{ color: '#21a95a' }}>{total.toLocaleString('uz-UZ')} so'm</span>
    </div>
    </div>
    
    {/* Order button */}
    <div style={{ padding: '8px 16px 24px' }}>
    <button
    onClick={handleOrder}
    style={{
      width: '100%',
      padding: '15px',
      background: '#21a95a',
      color: '#fff',
      border: 'none',
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 800,
      fontFamily: 'inherit',
      cursor: 'pointer',
    }}
    >
    Buyurtma berish — {total.toLocaleString('uz-UZ')} so'm
    </button>
    </div>
    </div>
    </div>
  )
}