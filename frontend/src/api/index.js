import axios from 'axios'

const api = axios.create({
  baseURL: 'https://shovot-express.onrender.com/api',
  timeout: 10000,
})

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const getCategories = () => api.get('/categories')
export const createOrder = (data) => api.post('/orders', data)
export const getOrders = () => api.get('/orders')
export const getOrder = (id) => api.get(`/orders/${id}`)

export default api