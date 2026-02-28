// app/components/BottomSheet.tsx
// Reusable bottom sheet component for mobile-friendly editing overlays

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { IoCloseOutline, IoChevronDownOutline } from 'react-icons/io5'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  // Size presets: small (40%), medium (60%), large (80%), full (100%)
  size?: 'small' | 'medium' | 'large' | 'full'
  // Show drag handle for swipe-to-dismiss
  showDragHandle?: boolean
  // Footer content (e.g., save buttons)
  footer?: React.ReactNode
  // Optional className for custom styling
  className?: string
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  showDragHandle = true,
  footer,
  className = ''
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const startY = useRef(0)
  const currentY = useRef(0)

  // Size mappings (percentage of viewport height)
  const sizeMap = {
    small: '45vh',
    medium: '60vh',
    large: '75vh',
    full: '75vh'
  }

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset translateY when closing/opening
  useEffect(() => {
    if (!isOpen) {
      setTranslateY(0)
    }
  }, [isOpen])

  // Drag handlers for swipe-to-dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!showDragHandle) return
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
    setIsDragging(true)
  }, [showDragHandle])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !showDragHandle) return
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    // Only allow dragging down
    if (diff > 0) {
      setTranslateY(diff)
    }
  }, [isDragging, showDragHandle])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !showDragHandle) return
    setIsDragging(false)

    // If dragged more than 100px, close the sheet
    if (translateY > 100) {
      onClose()
    } else {
      // Snap back to original position
      setTranslateY(0)
    }
  }, [isDragging, showDragHandle, translateY, onClose])

  // Mouse drag handlers (for desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!showDragHandle) return
    startY.current = e.clientY
    currentY.current = e.clientY
    setIsDragging(true)
  }, [showDragHandle])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !showDragHandle) return
    currentY.current = e.clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      setTranslateY(diff)
    }
  }, [isDragging, showDragHandle])

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !showDragHandle) return
    setIsDragging(false)

    if (translateY > 100) {
      onClose()
    } else {
      setTranslateY(0)
    }
  }, [isDragging, showDragHandle, translateY, onClose])

  // Two-phase mount for slide animation:
  // Phase 1: mount into DOM at translateY(100%) — off-screen
  // Phase 2: after browser paints, set visible=true to trigger CSS transition to translateY(0)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Phase 1: mount the component (renders at translateY(100%))
      setMounted(true)
      // Phase 2: after a tick so browser paints the off-screen position,
      // trigger the slide-up transition
      const timer = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      // Start slide-out animation
      setVisible(false)
      // Remove from DOM after animation completes
      const timer = setTimeout(() => setMounted(false), 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div className={`fixed inset-0 z-50 ${!isOpen && !visible ? 'pointer-events-none' : ''}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDuration: '400ms' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          absolute bottom-0 left-0 right-0
          bg-white dark:bg-gray-900
          rounded-t-2xl shadow-2xl
          flex flex-col
          ${isDragging ? '' : 'transition-transform [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]'}
          ${className}
        `}
        style={{
          maxHeight: sizeMap[size],
          height: size === 'full' ? '75vh' : 'auto',
          transitionDuration: isDragging ? '0ms' : '400ms',
          transform: visible && translateY === 0
            ? 'translateY(0)'
            : visible
              ? `translateY(${translateY}px)`
              : 'translateY(100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div
            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2
              id="bottom-sheet-title"
              className="text-base font-semibold text-gray-900 dark:text-white truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
