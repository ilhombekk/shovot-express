import { useCartStore } from '../store/cartStore'

export default function CartBar({ products, onOpen }) {
  const { items, getCount, getTotal } = useCartStore()
  const count = getCount()
  const total = getTotal(products)
  
  if (count === 0) return (
    <div style={{ padding: '10px 14px 16px', background: '#f5f5f5' }}>
    <button disabled style={{
      width: '100%',
      padding: '14px',
      background: '#e8e8e8',
      color: '#bbb',
      border: 'none',
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'inherit',
    }}>
    Savat bo'sh
    </button>
    </div>
  )
  
  return (
    <div style={{
      padding: '10px 14px 16px',
      background: '#fff',
      borderTop: '1px solid #f0f0f0',
      position: 'sticky',
      bottom: 0,
    }}>
    <button
    onClick={onOpen}
    style={{
      width: '100%',
      padding: '14px 18px',
      background: '#21a95a',
      color: '#fff',
      border: 'none',
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 800,
      fontFamily: 'inherit',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.15s',
    }}
    onTouchStart={e => e.currentTarget.style.background = '#1a8a48'}
    onTouchEnd={e => e.currentTarget.style.background = '#21a95a'}
    >
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 10px', borderRadius: 20, fontSize: 13 }}>
    {count} ta
    </span>
    Buyurtma berish
    </span>
    <span style={{ fontWeight: 700, fontSize: 14 }}>
    {total.toLocaleString('uz-UZ')} so'm
    </span>
    </button>
    </div>
  )
}