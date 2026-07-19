'use client'

import React from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'

interface GoogleButtonProps {
  onSuccess: (token: string) => void
  onError: () => void
  isLoading?: boolean
  text?: string
}

export default function GoogleButton({ onSuccess, onError, isLoading, text = 'Continuer avec Google' }: GoogleButtonProps) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        onSuccess(tokenResponse.access_token)
      } else {
        onError()
      }
    },
    onError: () => onError(),
  })

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FcGoogle className="w-6 h-6" />
      <span className="font-semibold">{text}</span>
    </button>
  )
}
