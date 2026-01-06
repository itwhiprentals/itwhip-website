'use client'

import { motion } from 'framer-motion'
import { IoCheckmarkCircle, IoSparklesOutline } from 'react-icons/io5'

interface BookingCelebrationProps {
  bookingCode: string
  carName: string
  startDate: string
  pickupLocation: string
}

export default function BookingCelebration({
  bookingCode,
  carName,
  startDate,
  pickupLocation
}: BookingCelebrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-8 text-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <IoSparklesOutline className="w-48 h-48 text-blue-600" />
      </div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
      >
        <IoCheckmarkCircle className="w-12 h-12 text-green-600" />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-gray-900 mb-2"
      >
        Booking Confirmed!
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-gray-600 mb-4"
      >
        Your adventure with the {carName} begins on {new Date(startDate).toLocaleDateString()}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="inline-block bg-white rounded-lg px-6 py-3 shadow-sm"
      >
        <p className="text-sm text-gray-500 mb-1">Booking Code</p>
        <p className="text-xl font-bold font-mono text-gray-900">{bookingCode}</p>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-gray-600 mt-4"
      >
        📍 Pick-up at {pickupLocation}
      </motion.p>
    </motion.div>
  )
}
