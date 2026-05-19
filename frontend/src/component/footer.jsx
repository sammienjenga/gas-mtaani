import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Flame, Phone, ShieldCheck, ChevronUp } from "lucide-react";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    /* Reduced py-8 to py-4 and added a more subtle border */
    <footer className="w-full bg-[#1e293b] text-slate-400 py-4 px-6 md:px-12 border-t border-slate-700/50 sticky bottom-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Compact Brand & Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={scrollToTop}>
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-105">
              <Flame size={14} className="text-white fill-white" />
            </div>
            <h3 className="text-white text-sm font-black italic tracking-tighter uppercase leading-none">
              GAS <span className="text-blue-500">MTAANI</span>
            </h3>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">Systems Nominal</span>
          </div>
        </div>

        {/* Center: Essential Links (Minimal) */}
        <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
          <Link to="/" className="hover:text-blue-500 transition-colors">Logistics</Link>
          <Link to="/profile" className="hover:text-blue-500 transition-colors">Support</Link>
          <span className="hidden md:block text-slate-700">|</span>
          <p className="hidden md:block">© 2026 UNIVERSITY HUB</p>
        </div>

        {/* Right: Interaction Area */}
        <div className="flex items-center gap-5">
          <div className="flex gap-4 pr-5 border-r border-slate-700">
            <Facebook size={14} className="hover:text-blue-500 cursor-pointer transition-colors" />
            <Instagram size={14} className="hover:text-blue-500 cursor-pointer transition-colors" />
            <Twitter size={14} className="hover:text-blue-500 cursor-pointer transition-colors" />
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 bg-slate-800 hover:bg-blue-600 p-2 rounded-lg transition-all"
          >
            <ChevronUp size={14} className="group-hover:text-white transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white hidden lg:block">Top</span>
          </button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;