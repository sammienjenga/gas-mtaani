import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { Search, ShoppingCart, Home, User as UserIcon, LogIn, UserPlus, X, Menu, Flame, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

function Navbar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      toast.success(`SEARCHING: ${searchTerm.toUpperCase()}`, { icon: null, duration: 2000 });
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <nav className="h-20 md:h-24 bg-[#1e293b]/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 w-full transition-all font-sans">
      
      {/* Brand & Menu Section */}
      <div className={`flex items-center gap-3 sm:gap-6 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        {user && (
          <button 
            onClick={toggleSidebar} 
            className="p-2.5 sm:p-3 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl text-blue-500 transition-all active:scale-90 shadow-2xl"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="bg-blue-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl rotate-6 group-hover:rotate-0 transition-all duration-300 shadow-lg shadow-blue-900/30">
             <Flame size={18} className="sm:text-[22px] text-white" fill="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
              GAS <span className="text-blue-500 text-2xl sm:text-3xl">MTAANI</span>
            </span>
            <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mt-1 italic">
              Energy Logistics
            </span>
          </div>
        </Link>
      </div>

      {/* Search Bar - Responsive Logic */}
      {user ? (
        <>
          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="relative w-full max-w-lg mx-8 hidden lg:block group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH CATALOG OR BRAND..." 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-12 py-4 text-[11px] font-black text-white uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            )}
          </form>

          {/* Mobile Search Overlay */}
          {isMobileSearchOpen && (
            <form onSubmit={handleSearch} className="flex-grow mx-2 md:hidden relative animate-in fade-in slide-in-from-top-1 duration-200">
              <input 
                autoFocus
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH..." 
                className="w-full bg-slate-900 border border-blue-500/50 rounded-xl pl-4 pr-10 py-3 text-[10px] font-black text-white uppercase outline-none"
              />
              <button 
                type="button" 
                onClick={() => setIsMobileSearchOpen(false)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <X size={16} />
              </button>
            </form>
          )}
        </>
      ) : (
        <div className="flex-grow" /> 
      )}

      {/* Action Area */}
      <div className={`flex items-center gap-3 sm:gap-6 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        {user ? (
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile Search Trigger */}
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="lg:hidden p-3 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Search size={22} />
            </button>

            {/* Cart Icon */}
            {user.role !== "admin" && (
              <Link to="/checkout" className="relative p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all group shadow-xl">
                <ShoppingCart size={20} className="sm:size-[22px] group-hover:rotate-12 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border-2 sm:border-4 border-[#1e293b] shadow-xl">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* User Profile */}
            <div 
              className="flex items-center gap-3 sm:gap-4 sm:pl-6 sm:border-l border-slate-800 group cursor-pointer" 
              onClick={() => navigate('/profile')}
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 flex items-center gap-1 ${user.role === 'admin' ? 'text-red-500' : 'text-blue-500'}`}>
                  {user.role === 'admin' && <ShieldAlert size={10} />}
                  {user.role}
                </span>
                <span className="text-xs sm:text-sm font-black text-white italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors">
                  {user.name?.split(" ")[0]}
                </span>
              </div>
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-slate-900 border-2 border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 shadow-2xl group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                <UserIcon size={20} className="sm:size-[24px]" />
              </div>
            </div>
          </div>
        ) : (
          /* Logged Out State */
          <div className="flex items-center gap-3 sm:gap-8">
            <Link to="/" className="text-slate-500 hover:text-blue-500 transition-colors hidden md:block">
              <Home size={22} />
            </Link>
            <Link to="/login" className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 hover:text-white transition-all">
              Login
            </Link>
            <Link to="/signup" className="bg-blue-600 text-white px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 sm:gap-3 active:scale-95">
              <UserPlus size={14} className="sm:size-[16px]" /> <span className="hidden xs:inline">Signup</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;