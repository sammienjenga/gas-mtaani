import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { ShoppingCart, Loader2, ShieldCheck, Clock, Zap } from "lucide-react";
import toast from "react-hot-toast";

function ProductCard({ product, onExpiry }) {
  const { user } = useContext(AuthContext); 
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hrs: "00", mins: "00", secs: "00" });

  // UPDATED: Using environment variable for URLs
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // --- TIME VALIDATION LOGIC ---
  const isTimeValid = () => {
    if (!product.deal_end_time) return false;
    const [h, m, s] = product.deal_end_time.split(':');
    const now = new Date();
    const target = new Date();
    target.setHours(parseInt(h), parseInt(m), parseInt(s), 0);
    return target.getTime() > now.getTime();
  };

  const isEffectivelyDeal = product.is_deal && isTimeValid();

  // IMAGE HELPER
  const getImageUrl = (path) => {
    if (!path) return "/placeholder-gas.png";
    if (path.startsWith("http")) return path;
    // Fix for Django Media URL mapping
    const baseMedia = BACKEND_URL.replace('/api', '');
    return `${baseMedia}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // PRICING CALCULATIONS
  const originalPrice = parseFloat(product.price || 0);
  const dealPrice = parseFloat(product.deal_price || 0);
  const discountPercent = originalPrice > 0 && dealPrice > 0 
    ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) 
    : 0;

  // COUNTDOWN LOGIC
  useEffect(() => {
    if (product.is_deal && product.deal_end_time) {
      const timer = setInterval(() => {
        const now = new Date();
        const [hours, minutes, seconds] = product.deal_end_time.split(':');
        const target = new Date();
        target.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);

        const distance = target.getTime() - now.getTime();

        if (distance <= 0) {
          setTimeLeft({ hrs: "00", mins: "00", secs: "00" });
          clearInterval(timer);
          if (onExpiry) onExpiry();
        } else {
          setTimeLeft({
            hrs: Math.floor((distance / (1000 * 60 * 60))).toString().padStart(2, '0'),
            mins: Math.floor((distance / 1000 / 60) % 60).toString().padStart(2, '0'),
            secs: Math.floor((distance / 1000) % 60).toString().padStart(2, '0')
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [product.deal_end_time, product.is_deal, onExpiry]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("LOGIN REQUIRED");
      navigate("/login");
      return;
    }
    
    setIsAdding(true);
    try {
      const activePrice = isEffectivelyDeal ? dealPrice : originalPrice;
      
      await addToCart({
        ...product,
        price: activePrice
      });

      setAddedSuccess(true);
      toast.success(`${product.name.toUpperCase()} ADDED`);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (error) {
      toast.error("FAILED TO ADD");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 border border-slate-800 shadow-xl hover:border-blue-500/50 transition-all group relative flex flex-col h-full w-full font-sans">
      
      {/* Badge */}
      {isEffectivelyDeal && discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[8px] md:text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 italic uppercase animate-bounce shadow-lg shadow-red-900/40">
          <Zap size={10} fill="currentColor" /> {discountPercent}% OFF
        </div>
      )}

      {/* Image Container */}
      <div className="h-32 sm:h-40 md:h-48 mb-4 overflow-hidden rounded-2xl bg-slate-900/50 p-4 flex items-center justify-center border border-slate-800 group-hover:border-blue-500/30 transition-colors">
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 pointer-events-none" 
        />
      </div>

      {/* Info Section */}
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[7px] md:text-[8px] font-black text-blue-500 border border-blue-500/20 uppercase px-2 py-0.5 rounded-md tracking-widest">
            {product.brand || "INDUSTRIAL"}
          </span>
          <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">
            {product.weight || "13KG"}
          </span>
        </div>
        
        <h3 className="font-black text-white italic uppercase tracking-tighter text-sm md:text-base mb-3 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-slate-500 text-[8px] md:text-[10px] font-black">KES</span>
            <p className="text-blue-500 font-black text-xl md:text-2xl italic tracking-tighter leading-none">
              {(isEffectivelyDeal ? dealPrice : originalPrice).toLocaleString()}
            </p>
          </div>
          {isEffectivelyDeal && (
            <span className="text-slate-600 line-through text-[10px] md:text-xs font-bold decoration-red-500/40">
              {originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Timer */}
        {isEffectivelyDeal && (
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1.5 rounded-xl mb-5 w-fit">
            <Clock size={12} className="text-orange-500 animate-pulse flex-shrink-0" />
            <span className="text-orange-500 font-black text-[8px] sm:text-[9px] uppercase tracking-widest whitespace-nowrap">
              Ends In: {timeLeft.hrs}:{timeLeft.mins}:{timeLeft.secs}
            </span>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`mt-auto w-full py-3 md:py-4 rounded-xl font-black text-[8px] md:text-[9px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 border shadow-lg ${
            addedSuccess 
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-emerald-900/10" 
              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-slate-800 shadow-black/40"
          }`}
        >
          {isAdding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : addedSuccess ? (
            <><ShieldCheck size={14} /> SECURED</>
          ) : (
            <><ShoppingCart size={14} /> ADD TO CART</>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;