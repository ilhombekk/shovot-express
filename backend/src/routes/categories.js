import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY id')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router