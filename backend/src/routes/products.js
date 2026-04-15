import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = 'SELECT * FROM products WHERE in_stock = 1'
    const params = []
    
    if (category && category !== 'all') {
      params.push(category)
      query += ` AND category_slug = $${params.length}`
    }
    if (search) {
      params.push(`%${search}%`)
      query += ` AND name ILIKE $${params.length}`
    }
    query += ' ORDER BY id ASC'
    
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Topilmadi' })
      res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, weight, price, category_slug, emoji } = req.body
    if (!name || !price || !category_slug) {
      return res.status(400).json({ error: 'name, price, category_slug majburiy' })
    }
    const { rows } = await pool.query(
      'INSERT INTO products (name, weight, price, category_slug, emoji) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, weight, price, category_slug, emoji || '📦']
    )
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, weight, price, category_slug, emoji, in_stock } = req.body
    await pool.query(
      'UPDATE products SET name=$1, weight=$2, price=$3, category_slug=$4, emoji=$5, in_stock=$6 WHERE id=$7',
      [name, weight, price, category_slug, emoji, in_stock ?? 1, req.params.id]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE products SET in_stock = 0 WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router