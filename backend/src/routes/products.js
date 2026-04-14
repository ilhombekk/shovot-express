import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// GET /api/products
router.get('/', (req, res) => {
  const { category, search } = req.query
  let query = 'SELECT * FROM products WHERE in_stock = 1'
  const params = []

  if (category && category !== 'all') {
    query += ' AND category_slug = ?'
    params.push(category)
  }

  if (search) {
    query += ' AND name LIKE ?'
    params.push(`%${search}%`)
  }

  query += ' ORDER BY id ASC'
  const products = db.prepare(query).all(...params)
  res.json(products)
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) return res.status(404).json({ error: 'Topilmadi' })
  res.json(product)
})

// POST /api/products (admin)
router.post('/', (req, res) => {
  const { name, weight, price, category_slug, emoji } = req.body
  if (!name || !price || !category_slug) {
    return res.status(400).json({ error: 'name, price, category_slug majburiy' })
  }
  const result = db.prepare(
    'INSERT INTO products (name, weight, price, category_slug, emoji) VALUES (?, ?, ?, ?, ?)'
  ).run(name, weight, price, category_slug, emoji || '📦')
  res.json({ id: result.lastInsertRowid, ...req.body })
})

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const { name, weight, price, category_slug, emoji, in_stock } = req.body
  db.prepare(`
    UPDATE products SET name=?, weight=?, price=?, category_slug=?, emoji=?, in_stock=?
    WHERE id=?
  `).run(name, weight, price, category_slug, emoji, in_stock ?? 1, req.params.id)
  res.json({ success: true })
})

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  db.prepare('UPDATE products SET in_stock = 0 WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
