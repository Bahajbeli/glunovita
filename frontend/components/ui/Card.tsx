'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseStyles = 'bg-white rounded-xl shadow-md overflow-hidden'
  const hoverStyles = hover ? 'cursor-pointer transition-shadow duration-300 hover:shadow-xl' : ''

  const content = (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  )

  if (hover && onClick) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
