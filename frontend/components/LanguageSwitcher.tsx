'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { FiGlobe } from 'react-icons/fi'

const locales = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' }
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [currentLocale, setCurrentLocale] = useState('fr')

  useEffect(() => {
    if (pathname) {
      const found = locales.find(l => pathname.startsWith(`/${l.code}/`) || pathname === `/${l.code}`)?.code
      if (found) {
        setCurrentLocale(found)
      } else {
        setCurrentLocale('fr')
      }
    }
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const changeLanguage = (localeCode: string) => {
    if (localeCode === currentLocale) {
      setIsOpen(false)
      return
    }

    let newPathname = pathname || '/'
    const hasLocalePrefix = locales.some(l => newPathname.startsWith(`/${l.code}/`) || newPathname === `/${l.code}`)

    if (hasLocalePrefix) {
      newPathname = newPathname.replace(/^\/[^\/]+/, `/${localeCode}`)
    } else {
      newPathname = `/${localeCode}${newPathname === '/' ? '' : newPathname}`
    }

    if (localeCode === 'fr') {
       if (hasLocalePrefix) {
           newPathname = newPathname.replace(/^\/[^\/]+/, '')
           if (newPathname === '') newPathname = '/'
       }
    }

    document.cookie = `NEXT_LOCALE=${localeCode}; path=/; max-age=31536000; SameSite=Lax`
    router.push(newPathname)
    router.refresh()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        title="Changer de langue"
      >
        <FiGlobe className="w-5 h-5" />
        <span className="text-sm font-medium uppercase">{currentLocale}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => changeLanguage(locale.code)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentLocale === locale.code
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {locale.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
