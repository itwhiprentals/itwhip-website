'use client'
import { useEffect, useState } from 'react'

export default function TestAuth() {
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    fetch('/api/rentals/user-bookings', { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
  }, [])
  
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}