'use client'
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const {user} = useUser();
    const { getToken } = useAuth();



    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

      const clearCartState = async () => {
        try {
            setCartItems({}); // Zero it out in frontend state instantly
            
            if (user) {
                const token = await getToken();
                // Send an empty object to your existing endpoint to clear it out on the database side
                await axios.post('/api/cart/update', { cartData: {} }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Order processed! Cart cleared.");
            }
        } catch (error) {
            console.error("Error clearing transaction cart:", error);
            toast.error("Could not sync empty basket state.");
        }
    }

    const fetchProductData = async () => {
        try {

            const { data } = await axios.get('/api/product/list') 

            if(data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUserData = async () => {
        try {
            if(user?.publicMetadata?.role === 'seller') {
            setIsSeller(true)
        }
        const token = await getToken();
        const { data } = await axios.get('/api/user/data', {headers: {Authorization: `Bearer ${token}` }})

        if(data.success) {
            setUserData(data.user)
            setCartItems(data.user.cartItems)
        } else {
            toast.error(data.message)
        }
        } catch (error) {
            
            toast.error(error.message)
        }
    }

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        
        if (user) {
            try {
                const token = await getToken();
                await axios.post('/api/cart/update', { cartData }, {headers: { Authorization: `Bearer ${token}`}})
                toast.success("Product added to cart")
            } catch (error) {
                toast.error(error.message);
            }
        }

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)
           if (user) {
            try {
                const token = await getToken();
                await axios.post('/api/cart/update', { cartData }, {headers: { Authorization: `Bearer ${token}`}})
                toast.success("Cart Updated")
            } catch (error) {
                toast.error(error.message);
            }
        }


    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (!itemInfo) continue;
            if (cartItems[items] > 0) {
                if (itemInfo.offerPrice) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
                } else {
                    totalAmount += itemInfo.price * cartItems[items];
                }
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if(user) {
            fetchUserData()
        }
    }, [ user ])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        clearCartState
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}