'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            maxWidth: '420px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#06b6d4',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }
          },
        }}
      />
      {children}
    </>
  );
} 