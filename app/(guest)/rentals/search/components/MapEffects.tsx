// app/(guest)/rentals/search/components/MapEffects.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../styles/map.module.css'

interface MapEffectsProps {
  selectedCar?: any
  hoveredCar?: any
  searchLocation?: { lat: number; lng: number }
  userLocation?: { lat: number; lng: number }
  isLoading?: boolean
}

export function MapEffects({ 
  selectedCar, 
  hoveredCar, 
  searchLocation,
  userLocation,
  isLoading 
}: MapEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(undefined)
  const [ripples, setRipples] = useState<Array<{
    x: number
    y: number
    radius: number
    opacity: number
    id: string
  }>>([])
  
  // Add ripple effect on selection
  useEffect(() => {
    if (selectedCar) {
      const newRipple = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 0,
        opacity: 1,
        id: `ripple-${Date.now()}`
      }
      setRipples(prev => [...prev, newRipple])
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 1000)
    }
  }, [selectedCar])
  
  // Animated particles for luxury cars
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
    }> = []
    
    // Create particles for luxury cars
    if (hoveredCar?.carType === 'luxury') {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.5,
          color: '#f59e0b'
        })
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.opacity *= 0.99
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [hoveredCar])
  
  return (
    <>
      {/* Canvas for particle effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: `translate(-50%, -50%)`
          }}
        />
      ))}
      
      {/* Pulse effect for search location */}
      {searchLocation && (
        <div className={styles.searchPulse}>
          <div className={styles.pulseRing} />
          <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }} />
          <div className={styles.pulseRing} style={{ animationDelay: '1s' }} />
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className={styles.loadingSpinner}>
            <div className={styles.spinnerRing} />
            <div className={styles.spinnerRing} />
            <div className={styles.spinnerRing} />
          </div>
        </div>
      )}
      
      {/* Selection highlight */}
      {selectedCar && (
        <div className={styles.selectionHighlight}>
          <div className={styles.highlightBeam} />
          <div className={styles.highlightGlow} />
        </div>
      )}
      
      {/* Hover tooltip */}
      {hoveredCar && (
        <div className={styles.hoverTooltip}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {hoveredCar.year} {hoveredCar.make} {hoveredCar.model}
              </span>
              {hoveredCar.instantBook && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  ⚡ Instant
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-600">
                ${hoveredCar.dailyRate}
              </span>
              <span className="text-xs text-gray-500">per day</span>
            </div>
            {hoveredCar.rating && (
              <div className="flex items-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm ml-1">{hoveredCar.rating.average}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({hoveredCar.rating.count} trips)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Connection lines for nearby cars */}
      <svg className="absolute inset-0 pointer-events-none z-10">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Connection lines would be drawn here based on car positions */}
      </svg>
      
      {/* Grid overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.debugGrid} />
      )}
    </>
  )
}