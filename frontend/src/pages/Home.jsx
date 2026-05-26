import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../component/ProductCard.jsx";
import { Clock, Flashlight, ShieldCheck, Truck, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";


function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalTimeLeft, setGlobalTimeLeft] = useState({ hrs: "00", mins: "00", secs: "00" });

  // UPDATED: Using environment variable for the backend URL
  const BACKEND_URL = API_BASE_URL;

  // --- 1. HELPER LOGIC ---
  const isDealActive = useCallback((endTime) => {
    if (!endTime) return false;
    const [h, m, s] = endTime.split(':');
    const now = new Date();
    const target = new Date();
    target.setHours(parseInt(h), parseInt(m), parseInt(s), 0);
    return target.getTime() > now.getTime();
  }, []);

  // --- 2. FILTERED DATA (Memoized to prevent infinite loops) ---
  const dealProducts = useMemo(() => 
    products.filter(p => p.is_deal && isDealActive(p.deal_end_time)),
    [products, isDealActive]
  );

  const catalogProducts = useMemo(() => 
    products.filter(p => !p.is_deal || (p.is_deal && !isDealActive(p.deal_end_time))),
    [products, isDealActive]
  );

  // --- 3. DATA FETCHING ---
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/products/`);
      if (!response.ok) throw new Error("CATALOG SYNC FAILED");
      const data = await response.json();
      
      setProducts(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("DATABASE CONNECTION ERROR", { icon: null });
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 4. TIMER EFFECT ---
  useEffect(() => {
    if (dealProducts.length === 0) {
      setGlobalTimeLeft({ hrs: "00", mins: "00", secs: "00" });
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      
      const expiryTimestamps = dealProducts
        .map(p => {
          const [h, m, s] = p.deal_end_time.split(':');
          const target = new Date();
          target.setHours(parseInt(h), parseInt(m), parseInt(s), 0);
          return target.getTime();
        })
        .filter(time => time > now.getTime());

      if (expiryTimestamps.length > 0) {
        const soonestExpiry = Math.min(...expiryTimestamps);
        const diff = soonestExpiry - now.getTime();

        setGlobalTimeLeft(prev => {
          const newTime = {
            hrs: Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0'),
            mins: Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0'),
            secs: Math.floor((diff / 1000) % 60).toString().padStart(2, '0')
          };
          if (prev.hrs === newTime.hrs && prev.mins === newTime.mins && prev.secs === newTime.secs) return prev;
          return newTime;
        });
      } else {
        setGlobalTimeLeft({ hrs: "00", mins: "00", secs: "00" });
        fetchProducts(); 
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dealProducts.length, fetchProducts]);

  return (
    <div className="bg-[#0f172a] min-h-screen pb-20 overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="max-w-7xl mx-auto py-16 md:py-24 px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left md:w-1/2 w-full">
            <span className="bg-white text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block shadow-lg">
              University Partner
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 italic tracking-tighter leading-[1.1]">
              FAST GAS <br /> <span className="text-blue-200">DELIVERY</span>
            </h1>
            <p className="text-blue-100 max-w-md text-base sm:text-lg font-medium mb-8 mx-auto md:mx-0 leading-relaxed">
              Safe, reliable, and affordable kitchen energy solutions around Karatina University.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link to="/products" className="w-full sm:w-auto bg-white text-blue-700 px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition shadow-xl active:scale-95 text-center">
                Shop Catalog
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex md:w-1/3 justify-end">
            <div className="bg-blue-600/30 p-10 lg:p-12 rounded-[3rem] border-2 border-blue-400/30 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                <Truck size={140} className="text-white opacity-10 absolute -right-6 -bottom-6 rotate-12 group-hover:translate-x-2 transition-transform" />
                <div className="relative z-10">
                    <p className="text-white font-black italic text-4xl lg:text-5xl leading-tight">ORDER NOW <br/> GET IT IN <br/> 30 MINS</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VALUE PROPS */}
      <div className="bg-slate-900 border-b border-slate-800 py-6 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto px-6 flex md:grid md:grid-cols-4 gap-10 md:gap-4 min-w-max md:min-w-0">
          {[
            { icon: <Zap size={18}/>, text: "Instant Refill" },
            { icon: <ShieldCheck size={18}/>, text: "Safety Certified" },
            { icon: <Truck size={18}/>, text: "Free Delivery" },
            { icon: <Clock size={18}/>, text: "24/7 Support" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 justify-center md:border-r border-slate-800 last:border-none px-4">
              <span className="text-blue-500">{item.icon}</span>
              <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mt-8 md:mt-12">
        
        {/* 3. FLASH SALE SECTION */}
        {dealProducts.length > 0 && (
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl mb-12 md:mb-20 border-4 border-red-600/10">
            <div className="bg-red-600 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                  <Flashlight size={24} fill="white" className="animate-pulse" /> FLASH SALE
                </h2>
                
                <div className="flex gap-2 bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm">
                  <span className="bg-black text-white px-2.5 py-1 rounded font-mono text-base font-bold">{globalTimeLeft.hrs}</span>
                  <span className="text-white font-bold">:</span>
                  <span className="bg-black text-white px-2.5 py-1 rounded font-mono text-base font-bold">{globalTimeLeft.mins}</span>
                  <span className="text-white font-bold">:</span>
                  <span className="bg-black text-white px-2.5 py-1 rounded font-mono text-base font-bold">{globalTimeLeft.secs}</span>
                </div>
              </div>
              <Link to="/products" className="text-white font-black text-[10px] uppercase tracking-widest border-b-2 border-white/40 hover:border-white transition pb-1">
                View All Deals
              </Link>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>)
              ) : (
                dealProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onExpiry={fetchProducts} 
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. MAIN INVENTORY GRID */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              GAS <span className="text-blue-500">INVENTORY</span>
            </h2>
            <div className="h-1.5 w-24 md:w-32 bg-blue-600 mt-4 rounded-full"></div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
            {loading ? "SEARCHING..." : `${catalogProducts.length} CYLINDERS AVAILABLE`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-80 bg-slate-900/50 animate-pulse rounded-[2rem] border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {catalogProducts.length > 0 ? (
              catalogProducts.map((product) => (
                <div key={product.id} className="group transform hover:scale-[1.03] md:hover:-translate-y-2 transition-all duration-300">
                  <ProductCard product={product} onExpiry={fetchProducts} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 md:py-32 bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800">
                <p className="text-slate-600 font-black uppercase italic tracking-[0.3em] px-6">
                  No standard inventory available at this moment
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;