import { useCartStore } from '../store/cartStore'

export default function ProductCard({ product }) {
  const { items, add, remove } = useCartStore()
  const qty = items[product.id] || 0
  const inCart = qty > 0
  
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      border: inCart ? '1.5px solid #21a95a' : '1.5px solid #f0f0f0',
      transition: 'border-color 0.2s, transform 0.1s',
      cursor: 'pointer',
      position: 'relative',
    }}
    onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
    {/* In cart indicator */}
    {inCart && (
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        background: '#21a95a',
        color: '#fff',
        fontSize: 10,
        fontWeight: 800,
        padding: '2px 8px',
        borderRadius: 10,
        zIndex: 2,
      }}>
      ✓ Savatda
      </div>
    )}
    
    {/* Image area */}
    <div style={{
      height: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      fontSize: 52,
    }}>
    {product.emoji}
    </div>
    
    {/* Info */}
    <div style={{ padding: '8px 10px 10px' }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 1, lineHeight: 1.3 }}>
    {product.name}
    </div>
    <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>
    {product.weight}
    </div>
    
    {/* Price + button */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
    <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>
    {(product.price / 1000).toFixed(0)}
    </span>
    <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}> 000 so'm</span>
    </div>
    
    {qty === 0 ? (
      <button
      onClick={() => add(product)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: '#21a95a',
        color: '#fff',
        border: 'none',
        fontSize: 22,
        fontWeight: 300,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        transition: 'background 0.15s',
      }}
      >
      +
      </button>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
      onClick={() => remove(product.id)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        border: '1.5px solid #e8e8e8',
        background: '#fff',
        color: '#333',
        fontSize: 18,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
      >−</button>
      <span style={{ fontSize: 14, fontWeight: 800, minWidth: 16, textAlign: 'center', color: '#1a1a1a' }}>
      {qty}
      </span>
      <button
      onClick={() => add(product)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: '#21a95a',
        color: '#fff',
        border: 'none',
        fontSize: 18,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
      >+</button>
      </div>
    )}
    </div>
    </div>
    </div>
  )
}