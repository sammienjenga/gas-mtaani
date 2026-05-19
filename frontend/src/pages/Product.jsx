import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductCard from "../component/ProductCard.jsx";
import toast from "react-hot-toast";

function Product() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 1. Fetch all products from Django - UPDATED with .env
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/`);
      if (!response.ok) throw new Error("Failed to connect to server");
      
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching database products:", error);
      // CLEAN TOAST: NO ICON NO EMOJI
      toast.error("DATABASE CONNECTION LOST CHECK YOUR SERVER", { icon: null }); 
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handle Search Query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search");
    setSearchTerm(query || "");
  }, [location.search]);

  // 3. Filter Logic
  const filteredProducts = products.filter((p) => {
    const name = p?.name?.toLowerCase() || "";
    const brand = p?.brand?.toLowerCase() || ""; 
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || brand.includes(search);
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-white italic uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm">
          LOADING CATALOG
        </p>
        <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-2">
          SYNCING WITH HUB
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0f172a] min-h-screen p-4 sm:p-6 md:p-12 text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {filteredProducts.length > 0 ? (
          <>
            {/* Header Section: Responsive layout changes from column to row */}
            <div className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-6 sm:pb-8">
              <div className="max-w-full">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none break-words">
                  {searchTerm ? `SEARCH: ${searchTerm}` : "GAS CATALOG"}
                </h1>
                <p className="text-blue-500 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-3 italic">
                  Karatina University Official Partner
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                <span className="w-full md:w-auto text-center bg-blue-600/10 text-blue-500 px-4 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-blue-600/20 shadow-lg shadow-blue-900/10">
                  {filteredProducts.length} PRODUCTS AVAILABLE
                </span>
              </div>
            </div>

            {/* Grid Section: Responsive columns 1 -> 2 -> 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((p) => (
                <div key={p.id} className="transform hover:scale-[1.02] md:hover:-translate-y-2 transition-all duration-300">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State: Responsive padding and sizing */
          <div className="max-w-md sm:max-w-lg mx-auto py-16 sm:py-24 text-center">
            <div className="bg-[#1e293b] p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-800">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-slate-700 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black text-blue-500 italic">?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic mb-3 tracking-tighter">
                NO MATCH FOUND
              </h2>
              <p className="text-slate-500 mb-8 sm:mb-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-relaxed">
                We couldn't find any gas products matching <br className="hidden sm:block"/>
                <span className="text-blue-500 font-black italic underline decoration-2 underline-offset-4">"{searchTerm}"</span>
              </p>

              <div className="flex flex-col gap-4">
                <Link to="/" className="bg-blue-600 text-white py-4 sm:py-5 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 active:scale-95">
                  RETURN TO HOME
                </Link>
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    // CLEAN TOAST: NO ICON NO EMOJI
                    toast.success("SHOWING ALL AVAILABLE GAS", { icon: null }); 
                  }} 
                  className="bg-slate-900 text-slate-400 py-4 sm:py-5 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:text-white border border-slate-800 hover:bg-slate-800 transition active:scale-95"
                >
                  VIEW ALL INVENTORY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;