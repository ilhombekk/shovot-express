import { useState, useEffect, useRef } from 'react'
import {
    getAddresses, getActiveAddress, setActiveAddress,
    addAddress, updateAddress, deleteAddress
} from '../store/addressStore'

const SHOVOT_LAT = 41.658
const SHOVOT_LNG = 60.295
const MAX_RADIUS_KM = 15

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
            const check = setInterval(() => { if (window.L) { clearInterval(check); resolve(window.L) } }, 100)
            }
    })
}

// ── Xarita modali (Lavka uslubida) ──────────────────
function MapModal({ initial, onConfirm, onClose }) {
    const mapRef = useRef(null)
    const mapObjRef = useRef(null)
    const markerRef = useRef(null)
    const [pin, setPin] = useState(null)
    const [inZone, setInZone] = useState(null)
    const [addrText, setAddrText] = useState('')
    const [searchVal, setSearchVal] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [mapReady, setMapReady] = useState(false)
    const [locating, setLocating] = useState(false)
    const [label, setLabel] = useState(initial?.label || 'home')
    const [detail, setDetail] = useState(initial?.uy || '')
    
    useEffect(() => {
        let cancelled = false
        loadLeaflet().then((L) => {
            if (cancelled || !mapRef.current || mapObjRef.current) return
            
            const map = L.map(mapRef.current, {
                center: [initial?.lat || SHOVOT_LAT, initial?.lng || SHOVOT_LNG],
                zoom: 14,
                zoomControl: false,
            })
            L.control.zoom({ position: 'bottomright' }).addTo(map)
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map)
            
            // Yetkazib berish zonasi
            L.circle([SHOVOT_LAT, SHOVOT_LNG], {
                radius: MAX_RADIUS_KM * 1000,
                color: '#21a95a', fillColor: '#21a95a',
                fillOpacity: 0.07, weight: 2, dashArray: '6 4'
            }).addTo(map)
            
            const makeIcon = (ok) => L.divIcon({
                html: `<div style="width:36px;height:44px;position:relative;">
          <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${ok ? '#21a95a' : '#ef4444'};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.35);"></div>
          <div style="position:absolute;top:9px;left:9px;width:14px;height:14px;border-radius:50%;background:#fff;"></div>
        </div>`,
                iconSize: [36, 44], iconAnchor: [18, 44], className: ''
            })
            
            const placePin = (lat, lng, skipGeocode) => {
                const d = getDistanceKm(lat, lng, SHOVOT_LAT, SHOVOT_LNG)
                const ok = d <= MAX_RADIUS_KM
                setPin({ lat, lng })
                setInZone(ok)
                if (markerRef.current) map.removeLayer(markerRef.current)
                    markerRef.current = L.marker([lat, lng], { icon: makeIcon(ok), zIndexOffset: 1000 }).addTo(map)
                if (!skipGeocode) {
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`)
                    .then(r => r.json())
                    .then(d => {
                        const txt = d.address
                        ? [d.address.road || d.address.street, d.address.city || d.address.town || d.address.village].filter(Boolean).join(', ')
                        : d.display_name?.split(',').slice(0, 2).join(', ') || ''
                        setAddrText(txt)
                        setSearchVal(txt)
                    }).catch(() => {})
                }
            }
            
            map.on('click', (e) => {
                placePin(e.latlng.lat, e.latlng.lng)
                map.panTo([e.latlng.lat, e.latlng.lng])
            })
            
            mapObjRef.current = { map, placePin }
            
            if (initial?.lat && initial?.lng) {
                placePin(initial.lat, initial.lng)
                setAddrText(initial.mahalla || '')
                setSearchVal(initial.mahalla || '')
            }
            setMapReady(true)
            setTimeout(() => map.invalidateSize(), 150)
        })
        return () => {
            cancelled = true
            if (mapObjRef.current?.map) { mapObjRef.current.map.remove(); mapObjRef.current = null }
        }
    }, [])
    
    const geoLocate = () => {
        if (!navigator.geolocation) return
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false)
                const { latitude: lat, longitude: lng } = pos.coords
                mapObjRef.current?.map.setView([lat, lng], 16)
                mapObjRef.current?.placePin(lat, lng)
            },
            () => setLocating(false),
            { timeout: 8000 }
        )
    }
    
    const searchPlace = async (q) => {
        if (q.length < 2) { setSearchResults([]); return }
        setSearching(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Shovot Xorazm Uzbekistan')}&format=json&limit=5&accept-language=uz`)
            const data = await res.json()
            setSearchResults(data.map(d => ({ lat: parseFloat(d.lat), lng: parseFloat(d.lon), name: d.display_name })))
        } catch { setSearchResults([]) }
        setSearching(false)
    }
    
    const selectResult = (r) => {
        const name = r.name.split(',').slice(0, 2).join(', ')
        setSearchVal(name); setAddrText(name); setSearchResults([])
        mapObjRef.current?.placePin(r.lat, r.lng, true)
        mapObjRef.current?.map.setView([r.lat, r.lng], 16)
    }
    
    const handleOk = () => {
        if (!pin || !inZone) return
        onConfirm({
            label,
            mahalla: addrText || searchVal || `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`,
            uy: detail,
            lat: pin.lat,
            lng: pin.lng,
        })
    }
    
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 16 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>Manzilingizni kiriting</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4, lineHeight: 1.4 }}>
        Yetkazib berish faqat Shovot tumani doirasida ({MAX_RADIUS_KM} km)
        </div>
        </div>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>✕</button>
        </div>
        
        {/* Search + OK */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
        value={searchVal}
        onChange={e => { setSearchVal(e.target.value); searchPlace(e.target.value) }}
        placeholder="Ko'cha, mahalla nomini kiriting..."
        style={{ width: '100%', padding: '10px 36px 10px 32px', border: '1.5px solid #e8e8e8', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }}
        onFocus={e => e.target.style.borderColor = '#21a95a'}
        onBlur={e => { e.target.style.borderColor = '#e8e8e8'; setTimeout(() => setSearchResults([]), 200) }}
        />
        {searchVal && (
            <button onClick={() => { setSearchVal(''); setSearchResults([]) }}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16, padding: 0 }}>✕</button>
        )}
        {searching && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#aaa' }}>⏳</span>}
        </div>
        <button
        onClick={handleOk}
        disabled={!pin || !inZone}
        style={{ padding: '10px 22px', background: pin && inZone ? '#ffd700' : '#f0f0f0', color: pin && inZone ? '#1a1a1a' : '#bbb', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: pin && inZone ? 'pointer' : 'default', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
        Ok
        </button>
        </div>
        
        {/* Search results dropdown */}
        {searchResults.length > 0 && (
            <div style={{ position: 'absolute', left: 20, right: 20, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 400, overflow: 'hidden', marginTop: 4 }}>
            {searchResults.map((r, i) => (
                <button key={i} onMouseDown={() => selectResult(r)}
                style={{ width: '100%', padding: '10px 14px', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid #f8f8f8' : 'none', background: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#333', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#21a95a', flexShrink: 0 }}>📍</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name.split(',').slice(0, 3).join(', ')}</span>
                </button>
            ))}
            </div>
        )}
        </div>
        
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 280 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 280 }} />
        
        {/* Loading */}
        {!mapReady && (
            <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: 14, color: '#aaa', fontWeight: 600 }}>
            🗺️ Xarita yuklanmoqda...
            </div>
        )}
        
        {/* Status badge */}
        {inZone !== null && mapReady && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: inZone ? '#1a1a1a' : '#ef4444', color: '#fff', padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 500, whiteSpace: 'nowrap', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
            {inZone ? '✅ Yetkazib berish mumkin!' : '❌ Bu joyga yetkazib berilmaydi'}
            </div>
        )}
        
        {mapReady && !pin && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '10px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 500, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            👆 Xaritaga bosing
            </div>
        )}
        
        {/* Geo locate button */}
        <button onClick={geoLocate} disabled={locating}
        style={{ position: 'absolute', bottom: 60, right: 12, zIndex: 500, width: 36, height: 36, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        {locating ? '⏳' : '📡'}
        </button>
        </div>
        
        {/* Bottom: label + detail + ok (agar pin tanlangan bo'lsa) */}
        {pin && inZone && (
            <div style={{ padding: '14px 20px 20px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {LABELS.map(l => (
                <button key={l.id} onClick={() => setLabel(l.id)}
                style={{ flex: 1, padding: '7px', border: `1.5px solid ${label === l.id ? '#21a95a' : '#e8e8e8'}`, borderRadius: 10, background: label === l.id ? '#f0fdf4' : '#fff', color: label === l.id ? '#21a95a' : '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 14 }}>{l.icon}</span>{l.label}
                </button>
            ))}
            </div>
            <input value={detail} onChange={e => setDetail(e.target.value)}
            placeholder="Uy raqami, xonadon (ixtiyoriy)"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }}
            onFocus={e => e.target.style.borderColor = '#21a95a'}
            onBlur={e => e.target.style.borderColor = '#e8e8e8'}
            />
            </div>
        )}
        </div>
        </div>
    )
}

// ── Asosiy AddressModal ──────────────────────────────
export default function AddressModal({ isOpen, onClose, onSelect, preventParentClose }) {
    const [addresses, setAddresses] = useState([])
    const [active, setActive] = useState(null)
    const [mode, setMode] = useState('list') // list | map
    const [editItem, setEditItem] = useState(null)
    
    useEffect(() => {
        if (isOpen) { setAddresses(getAddresses()); setActive(getActiveAddress()); setMode('list') }
    }, [isOpen])
    
    if (!isOpen) return null
    
    const reload = () => { setAddresses(getAddresses()); setActive(getActiveAddress()) }
    
    const handleConfirm = (data) => {
        if (editItem) { updateAddress(editItem.id, data); reload(); setMode('list') }
        else {
            const a = addAddress(data)
            setActiveAddress(a)
            onSelect?.(a)
            if (!preventParentClose) onClose()
            }
        setEditItem(null)
    }
    
    const handleSelect = (addr) => {
        setActiveAddress(addr)
        onSelect?.(addr)
        if (!preventParentClose) onClose()
        }
    const handleDelete = (id) => { if (!confirm("O'chirishni tasdiqlaysizmi?")) return; deleteAddress(id); reload() }
    const getLabelIcon = (l) => LABELS.find(x => x.id === l)?.icon || '📍'
    const getLabelText = (l) => LABELS.find(x => x.id === l)?.label || 'Boshqa'
    
    return (
        <>
        {/* LIST MODAL */}
        {mode === 'list' && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: 16 }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 480, borderRadius: 20, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: 4 }} />
            <div style={{ padding: '10px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5', flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Mening manzillarim</div>
            <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
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
            </div>
            </div>
        )}
        
        {/* MAP MODAL — markazda */}
        {mode === 'map' && (
            <MapModal
            initial={editItem}
            onConfirm={handleConfirm}
            onClose={() => { setMode('list'); setEditItem(null) }}
            />
        )}
        </>
    )
}