import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPanel from './pages/AdminPanel'
import RegisterPage from './pages/RegisterPage'

// Shovot tumani markazi va chegarasi
const SHOVOT_LAT = 41.5534
const SHOVOT_LNG = 60.5478
const MAX_RADIUS_KM = 20

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function LocationScreen({ onResult }) {
  const [step, setStep] = useState('intro') // intro | map | outside | confirmed
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [selected, setSelected] = useState(null) // { lat, lng, name }
  const [searchVal, setSearchVal] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  
  const base = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f5f5f5', fontFamily: "'Nunito', sans-serif", padding: 20,
  }
  
  // Auto detect
  const autoDetect = () => {
    if (!navigator.geolocation) { setError("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi"); return }
    setDetecting(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false)
        setSelected({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Avtomatik aniqlanган joylashuv' })
      },
      () => { setDetecting(false); setError("Joylashuv aniqlanmadi. Qo'lda kiriting.") },
      { timeout: 8000 }
    )
  }
  
  // Search via Nominatim
  const searchPlace = async (q) => {
    if (q.length < 3) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Xorazm Uzbekistan')}&format=json&limit=5&accept-language=uz`)
      const data = await res.json()
      setSearchResults(data.map(d => ({ lat: parseFloat(d.lat), lng: parseFloat(d.lon), name: d.display_name })))
    } catch { setSearchResults([]) }
    setSearching(false)
  }
  
  const checkAndConfirm = (loc) => {
    const dist = getDistanceKm(loc.lat, loc.lng, SHOVOT_LAT, SHOVOT_LNG)
    if (dist <= MAX_RADIUS_KM) {
      localStorage.setItem('shovot_geo', JSON.stringify({ ok: true, dist: dist.toFixed(1), ts: Date.now() }))
      onResult(true)
    } else {
      setSelected(loc)
      setStep('outside')
    }
  }
  
  // INTRO
  if (step === 'intro') return (
    <div style={base}>
    <div style={{ background: '#fff', borderRadius: 24, padding: '36px 28px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>
    Shovot <span style={{ color: '#21a95a' }}>Express</span>
    </div>
    <div style={{ fontSize: 56, margin: '20px 0' }}>📍</div>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
    Joylashuvingizni tasdiqlang
    </div>
    <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
    Biz faqat <strong>Shovot tumani</strong> va atrofida yetkazib beramiz. Iltimos, joylashuvingizni tanlang.
    </div>
    
    <button onClick={() => { autoDetect(); setStep('map') }}
    style={{ width: '100%', padding: '13px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 10 }}>
    📡 Avtomatik aniqlash
    </button>
    <button onClick={() => setStep('map')}
    style={{ width: '100%', padding: '13px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
    🗺️ O'zim tanlash
    </button>
    </div>
    </div>
  )
  
  // OUTSIDE
  if (step === 'outside') return (
    <div style={base}>
    <div style={{ background: '#fff', borderRadius: 24, padding: '36px 28px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
    <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
    Hizmat zonasidan tashqaridasiz
    </div>
    <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
    Shovot Express faqat <strong>Shovot tumani</strong> ichida yetkazib beradi (radius: {MAX_RADIUS_KM} km).
    </div>
    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
    Siz tanlagan joylashuv Shovot tumaniga {getDistanceKm(selected?.lat, selected?.lng, SHOVOT_LAT, SHOVOT_LNG).toFixed(0)} km uzoqda
    </div>
    <button onClick={() => { setStep('map'); setSelected(null); setError('') }}
    style={{ width: '100%', padding: '13px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
    Qayta tanlash
    </button>
    </div>
    </div>
  )
  
  // MAP / MANUAL SELECT
  if (step === 'map') return (
    <div style={base}>
    <div style={{ background: '#fff', borderRadius: 24, padding: '28px', maxWidth: 460, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <button onClick={() => setStep('intro')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555', padding: 0 }}>←</button>
    <div style={{ fontSize: 17, fontWeight: 800 }}>Joylashuvni tanlang</div>
    </div>
    
    {/* Auto detect button */}
    <button onClick={autoDetect} disabled={detecting}
    style={{ width: '100%', padding: '11px', background: detecting ? '#e8f5e9' : '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: detecting ? 'default' : 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
    {detecting ? '⏳ Aniqlanmoqda...' : '📡 Joylashuvni avtomatik aniqlash'}
    </button>
    
    {/* Divider */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
    <span style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>yoki qidiring</span>
    <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
    </div>
    
    {/* Search */}
    <div style={{ position: 'relative', marginBottom: 12 }}>
    <input
    value={searchVal}
    onChange={e => { setSearchVal(e.target.value); searchPlace(e.target.value) }}
    placeholder="Ko'cha, mahalla nomini kiriting..."
    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
    onFocus={e => e.target.style.borderColor = '#21a95a'}
    onBlur={e => e.target.style.borderColor = '#e8e8e8'}
    />
    {searching && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#aaa' }}>🔍</div>}
    </div>
    
    {/* Search results */}
    {searchResults.length > 0 && (
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      {searchResults.map((r, i) => (
        <button key={i} onClick={() => { setSelected(r); setSearchResults([]); setSearchVal(r.name.split(',')[0]) }}
        style={{ width: '100%', padding: '10px 14px', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid #f5f5f5' : 'none', background: selected?.lat === r.lat ? '#f0fdf4' : '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#333', lineHeight: 1.4 }}>
        📍 {r.name.split(',').slice(0, 3).join(', ')}
        </button>
      ))}
      </div>
    )}
    
    {/* Shovot quick select */}
    <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>Tez tanlash:</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {[
      { name: 'Shovot shahri', lat: 41.5534, lng: 60.5478 },
      { name: 'Shovot markazi', lat: 41.5520, lng: 60.5460 },
      { name: 'Shovot bozori', lat: 41.5550, lng: 60.5500 },
      { name: 'Yoshlik MFY', lat: 41.5490, lng: 60.5440 },
      { name: 'Tinchlik MFY', lat: 41.5570, lng: 60.5510 },
    ].map(loc => (
      <button key={loc.name} onClick={() => setSelected(loc)}
      style={{ padding: '6px 12px', border: `1.5px solid ${selected?.name === loc.name ? '#21a95a' : '#e8e8e8'}`, borderRadius: 20, background: selected?.name === loc.name ? '#f0fdf4' : '#fff', color: selected?.name === loc.name ? '#21a95a' : '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
      {loc.name}
      </button>
    ))}
    </div>
    </div>
    
    {/* Selected location preview */}
    {selected && (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 20 }}>✅</span>
      <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Tanlangan joylashuv</div>
      <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {typeof selected.name === 'string' ? selected.name.split(',').slice(0, 2).join(', ') : 'Joylashuv tanlandi'}
      </div>
      </div>
      </div>
    )}
    
    {error && (
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
      {error}
      </div>
    )}
    
    <button
    onClick={() => selected ? checkAndConfirm(selected) : setError("Iltimos, joylashuvni tanlang")}
    disabled={!selected}
    style={{ width: '100%', padding: '14px', background: selected ? '#21a95a' : '#e0e0e0', color: selected ? '#fff' : '#aaa', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: selected ? 'pointer' : 'default', transition: 'background 0.2s' }}>
    Tasdiqlash va davom etish →
    </button>
    </div>
    </div>
  )
  
  return null
}

export default function App() {
  const [geoOk, setGeoOk] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shovot_geo') || 'null')
      if (!saved) return null
      const age = Date.now() - saved.ts
      if (age < 24 * 60 * 60 * 1000 && saved.ok) return true
      return null
    } catch { return null }
  })
  
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shovot_user') || 'null') } catch { return null }
  })
  
  if (window.location.pathname === '/admin') {
    return <AdminPanel />
  }
  
  if (geoOk === null) {
    return <LocationScreen onResult={(ok) => setGeoOk(ok)} />
  }
  
  return (
    <Routes>
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/*" element={
      user ? <HomePage /> : <RegisterPage onDone={setUser} />
    } />
    </Routes>
  )
}