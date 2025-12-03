'use client'

import { UserAuthProvider } from '@/lib/contexts/UserAuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <UserAuthProvider>{children}</UserAuthProvider>
}
