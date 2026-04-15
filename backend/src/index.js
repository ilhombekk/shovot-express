import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import productsRouter from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import ordersRouter from './routes/orders.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/products',   productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/orders',     ordersRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'supabase', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`✅ Backend ishlamoqda: http://localhost:${PORT}`)
})