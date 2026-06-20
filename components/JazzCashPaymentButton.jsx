'use client';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';

export default function JazzCashPaymentButton({ address }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, getCartAmount, products } = useAppContext();

  const handleCheckoutRedirection = async () => {
    if (!address || address.trim() === "") {
      toast.error("Please supply a valid delivery destination shipping address.");
      return;
    }

    // Format your cartItems object dictionary state matching your Order schema items arrays format configuration criteria
    const orderItemsList = Object.entries(cartItems)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({
        product: productId,
        quantity: qty
      }));

    if (orderItemsList.length === 0) {
      toast.error("Your shopping cart layout appears completely empty.");
      return;
    }

    setIsProcessing(true);
    const totalPayableAmount = getCartAmount();

    try {
      // Direct call out to protected internal Next.js initiation api endpoints route handlers
      const response = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItemsList,
          amount: totalPayableAmount,
          address: address,
          paymentMethod: 'jazzcash'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.loading("Redirecting out securely onto JazzCash portal services...");
        
        // Dynamically append temporary form elements directly inside raw DOM structures to force redirection pathing execution updates
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.gatewayUrl;

        Object.entries(data.fields).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit(); // Dispatches customer dashboard viewport out into hosted gateway verification platforms
      } else {
        toast.error(`Initiation pipeline error track criteria: ${data.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment pipeline error execution trace tracking block:", error);
      toast.error("System exception error context mismatch occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCheckoutRedirection}
      disabled={isProcessing}
      className={`w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-150 transform active:scale-95 ${
        isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
      }`}
    >
      {isProcessing ? 'Configuring Secure Gateway Tunnel...' : 'Pay Securely via JazzCash Mobile Account'}
    </button>
  );
}
