import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../../../data')
const dbPath = path.join(dataDir, 'shovot.db')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  
const SQL = await initSqlJs()

let db
if (fs.existsSync(dbPath)) {
  const fileBuffer = fs.readFileSync(dbPath)
  db = new SQL.Database(fileBuffer)
} else {
  db = new SQL.Database()
}

function save() {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

// Jadvallar
db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    emoji TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weight TEXT,
    price INTEGER NOT NULL,
    category_slug TEXT NOT NULL,
    emoji TEXT,
    in_stock INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_user_id TEXT,
    telegram_username TEXT,
    total INTEGER NOT NULL,
    delivery_fee INTEGER DEFAULT 5000,
    status TEXT DEFAULT 'new',
    address TEXT,
    items TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)
  
  // sql.js uchun yordamchi funksiyalar (better-sqlite3 ga o'xshash API)
  const wrapper = {
    prepare: (sql) => ({
      all: (...params) => {
        const res = db.exec(sql, params)
        if (!res.length) return []
        const { columns, values } = res[0]
        return values.map(row =>
          Object.fromEntries(columns.map((col, i) => [col, row[i]]))
        )
      },
      get: (...params) => {
        const res = db.exec(sql, params)
        if (!res.length || !res[0].values.length) return undefined
        const { columns, values } = res[0]
        return Object.fromEntries(columns.map((col, i) => [col, values[0][i]]))
      },
      run: (...params) => {
        db.run(sql, params)
        save()
        const lastId = db.exec('SELECT last_insert_rowid() as id')
        return { lastInsertRowid: lastId[0]?.values[0]?.[0] }
      }
    }),
    exec: (sql) => { db.run(sql); save() }
  }
  
  // Seed data
  const catCount = wrapper.prepare('SELECT COUNT(*) as n FROM categories').get()
  if (catCount.n === 0) {
    const cats = [
      ['Sabzavot', 'sabzavot', '🥬'],
      ['Meva', 'meva', '🍎'],
      ['Sut mahsulot', 'sut', '🥛'],
      ['Non & xamir', 'non', '🍞'],
      ["Go'sht", 'gosht', '🥩'],
      ['Ichimlik', 'ichimlik', '🧃'],
    ]
    cats.forEach(([name, slug, emoji]) =>
      wrapper.prepare('INSERT INTO categories (name, slug, emoji) VALUES (?, ?, ?)').run(name, slug, emoji)
  )
  
  const products = [
    ['Pomidor','1 kg',12000,'sabzavot','🍅'],
    ['Bodring','1 kg',8000,'sabzavot','🥒'],
    ['Kartoshka','1 kg',5000,'sabzavot','🥔'],
    ['Karam','1 dona',7000,'sabzavot','🥬'],
    ['Olma','1 kg',15000,'meva','🍎'],
    ['Banan','1 kg',18000,'meva','🍌'],
    ['Uzum','500 g',14000,'meva','🍇'],
    ['Limon','3 ta',6000,'meva','🍋'],
    ['Sut','1 litr',9000,'sut','🥛'],
    ['Tuxum','10 ta',22000,'sut','🥚'],
    ['Qatiq','500 ml',8000,'sut','🫙'],
    ["Sariyog'","200 g",19000,'sut','🧈'],
    ['Non','500 g',6000,'non','🍞'],
    ['Lavash','3 ta',7000,'non','🫓'],
    ["Mol go'shti",'500 g',45000,'gosht','🥩'],
    ['Tovuq','1 kg',35000,'gosht','🍗'],
    ['Limonad','1.5 l',12000,'ichimlik','🧃'],
    ['Suv','1.5 l',5000,'ichimlik','💧'],
  ]
  products.forEach(([name, weight, price, cat, emoji]) =>
    wrapper.prepare('INSERT INTO products (name, weight, price, category_slug, emoji) VALUES (?, ?, ?, ?, ?)').run(name, weight, price, cat, emoji)
)
console.log('✅ Seed data yuklandi')
}

export default wrapper