'use client'

import AuthGuard from '@/components/common/AuthGuard'

export default function ZengoSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}


