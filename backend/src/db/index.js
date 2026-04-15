import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Better-sqlite3 ga o'xshash API yasaymiz
const db = {
  prepare: (sql) => ({
    all: async (...params) => {
      const { rows } = await pool.query(sql, params)
      return rows
    },
    get: async (...params) => {
      const { rows } = await pool.query(sql, params)
      return rows[0] || undefined
    },
    run: async (...params) => {
      const { rows } = await pool.query(sql + ' RETURNING id', params)
      return { lastInsertRowid: rows[0]?.id }
    }
  }),
  query: async (sql, params = []) => {
    const { rows } = await pool.query(sql, params)
    return rows
  },
  exec: async (sql) => {
    await pool.query(sql)
  }
}

export default db
export { pool }