'use client'

import AuthGuard from '@/components/common/AuthGuard'

export default function TSSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}


