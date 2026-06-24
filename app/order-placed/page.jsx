'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'

const OrderPlaced = () => {
  const { router } = useAppContext()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/my-orders')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div>
      <div className='h-screen flex flex-col justify-center items-center gap-5'>
        <div className="flex justify-center items-center relative">
          <Image className="absolute p-5" src={assets.checkmark} alt="Success" />
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
        </div>

        <div className="text-center text-2xl font-semibold">
          Order Placed Successfully
        </div>

        <span className="flex space-x-2">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
        </span>
      </div>
    </div>
  )
}

export default OrderPlaced