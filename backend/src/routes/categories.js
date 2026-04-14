import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY id').all()
  res.json(cats)
})

export default router
