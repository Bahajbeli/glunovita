import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Toast from '@/components/ui/Toast'

import { CartProvider } from '@/contexts/CartContext'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Celiac Disease Management Platform',
  description: 'Digital platform for managing and coordinating celiac disease patient follow-up',
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <GoogleOAuthProvider clientId="818425628175-2jql5t00cft0scbaimiimi4876dcr4cv.apps.googleusercontent.com">
            <AuthProvider>
              <CartProvider>
                {children}
                <Toast />
              </CartProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
