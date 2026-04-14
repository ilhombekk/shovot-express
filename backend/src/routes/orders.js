import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// POST /api/orders — yangi buyurtma
router.post('/', (req, res) => {
  const { items, total, deliveryFee, telegramUser, address } = req.body

  if (!items || !items.length || !total) {
    return res.status(400).json({ error: "items va total majburiy" })
  }

  const result = db.prepare(`
    INSERT INTO orders (telegram_user_id, telegram_username, total, delivery_fee, address, items)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    telegramUser?.id?.toString() || null,
    telegramUser?.username || null,
    total,
    deliveryFee || 5000,
    address || null,
    JSON.stringify(items)
  )

  // Telegram botga xabar yuborish (ixtiyoriy)
  notifyBot(result.lastInsertRowid, items, total, telegramUser)

  res.json({ id: result.lastInsertRowid, status: 'new' })
})

// GET /api/orders — barcha buyurtmalar (admin)
router.get('/', (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders ORDER BY created_at DESC LIMIT 100'
  ).all()
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })))
})

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Topilmadi' })
  res.json({ ...order, items: JSON.parse(order.items) })
})

// PATCH /api/orders/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body
  const allowed = ['new', 'confirmed', 'delivering', 'done', 'cancelled']
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Noto\'g\'ri status' })
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id)
  res.json({ success: true })
})

// Bot notification (BOT_TOKEN bo'lsa ishlaydi)
async function notifyBot(orderId, items, total, user) {
  const token = process.env.BOT_TOKEN
  const chatId = process.env.ADMIN_CHAT_ID
  if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return

  const itemsList = items.map(i => `• ${i.name || i.productId} × ${i.qty}`).join('\n')
  const text = `🛒 Yangi buyurtma #${orderId}\n\n${itemsList}\n\nJami: ${total.toLocaleString('uz-UZ')} so'm\nMijoz: ${user?.first_name || 'Noma\'lum'}`

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    })
  } catch (e) {
    console.error('Bot xabari yuborilmadi:', e.message)
  }
}

export default router
