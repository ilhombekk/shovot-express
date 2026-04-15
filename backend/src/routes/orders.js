import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, total, deliveryFee, telegramUser, address, customerName, customerPhone } = req.body
    
    if (!items || !items.length || !total) {
      return res.status(400).json({ error: 'items va total majburiy' })
    }
    
    const { rows } = await pool.query(
      `INSERT INTO orders (telegram_user_id, telegram_username, customer_name, customer_phone, total, delivery_fee, address, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        telegramUser?.id?.toString() || null,
        telegramUser?.username || null,
        customerName || null,
        customerPhone || null,
        total,
        deliveryFee || 5000,
        address || null,
        JSON.stringify(items)
      ]
    )
    
    const orderId = rows[0].id
    notifyBot(orderId, items, total, telegramUser, customerName, customerPhone, address)
    res.json({ id: orderId, status: 'new' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100')
    res.json(rows.map(o => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Topilmadi' })
      const o = rows[0]
    res.json({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['new', 'confirmed', 'delivering', 'done', 'cancelled']
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Noto'g'ri status" })
    }
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id])
    
    // Status o'zgarganda botga xabar
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])
    if (rows[0]) notifyStatusChange(rows[0], status)
      
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Bot notification
async function notifyBot(orderId, items, total, user, customerName, customerPhone, address) {
  const token = process.env.BOT_TOKEN
  const chatId = process.env.ADMIN_CHAT_ID
  if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return
  
  const itemsList = items.map(i => `• ${i.name || 'Mahsulot'} × ${i.qty} = ${((i.price || 0) * i.qty).toLocaleString('uz-UZ')} so'm`).join('\n')
  const text = `🛒 *Yangi buyurtma #${orderId}*\n\n${itemsList}\n\n💰 Jami: ${total.toLocaleString('uz-UZ')} so'm\n👤 ${customerName || user?.first_name || "Noma'lum"}\n📞 ${customerPhone || 'Telefon yo\'q'}\n📍 ${address || 'Manzil yo\'q'}`
  
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    })
  } catch (e) {
    console.error('Bot xabari yuborilmadi:', e.message)
  }
}

async function notifyStatusChange(order, status) {
  const token = process.env.BOT_TOKEN
  const chatId = process.env.ADMIN_CHAT_ID
  if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return
  
  const statusLabels = {
    confirmed: '✅ Tasdiqlandi',
    delivering: '🚴 Yetkazilmoqda',
    done: '🎉 Yetkazildi',
    cancelled: '❌ Bekor qilindi',
  }
  if (!statusLabels[status]) return
  
  const text = `${statusLabels[status]}\n\nBuyurtma #${order.id}\n👤 ${order.customer_name || "Noma'lum"}\n📞 ${order.customer_phone || ''}`
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    })
  } catch {}
}

export default router