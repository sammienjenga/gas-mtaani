import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { Trash2, Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";

function Checkout() {
  const { cartItems = [], removeFromCart, updateQuantity, cartTotal = 0, clearCart } = useContext(CartContext) || {};
  const { user = {}, logout } = useContext(AuthContext) || {}; 
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // UPDATED: Using environment variable for the backend URL
const DJANGO_BASE_URL = API_BASE_URL; 

  const handleOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("YOUR BAG IS EMPTY");
      return;
    }

    let token = sessionStorage.getItem("gas_token");
    
    if (token) {
      token = token.replace(/['"]+/g, ''); 
    }
    
    if (!token) {
      toast.error("PLEASE LOGIN FIRST");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        total_price: cartTotal,
        address: user?.location || "Karatina University", 
      };

      const response = await fetch(`${DJANGO_BASE_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`, 
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        console.error("SERVER REJECTED REQUEST:", {
          status: response.status,
          message: errorData
        });

        if (response.status === 401) {
          logout(); 
          toast.error("SESSION EXPIRED. PLEASE LOGIN AGAIN.");
          navigate("/login");
          return;
        }

        throw new Error(errorData.detail || "COULD NOT PROCESS ORDER");
      }

      toast.success("ORDER PLACED SUCCESSFULLY");
      clearCart();
      navigate("/"); 

    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.message || "SERVER CONNECTION ERROR");
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductImage = (item) => {
    const imagePath = item.image_url || item.image;
    if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Using environment variable for local media path
    const baseMedia = DJANGO_BASE_URL.replace('/api', '');
    return `${baseMedia}${cleanPath}`;
  };

  return (
    <div className="bg-[#0f172a] min-h-screen p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              MY <span className="text-blue-500">SHOPPING BAG</span>
            </h2>
            <div className="h-1.5 w-20 bg-blue-600 mt-3 rounded-full"></div>
          </div>
          <Link to="/" className="w-fit flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 transition-colors tracking-widest">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-[#1e293b] p-10 md:p-20 rounded-[2rem] text-center border-2 border-dashed border-slate-800">
                <ShoppingBag size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest italic text-sm">Your bag is empty.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product_id} className="bg-[#1e293b] p-4 sm:p-6 rounded-2xl shadow-xl flex flex-row items-center gap-4 sm:gap-6 border border-slate-800">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                    <img src={getProductImage(item)} className="w-full h-full object-contain" alt={item.name} />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="font-black text-white uppercase text-xs sm:text-sm md:text-lg italic tracking-tight truncate">{item.name}</h3>
                    <p className="text-blue-500 font-black text-[10px] sm:text-xs">KES {item.price?.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-1">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:bg-slate-800 rounded-md transition-colors font-bold">-</button>
                      <span className="w-6 sm:w-8 text-center text-white font-black text-[10px] sm:text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:bg-slate-800 rounded-md transition-colors font-bold">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-slate-500 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#1e293b] p-6 sm:p-8 rounded-[2rem] border border-slate-800 h-fit lg:sticky lg:top-24 shadow-2xl">
              <h3 className="text-xl font-black italic mb-6 text-white uppercase tracking-tighter border-b border-slate-800 pb-4">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end text-slate-500 font-black uppercase text-[10px] tracking-widest">
                  <span>Total Amount</span>
                  <span className="text-2xl text-white font-black italic leading-none">
                    KES {cartTotal?.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-slate-800 w-full mt-4"></div>
                <div className="flex items-center gap-2 justify-center">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    Secure encrypted checkout
                   </p>
                </div>
              </div>
              
              <button 
                onClick={handleOrder} 
                disabled={cartItems.length === 0 || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 sm:py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Processing...</span>
                  </>
                ) : (
                  "PLACE ORDER"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;