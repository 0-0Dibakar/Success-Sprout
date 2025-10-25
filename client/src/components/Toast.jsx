import React, { useEffect } from 'react'

export default function Toast({ message, onClose }){
  useEffect(()=>{
    const t = setTimeout(()=>onClose(), 4000)
    return ()=>clearTimeout(t)
  },[])
  return (
    <div className="toast">{message}<button onClick={onClose}>✕</button></div>
  )
}
