'use client'

import { useEffect, useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) {
      const redirect = encodeURIComponent(pathname || '/')
      router.replace(`/auth/login?redirect=${redirect}`)
      return
    }
    setChecking(false)
  }, [pathname, router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        <span className="animate-pulse">Checking authentication…</span>
      </div>
    )
  }

  return <>{children}</>
}


