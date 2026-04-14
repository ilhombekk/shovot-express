import axios from 'axios'

const api = axios.create({
  baseURL: 'https://shovot-express.onrender.com/api',
  timeout: 10000,
})

// Products
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const getCategories = () => api.get('/categories')

// Orders
export const createOrder = (data) => api.post('/orders', data)
export const getOrder = (id) => api.get(`/orders/${id}`)

// Auth
export const loginWithTelegram = (initData) => api.post('/auth/telegram', { initData })

export default api
