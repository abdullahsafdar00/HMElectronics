'use client';
import { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function ClearCartHandler({ paymentStatus }) {
  const { clearCartState } = useAppContext();
  const duplicateLock = useRef(false);

  useEffect(() => {
    // Safely fire cleanups once completion is confirmed inside MongoDB variables properties metadata blocks
    if (paymentStatus === 'completed' && !duplicateLock.current) {
      duplicateLock.current = true;
      clearCartState();
    }
  }, [paymentStatus]);

  return null;
}
