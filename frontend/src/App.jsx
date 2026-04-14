import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPanel from './pages/AdminPanel'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shovot_user') || 'null') } catch { return null }
  })
  
  const handleRegister = (userData) => {
    setUser(userData)
  }
  
  return (
    <Routes>
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/*" element={
      user
      ? <HomePage />
      : <RegisterPage onDone={handleRegister} />
    } />
    </Routes>
  )
}