'use client'

import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import JazzCashPaymentButton from "@/components/JazzCashPaymentButton";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { SignInButton } from '@clerk/nextjs';

const COURIERS = [
    { name: "TCS Express Courier", value: "tcs" }, // Matches your real courierServices backend key
  { name: "M&P", value: "mnp" },
  { name: "Trax", value: "trax" },
  { name: "Leopard", value: "leopard" },
];

const OrderSummary = () => {


  const { currency, router, getCartCount, getCartAmount, getToken, user, setCartItems, cartItems } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState("")
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [autoSuggestedCourier, setAutoSuggestedCourier] = useState(null);
  // Add this next to your other useState hooks
const [paymentMethod, setPaymentMethod] = useState("cod"); // Toggle state options: 'cod' or 'jazzcash'
  const [userAddresses, setUserAddresses] = useState([]);

  const fetchUserAddresses = async () => {
    const token = await getToken();
    try {

      const { data } = await axios.get('/api/user/get-address', {headers: { Authorization: `Bearer ${token}`}})
    if(data.success) {
      setUserAddresses(data.addresses)
      if(data.addresses.length > 0) {
        setSelectedAddress(data.addresses[0])
      }
    }  else {
      toast.error(data.message)
    }
    
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  // Auto-suggest best courier based on city location criteria
useEffect(() => {
  if (selectedAddress) {
    const city = selectedAddress.city?.toLowerCase() || "";
    if (city.includes("karachi")) setAutoSuggestedCourier("mnp");
    else if (city.includes("lahore")) setAutoSuggestedCourier("leopard");
    else setAutoSuggestedCourier("tcs"); // Automatically recommends real TCS config for other regions
  }
}, [selectedAddress]);


  const createOrder = async () => {
    setStatus("loading")
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address")
      }
      if (!selectedCourier) {
        return toast.error("Please select a courier service")
      }

      let cartItemsArray = Object.keys(cartItems).map((key)=>({product: key, quantity: cartItems[key]}))

      cartItemsArray = cartItemsArray.filter(item => item.quantity > 0)

      if (cartItemsArray.length === 0) {
        return toast.error("Cart is empty")
      } 

      const token = await getToken();
      

      const { data } = await axios.post('/api/order/create', {address: selectedAddress._id, items: cartItemsArray, courierName: selectedCourier}, {headers: {Authorization: `Bearer ${token}`}})

      if (data.success) {
        toast.success(data.message)
        setCartItems({})
        router.push('/order-placed')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user])

  return (
    <motion.div  initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <>
      { !user ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <p className="text-gray-700 text-center text-base">To place your order, please sign in with Google. This helps us keep your orders secure and lets you track your purchases easily.</p>
          <SignInButton mode="modal" provider="google">
            <button className="w-full bg-orange-600 h-12 text-white py-3 mt-2 hover:bg-orange-700 rounded-md text-lg font-medium">Continue with Google</button>
          </SignInButton>
        </div>
      ) : (
      <>
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>
        {/* Courier Selection */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Courier Service
          </label>
          <div className="relative inline-block w-full text-sm border">
            <select
              className="w-full px-4 py-2 bg-white text-gray-700 focus:outline-none"
              value={selectedCourier || autoSuggestedCourier || ""}
              onChange={e => setSelectedCourier(e.target.value)}
            >
              <option value="" disabled>Select a courier</option>
              {COURIERS.map(courier => (
                <option key={courier.value} value={courier.value}>{courier.name}{autoSuggestedCourier === courier.value ? " (Recommended)" : ""}</option>
              ))}
            </select>
          </div>
        </div>

       {/* PLACE THIS DIRECTLY UNDERNEATH COURIER SELECTION CONTAINER DIV */}
<div>
  <label className="text-base font-medium uppercase text-gray-600 block mb-2">
    Payment Method
  </label>
  <div className="grid grid-cols-2 gap-3 text-sm">
    <button
      type="button"
      onClick={() => setPaymentMethod("cod")}
      className={`p-3 border rounded-md font-medium transition-all flex flex-col items-center justify-center gap-1 bg-white ${
        paymentMethod === "cod" 
          ? "border-orange-600 text-orange-600 ring-1 ring-orange-600" 
          : "border-gray-200 text-gray-500 hover:bg-gray-50"
      }`}
    >
      <span className="text-base">💵 COD</span>
      <span className="text-[10px] font-normal text-gray-400">Cash on Delivery</span>
    </button>

    <button
      type="button"
      onClick={() => setPaymentMethod("jazzcash")}
      className={`p-3 border rounded-md font-medium transition-all flex flex-col items-center justify-center gap-1 bg-white ${
        paymentMethod === "jazzcash" 
          ? "border-red-600 text-red-600 ring-1 ring-red-600" 
          : "border-gray-200 text-gray-500 hover:bg-gray-50"
      }`}
    >
      <span className="text-base font-bold text-red-600">🔴 JazzCash</span>
      <span className="text-[10px] font-normal text-gray-400">Secure Online Pay</span>
    </button>
  </div>
</div>


        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{getCartAmount()}</p>
          </div>
          
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">{currency}250</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{getCartAmount() ? `${currency}${getCartAmount() + 250}`: 0}</p>
          </div>
        </div>
      </div>

          {/* REPLACE YOUR ORIGINAL PLACE ORDER SUBMIT BUTTON WITH THIS BLOCK */}
<div className="mt-5">
  {paymentMethod === "jazzcash" ? (
    <JazzCashPaymentButton 
      address={selectedAddress ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}` : ""} 
      courierName={selectedCourier || autoSuggestedCourier || ""}
    />
  ) : (
    <button
      type="button"
      onClick={createOrder}
      disabled={status === "loading"}
      className="w-full bg-orange-600 h-12 text-white py-3 hover:bg-orange-700 transition-colors font-medium text-center flex items-center justify-center"
    >
      {status === "loading" ? (
        <span className="flex items-center justify-center space-x-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
        </span>
      ) : (
        "Place COD Order"
      )}
    </button>
  )}
</div>

      </>
       )}
      </>
    </motion.div>
  );
};

export default OrderSummary;