import { Router } from 'express'
import multer from 'multer'
import { pool } from '../db/index.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

const SUPABASE_URL = `https://mrosuusvzlskdyqpxova.supabase.co`
const BUCKET = 'products'

async function uploadImage(buffer, filename, mimetype) {
  const key = process.env.SUPABASE_ANON_KEY
  if (!key) throw new Error('SUPABASE_ANON_KEY yo\'q')
    const path = `${Date.now()}-${filename.replace(/\s/g, '_')}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': mimetype, 'x-upsert': 'true' },
    body: buffer,
  })
  if (!res.ok) throw new Error(await res.text())
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, all } = req.query
    let query = 'SELECT * FROM products'
    const params = []
    const conds = []
    if (!all) conds.push('in_stock = 1')
      if (category && category !== 'all') { params.push(category); conds.push(`category_slug = $${params.length}`) }
    if (search) { params.push(`%${search}%`); conds.push(`name ILIKE $${params.length}`) }
    if (conds.length) query += ' WHERE ' + conds.join(' AND ')
      query += ' ORDER BY id ASC'
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Topilmadi' })
      res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, weight, price, category_slug, image_url } = req.body
    if (!name || !price || !category_slug) return res.status(400).json({ error: 'name, price, category_slug majburiy' })
      const { rows } = await pool.query(
      'INSERT INTO products (name, weight, price, category_slug, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, weight, price, category_slug, image_url || null]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, weight, price, category_slug, in_stock, image_url } = req.body
    await pool.query(
      'UPDATE products SET name=$1, weight=$2, price=$3, category_slug=$4, in_stock=$5, image_url=COALESCE(NULLIF($6,\'\'), image_url) WHERE id=$7',
      [name, weight, price, category_slug, in_stock ?? 1, image_url || '', req.params.id]
    )
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/products/:id/image
router.post('/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fayl topilmadi' })
      const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype)
    await pool.query('UPDATE products SET image_url=$1 WHERE id=$2', [imageUrl, req.params.id])
    res.json({ success: true, image_url: imageUrl })
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }) }
})

// PATCH /api/products/:id/stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { in_stock } = req.body
    await pool.query('UPDATE products SET in_stock=$1 WHERE id=$2', [in_stock, req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router