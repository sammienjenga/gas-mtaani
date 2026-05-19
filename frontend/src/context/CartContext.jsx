import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from "react"; 
import { AuthContext } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const { user } = useContext(AuthContext);
  
  const isFirstMount = useRef(true);

  // 1. Fetch Cart from Django Backend
  const fetchCart = useCallback(async () => {
    const token = sessionStorage.getItem("gas_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/cart/", {
        headers: { "Authorization": `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Initial Load Effect
  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  // 3. Sync Effect (Debounced) to save cart changes to backend
  useEffect(() => {
    if (isLoading || isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const syncWithBackend = async () => {
      const token = sessionStorage.getItem("gas_token");
      if (!token) return;

      try {
        await fetch("http://localhost:8000/api/cart/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          },
          body: JSON.stringify({ items: cartItems })
        });
      } catch (error) {
        console.error("Sync error:", error);
      }
    };

    const timeoutId = setTimeout(syncWithBackend, 1000); 
    return () => clearTimeout(timeoutId);
  }, [cartItems, isLoading]);

  // 4. Cart Methods
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(item => item.product_id === product.id);
      if (existingIndex > -1) {
        return prevItems.map((item, index) => 
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { 
        product_id: product.id, 
        name: product.name,
        price: product.price,
        image_url: product.image_url || product.image,
        quantity: 1
      }];
    });
    toast.success(`${product.name.toUpperCase()} ADDED`);
  };

  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product_id === productId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cartItems.find(item => item.product_id === productId);
    setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
    if (itemToRemove) {
      toast.error(`${itemToRemove.name.toUpperCase()} REMOVED`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartTotal, 
      isLoading,
      addToCart, 
      fetchCart, 
      updateQuantity, // Consistent CamelCase
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};