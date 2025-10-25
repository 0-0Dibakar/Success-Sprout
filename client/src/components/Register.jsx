import React, { useState } from 'react'

export default function Register({ setToast }){
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
        const data = await resp.json()
        if (!resp.ok) {
          // server returned JSON error message
          const msg = data?.message || 'Registration failed'
          throw new Error(msg)
        }
        setToast('Registration successful')
      setForm({ name: '', email: '', password: '' })
    }catch(err){
      console.error(err)
      setToast('Registration Failed: ' + (err.message || 'Server connection failed. Please try again in a few moments.'))
    }finally{ setLoading(false) }
  }

  return (
    <section className="card">
      <h2>Register</h2>
      <form onSubmit={handle}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
        <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required />
        <button type="submit" disabled={loading}>{loading? 'Registering...' : 'Register'}</button>
      </form>
    </section>
  )
}
