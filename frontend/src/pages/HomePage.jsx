import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import CartBar from '../components/CartBar'
import CartModal from '../components/CartModal'
import { getProducts, getCategories } from '../api'

const CATEGORIES = [
  { id: 'all', label: 'Hammasi', emoji: '🏪' },
  { id: 'sabzavot', label: 'Sabzavot', emoji: '🥬' },
  { id: 'meva', label: 'Meva', emoji: '🍎' },
  { id: 'sut', label: 'Sut', emoji: '🥛' },
  { id: 'non', label: 'Non', emoji: '🍞' },
  { id: 'gosht', label: "Go'sht", emoji: '🥩' },
  { id: 'ichimlik', label: 'Ichimlik', emoji: '🧃' },
]

// Fallback — backend tayyor bo'lgunga qadar
const MOCK_PRODUCTS = [
  { id:1,  name:'Pomidor',      weight:'1 kg',    price:12000, category:'sabzavot', emoji:'🍅' },
  { id:2,  name:'Bodring',      weight:'1 kg',    price:8000,  category:'sabzavot', emoji:'🥒' },
  { id:3,  name:'Kartoshka',    weight:'1 kg',    price:5000,  category:'sabzavot', emoji:'🥔' },
  { id:4,  name:'Karam',        weight:'1 dona',  price:7000,  category:'sabzavot', emoji:'🥬' },
  { id:5,  name:'Olma',         weight:'1 kg',    price:15000, category:'meva',     emoji:'🍎' },
  { id:6,  name:'Banan',        weight:'1 kg',    price:18000, category:'meva',     emoji:'🍌' },
  { id:7,  name:'Uzum',         weight:'500 g',   price:14000, category:'meva',     emoji:'🍇' },
  { id:8,  name:'Limon',        weight:'3 ta',    price:6000,  category:'meva',     emoji:'🍋' },
  { id:9,  name:'Sut',          weight:'1 litr',  price:9000,  category:'sut',      emoji:'🥛' },
  { id:10, name:'Tuxum',        weight:'10 ta',   price:22000, category:'sut',      emoji:'🥚' },
  { id:11, name:'Qatiq',        weight:'500 ml',  price:8000,  category:'sut',      emoji:'🫙' },
  { id:12, name:"Sariyog'",     weight:'200 g',   price:19000, category:'sut',      emoji:'🧈' },
  { id:13, name:'Non',          weight:'500 g',   price:6000,  category:'non',      emoji:'🍞' },
  { id:14, name:'Lavash',       weight:'3 ta',    price:7000,  category:'non',      emoji:'🫓' },
  { id:15, name:"Mol go'shti",  weight:'500 g',   price:45000, category:'gosht',    emoji:'🥩' },
  { id:16, name:'Tovuq',        weight:'1 kg',    price:35000, category:'gosht',    emoji:'🍗' },
  { id:17, name:'Limonad',      weight:'1.5 l',   price:12000, category:'ichimlik', emoji:'🧃' },
  { id:18, name:'Suv',          weight:'1.5 l',   price:5000,  category:'ichimlik', emoji:'💧' },
]

export default function HomePage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    // Backend tayyor bo'lganda bu ishlaydi
    getProducts().then(res => setProducts(res.data)).catch(() => {
      // Fallback: mock data ishlatiladi
    })
  }, [])

  const filtered = products.filter(p => {
    const catOk = activeCat === 'all' || p.category === activeCat
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase())
    return catOk && searchOk
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#f7faf9]">
      {/* Header */}
      <div className="bg-[#2db67d] px-4 pt-3.5 pb-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2.5">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Shovot <span className="opacity-75 font-semibold">Express</span>
          </h1>
          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            ⚡ 30 daqiqa
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="w-full bg-white/95 rounded-xl pl-8 pr-3 py-2 text-sm outline-none font-semibold placeholder:text-gray-400"
            placeholder="Mahsulot qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-100 py-2.5">
        <div className="flex gap-2 px-3.5 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors
                ${activeCat === cat.id
                  ? 'bg-[#2db67d] text-white border-[#2db67d]'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="mx-3.5 mt-3.5 bg-gradient-to-r from-[#1a6644] to-[#2db67d] rounded-2xl px-4 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-white font-extrabold text-base">Birinchi buyurtma</p>
          <p className="text-white/75 text-xs font-semibold">Yetkazib berish bepul!</p>
        </div>
        <span className="text-4xl">🎁</span>
      </div>

      {/* Products */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-extrabold text-gray-900">
            {CATEGORIES.find(c => c.id === activeCat)?.label || 'Barcha mahsulotlar'}
          </h2>
          <span className="text-xs text-gray-400 font-semibold">{filtered.length} ta</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm font-semibold">Mahsulot topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Cart bar */}
      <div className="mt-auto">
        <CartBar products={products} onOpen={() => setCartOpen(true)} />
      </div>

      {/* Cart modal */}
      <CartModal
        products={products}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  )
}
