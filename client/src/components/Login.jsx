import React, { useState } from 'react'

export default function Login({ setToast }){
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!resp.ok) throw new Error('Login failed')
      const data = await resp.json()
      setToast('Login successful')
    }catch(err){
      console.error(err)
      setToast('Login Failed: ' + (err.message || 'Server connection failed. Please try again in a few moments.'))
    }finally{ setLoading(false) }
  }

  return (
    <section className="card">
      <h2>Login</h2>
      <form onSubmit={handle}>
        <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required />
        <button type="submit" disabled={loading}>{loading? 'Logging in...' : 'Login'}</button>
      </form>
    </section>
  )
}
