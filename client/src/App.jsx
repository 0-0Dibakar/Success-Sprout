import React, { useState } from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Toast from './components/Toast'

export default function App(){
  const [toast, setToast] = useState(null)
  return (
    <div className="app">
      <header>
        <h1>Success Sprout</h1>
      </header>
      <main>
        <Register setToast={setToast} />
        <Login setToast={setToast} />
      </main>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
