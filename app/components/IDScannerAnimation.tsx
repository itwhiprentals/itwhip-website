'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function IDScannerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Track scroll progress relative to container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'], // Track from when container enters to when it leaves
  })

  // Apply spring physics to smooth out mobile jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Transform scroll progress to ID card Y position
  // ID starts below (100%), moves through center, exits above (-100%)
  const idTranslateY = useTransform(smoothProgress, [0, 1], [100, -100])

  // Transform scroll progress to scan line position
  const scanLineTop = useTransform(smoothProgress, [0, 1], ['0%', '100%'])

  return (
    <div
      ref={containerRef}
      className="relative pt-0 pb-4 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900"
    >
      {/* Scanner Surface */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto px-4">
        {/* Scanner frame */}
        <div
          className="relative bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-xl sm:shadow-2xl overflow-hidden"
          style={{
            aspectRatio: '1.6 / 1',
            perspective: '1000px',
          }}
        >
          {/* Scanner surface with subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Scan line effect - using motion.div */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"
            style={{
              top: scanLineTop,
              boxShadow: '0 0 20px 5px rgba(249, 115, 22, 0.4)',
            }}
          />

          {/* ID Card - using motion.div */}
          <motion.div
            className="absolute inset-3 sm:inset-4 flex items-center justify-center will-change-transform"
            style={{
              y: idTranslateY,
            }}
          >
            {/* Arizona Sample Driver License */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sample-id-arizona.jpg"
              alt="Sample Arizona Driver License"
              className="w-full max-w-[280px] sm:max-w-sm rounded-md sm:rounded-lg shadow-lg sm:shadow-xl"
              style={{
                aspectRatio: '1.586 / 1',
              }}
            />
          </motion.div>

          {/* Corner markers - scanning frame */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-t-2 border-orange-500" />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-t-2 border-orange-500" />
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-b-2 border-orange-500" />
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-b-2 border-orange-500" />
        </div>

        {/* Scanner label */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            Scroll to scan your ID
          </p>
          <div className="mt-1.5 sm:mt-2 flex justify-center gap-1">
            <span className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
