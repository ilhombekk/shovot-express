// Manzillar boshqaruvi - localStorage ga saqlanadi

export const getAddresses = () => {
    try { return JSON.parse(localStorage.getItem('shovot_addresses') || '[]') } catch { return [] }
}

export const saveAddresses = (addresses) => {
    localStorage.setItem('shovot_addresses', JSON.stringify(addresses))
}

export const getActiveAddress = () => {
    try { return JSON.parse(localStorage.getItem('shovot_active_address') || 'null') } catch { return null }
}

export const setActiveAddress = (address) => {
    localStorage.setItem('shovot_active_address', JSON.stringify(address))
}

export const addAddress = (address) => {
    const addresses = getAddresses()
    const newAddr = { ...address, id: Date.now() }
    addresses.push(newAddr)
    saveAddresses(addresses)
    if (addresses.length === 1) setActiveAddress(newAddr)
        return newAddr
}

export const updateAddress = (id, data) => {
    const addresses = getAddresses().map(a => a.id === id ? { ...a, ...data } : a)
    saveAddresses(addresses)
    const active = getActiveAddress()
    if (active?.id === id) setActiveAddress({ ...active, ...data })
    }

export const deleteAddress = (id) => {
    const addresses = getAddresses().filter(a => a.id !== id)
    saveAddresses(addresses)
    const active = getActiveAddress()
    if (active?.id === id) setActiveAddress(addresses[0] || null)
    }