import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPanel from './pages/AdminPanel'
import RegisterPage from './pages/RegisterPage'

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

// Leaflet xarita komponenti
function MapPicker({ onSelect }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)
  
  useEffect(() => {
    if (mapInstanceRef.current) return
    
    // Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    
    // Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = window.L
      
      const map = L.map(mapRef.current, {
        center: [SHOVOT_LAT, SHOVOT_LNG],
        zoom: 13,
        zoomControl: true,
      })
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)
      
      // Shovot tumani doirasi
      circleRef.current = L.circle([SHOVOT_LAT, SHOVOT_LNG], {
        radius: MAX_RADIUS_KM * 1000,
        color: '#21a95a',
        fillColor: '#21a95a',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map)
      
      // Markazni belgilash
      L.circleMarker([SHOVOT_LAT, SHOVOT_LNG], {
        radius: 6, color: '#21a95a', fillColor: '#21a95a', fillOpacity: 1, weight: 2
      }).addTo(map).bindPopup('Shovot tumani markazi')
      
      // Custom marker icon
      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:#21a95a;transform:rotate(-45deg);
          border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: ''
      })
      
      // Xaritaga bosish
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        
        if (markerRef.current) map.removeLayer(markerRef.current)
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
        
        const dist = getDistanceKm(lat, lng, SHOVOT_LAT, SHOVOT_LNG)
        const inZone = dist <= MAX_RADIUS_KM
        
        markerRef.current.bindPopup(
          inZone
          ? `<b>✅ Yetkazib berish mumkin</b><br>Shovot markazidan ${dist.toFixed(1)} km`
          : `<b>❌ Zona tashqarisi</b><br>Shovot markazidan ${dist.toFixed(1)} km`
        ).openPopup()
        
        onSelect({ lat, lng, inZone, dist: dist.toFixed(1) })
      })
      
      mapInstanceRef.current = map
    }
    document.head.appendChild(script)
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }} />
  )
}

function LocationScreen({ onResult }) {
  const [selected, setSelected] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState('')
  
  const autoDetect = () => {
    if (!navigator.geolocation) { setError("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi"); return }
    setDetecting(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false)
        const dist = getDistanceKm(pos.coords.latitude, pos.coords.longitude, SHOVOT_LAT, SHOVOT_LNG)
        setSelected({ lat: pos.coords.latitude, lng: pos.coords.longitude, inZone: dist <= MAX_RADIUS_KM, dist: dist.toFixed(1) })
      },
      () => { setDetecting(false); setError("Avtomatik aniqlanmadi. Xaritadan tanlang.") },
      { timeout: 8000 }
    )
  }
  
  const confirm = () => {
    if (!selected) { setError('Xaritadan joylashuvni tanlang'); return }
    if (!selected.inZone) { setError(`Kechirasiz, bu joy yetkazib berish zonasidan tashqarida (${selected.dist} km)`); return }
    localStorage.setItem('shovot_geo', JSON.stringify({ ok: true, dist: selected.dist, ts: Date.now() }))
    onResult(true)
  }
  
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Nunito', sans-serif", display: 'flex', flexDirection: 'column' }}>
    
    {/* Header */}
    <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ fontSize: 18, fontWeight: 800 }}>
    Shovot <span style={{ color: '#21a95a' }}>Express</span>
    </div>
    <div style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>— Joylashuvni tasdiqlang</div>
    </div>
    
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 600, margin: '0 auto', width: '100%', padding: '16px 16px 0' }}>
    
    {/* Info */}
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
    <span style={{ fontSize: 18 }}>📍</span>
    <div>
    <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Xaritadan joylashuvingizni tanlang</div>
    <div style={{ fontSize: 12, color: '#16a34a', marginTop: 1 }}>Yashil doira — yetkazib berish zonasi ({MAX_RADIUS_KM} km)</div>
    </div>
    </div>
    
    {/* Auto detect */}
    <button onClick={autoDetect} disabled={detecting}
    style={{ width: '100%', padding: '10px', background: detecting ? '#f0f0f0' : '#fff', border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: detecting ? 'default' : 'pointer', marginBottom: 10, color: '#555' }}>
    {detecting ? '⏳ Aniqlanmoqda...' : '📡 Joylashuvni avtomatik aniqlash'}
    </button>
    
    {/* Map */}
    <div style={{ flex: 1, minHeight: 380, borderRadius: 16, overflow: 'hidden', border: '2px solid #e0e0e0', marginBottom: 12, position: 'relative' }}>
    <MapPicker onSelect={setSelected} />
    
    {/* Hint overlay */}
    {!selected && (
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '10px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, pointerEvents: 'none', zIndex: 1000, whiteSpace: 'nowrap' }}>
      👆 Xaritaga bosing
      </div>
    )}
    </div>
    
    {/* Selected info */}
    {selected && (
      <div style={{ background: selected.inZone ? '#f0fdf4' : '#fee2e2', border: `1px solid ${selected.inZone ? '#bbf7d0' : '#fca5a5'}`, borderRadius: 12, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 20 }}>{selected.inZone ? '✅' : '❌'}</span>
      <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: selected.inZone ? '#166534' : '#991b1b' }}>
      {selected.inZone ? 'Yetkazib berish mumkin!' : 'Zona tashqarida'}
      </div>
      <div style={{ fontSize: 12, color: selected.inZone ? '#16a34a' : '#dc2626', marginTop: 1 }}>
      Shovot markazidan {selected.dist} km
      </div>
      </div>
      </div>
    )}
    
    {error && (
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '8px 14px', marginBottom: 10, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
      {error}
      </div>
    )}
    
    {/* Confirm button */}
    <button onClick={confirm}
    style={{ width: '100%', padding: '14px', background: selected?.inZone ? '#21a95a' : '#e0e0e0', color: selected?.inZone ? '#fff' : '#aaa', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: selected?.inZone ? 'pointer' : 'default', marginBottom: 20, transition: 'background 0.2s' }}>
    {selected?.inZone ? 'Tasdiqlash va davom etish →' : 'Joylashuvni tanlang'}
    </button>
    </div>
    </div>
  )
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