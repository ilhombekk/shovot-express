import { useState, useEffect, useRef } from 'react'
import {
    getAddresses, getActiveAddress, setActiveAddress,
    addAddress, updateAddress, deleteAddress
} from '../store/addressStore'

const SHOVOT_LAT = 41.658
const SHOVOT_LNG = 60.295
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

const LABELS = [
    { id: 'home',  label: 'Uy',     icon: '🏠' },
    { id: 'work',  label: 'Ish',    icon: '💼' },
    { id: 'other', label: 'Boshqa', icon: '📍' },
]

function loadLeaflet() {
    return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return }
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }
        if (!document.querySelector('script[src*="leaflet"]')) {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = () => resolve(window.L)
            document.head.appendChild(script)
        } else {
            const check = setInterval(() => {
                if (window.L) { clearInterval(check); resolve(window.L) }
            }, 100)
        }
    })
}

function MapPicker({ initialLat, initialLng, onConfirm, onCancel }) {
    const mapRef = useRef(null)
    const mapObjRef = useRef(null)
    const markerRef = useRef(null)
    const [pin, setPin] = useState(null)
    const [inZone, setInZone] = useState(null)
    const [dist, setDist] = useState(null)
    const [searchVal, setSearchVal] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [label, setLabel] = useState('home')
    const [detail, setDetail] = useState('')
    const [mapReady, setMapReady] = useState(false)
    
    useEffect(() => {
        let cancelled = false
        loadLeaflet().then((L) => {
            if (cancelled || !mapRef.current || mapObjRef.current) return
            
            const map = L.map(mapRef.current, {
                center: [initialLat || SHOVOT_LAT, initialLng || SHOVOT_LNG],
                zoom: 14,
            })
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map)
            
            // Zona doirasi
            L.circle([SHOVOT_LAT, SHOVOT_LNG], {
                radius: MAX_RADIUS_KM * 1000,
                color: '#21a95a', fillColor: '#21a95a',
                fillOpacity: 0.07, weight: 2, dashArray: '6 4'
            }).addTo(map)
            
            const placePin = (lat, lng) => {
                const d = getDistanceKm(lat, lng, SHOVOT_LAT, SHOVOT_LNG)
                const ok = d <= MAX_RADIUS_KM
                
                const icon = L.divIcon({
                    html: `<div style="width:32px;height:40px;position:relative;">
            <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${ok ? '#21a95a' : '#ef4444'};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);"></div>
            <div style="position:absolute;top:7px;left:7px;width:14px;height:14px;border-radius:50%;background:#fff;"></div>
          </div>`,
                    iconSize: [32, 40], iconAnchor: [16, 40], className: ''
                })
                
                if (markerRef.current) map.removeLayer(markerRef.current)
                    markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
                
                setPin({ lat, lng })
                setInZone(ok)
                setDist(d.toFixed(1))
                
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`)
                .then(r => r.json())
                .then(d => setSearchVal(d.display_name?.split(',').slice(0, 3).join(', ') || ''))
                .catch(() => {})
            }
            
            map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng))
            mapObjRef.current = { map, placePin, L }
            
            if (initialLat && initialLng) placePin(initialLat, initialLng)
                setMapReady(true)
            setTimeout(() => map.invalidateSize(), 100)
        })
        return () => {
            cancelled = true
            if (mapObjRef.current?.map) {
                mapObjRef.current.map.remove()
                mapObjRef.current = null
            }
        }
    }, [])
    
    const searchPlace = async (q) => {
        if (q.length < 3) { setSearchResults([]); return }
        setSearching(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Xorazm')}&format=json&limit=4&accept-language=uz`)
            const data = await res.json()
            setSearchResults(data.map(d => ({ lat: parseFloat(d.lat), lng: parseFloat(d.lon), name: d.display_name })))
        } catch { setSearchResults([]) }
        setSearching(false)
    }
    
    const selectResult = (r) => {
        setSearchResults([])
        setSearchVal(r.name.split(',').slice(0, 2).join(', '))
        mapObjRef.current?.placePin(r.lat, r.lng)
        mapObjRef.current?.map.setView([r.lat, r.lng], 16)
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Search */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f5f5f5', position: 'relative', zIndex: 999 }}>
        <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={searchVal}
        onChange={e => { setSearchVal(e.target.value); searchPlace(e.target.value) }}
        placeholder="Ko'cha yoki mahalla nomini kiriting..."
        style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }}
        onFocus={e => e.target.style.borderColor = '#21a95a'}
        onBlur={e => { e.target.style.borderColor = '#e8e8e8'; setTimeout(() => setSearchResults([]), 200) }}
        />
        {searching && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#aaa' }}>⏳</span>}
        </div>
        {searchResults.length > 0 && (
            <div style={{ position: 'absolute', left: 14, right: 14, top: '100%', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden' }}>
            {searchResults.map((r, i) => (
                <button key={i} onMouseDown={() => selectResult(r)}
                style={{ width: '100%', padding: '9px 12px', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid #f8f8f8' : 'none', background: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: '#333', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: '#21a95a', flexShrink: 0 }}>📍</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name.split(',').slice(0, 3).join(', ')}</span>
                </button>
            ))}
            </div>
        )}
        </div>
        
        {/* Map container */}
        <div style={{ flex: 1, position: 'relative', minHeight: 260 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 260 }} />
        {!mapReady && (
            <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: 14, color: '#aaa', fontWeight: 600 }}>
            🗺️ Xarita yuklanmoqda...
            </div>
        )}
        {inZone !== null && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: inZone ? '#1a1a1a' : '#ef4444', color: '#fff', padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
            {inZone ? '✅ Yetkazib berish mumkin!' : `❌ Zona tashqarida (${dist} km)`}
            </div>
        )}
        {mapReady && !pin && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '9px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 1000, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            👆 Xaritaga bosing
            </div>
        )}
        </div>
        
        {/* Bottom confirm */}
        {pin && inZone && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid #f5f5f5', background: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {LABELS.map(l => (
                <button key={l.id} onClick={() => setLabel(l.id)}
                style={{ flex: 1, padding: '6px', border: `1.5px solid ${label === l.id ? '#21a95a' : '#e8e8e8'}`, borderRadius: 8, background: label === l.id ? '#f0fdf4' : '#fff', color: label === l.id ? '#21a95a' : '#555', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <span style={{ fontSize: 13 }}>{l.icon}</span>{l.label}
                </button>
            ))}
            </div>
            <input value={detail} onChange={e => setDetail(e.target.value)}
            placeholder="Uy raqami, xonadon (ixtiyoriy)"
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', marginBottom: 10, boxSizing: 'border-box', color: '#1a1a1a' }}
            onFocus={e => e.target.style.borderColor = '#21a95a'}
            onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />
            <button onClick={() => onConfirm({ label, mahalla: searchVal || `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`, uy: detail, lat: pin.lat, lng: pin.lng })}
            style={{ width: '100%', padding: '12px', background: '#21a95a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
            Manzilni tasdiqlash →
            </button>
            </div>
        )}
        </div>
    )
}

export default function AddressModal({ isOpen, onClose, onSelect }) {
    const [addresses, setAddresses] = useState([])
    const [active, setActive] = useState(null)
    const [mode, setMode] = useState('list')
    const [editItem, setEditItem] = useState(null)
    
    useEffect(() => {
        if (isOpen) { setAddresses(getAddresses()); setActive(getActiveAddress()); setMode('list') }
    }, [isOpen])
    
    if (!isOpen) return null
    
    const reload = () => { setAddresses(getAddresses()); setActive(getActiveAddress()) }
    
    const handleConfirm = (data) => {
        if (editItem) { updateAddress(editItem.id, data); reload(); setMode('list') }
        else { const a = addAddress(data); setActiveAddress(a); onSelect?.(a); onClose() }
    }
    
    const handleSelect = (addr) => { setActiveAddress(addr); onSelect?.(addr); onClose() }
    const handleDelete = (id) => { if (!confirm("O'chirishni tasdiqlaysizmi?")) return; deleteAddress(id); reload() }
    const getLabelIcon = (l) => LABELS.find(x => x.id === l)?.icon || '📍'
    const getLabelText = (l) => LABELS.find(x => x.id === l)?.label || 'Boshqa'
    
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', fontFamily: "'Nunito', sans-serif" }}
        onClick={e => e.target === e.currentTarget && mode === 'list' && onClose()}>
        <div style={{ background: '#fff', width: '100%', borderRadius: '20px 20px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '10px auto 4px', flexShrink: 0 }} />
        <div style={{ padding: '10px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {mode !== 'list' && <button onClick={() => { setMode('list'); setEditItem(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555', padding: 0 }}>←</button>}
        <div style={{ fontSize: 17, fontWeight: 800 }}>
        {mode === 'list' ? 'Mening manzillarim' : editItem ? 'Manzilni tahrirlash' : 'Yangi manzil'}
        </div>
        </div>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        
        {mode === 'list' && (
            <div style={{ overflowY: 'auto', flex: 1 }}>
            <button onClick={() => { setEditItem(null); setMode('map') }}
            style={{ width: '100%', padding: '14px 16px', border: 'none', borderBottom: '1px solid #f5f5f5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#21a95a', fontWeight: 700 }}>+</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#21a95a' }}>Yangi manzil qo'shish</span>
            </button>
            {addresses.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Manzil qo'shilmagan</div>
                </div>
            ) : addresses.map(addr => {
                const isActive = active?.id === addr.id
                return (
                    <div key={addr.id} onClick={() => handleSelect(addr)}
                    style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 12, background: isActive ? '#f0fdf4' : '#fff', cursor: 'pointer' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: isActive ? '#21a95a' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{getLabelIcon(addr.label)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#21a95a' : '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getLabelText(addr.label)}
                    {isActive && <span style={{ fontSize: 10, background: '#21a95a', color: '#fff', padding: '1px 7px', borderRadius: 10 }}>Faol</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {addr.mahalla}{addr.uy ? `, ${addr.uy}` : ''}
                    </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); setEditItem(addr); setMode('map') }} style={{ padding: '6px 10px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>✏️</button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(addr.id) }} style={{ padding: '6px 10px', background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>🗑️</button>
                    </div>
                    </div>
                )
            })}
            <div style={{ height: 20 }} />
            </div>
        )}
        
        {mode === 'map' && (
            <MapPicker
            initialLat={editItem?.lat}
            initialLng={editItem?.lng}
            onConfirm={handleConfirm}
            onCancel={() => { setMode('list'); setEditItem(null) }}
            />
        )}
        </div>
        </div>
    )
}