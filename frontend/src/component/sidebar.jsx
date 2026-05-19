import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, ClipboardList, User as UserIcon, LogOut, Settings, X, ShieldCheck } from "lucide-react";

function Sidebar({ user, logout, isOpen, closeSidebar }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const firstName = user?.name ? user.name.split(" ")[0].toUpperCase() : "USER";

  const adminLinks = [
    { name: "Control Room", path: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Order Registry", path: "/admin/orders", icon: <ClipboardList size={18} /> },  
  ];

  const buyerLinks = [
    { name: "Gas Catalog", path: "/products", icon: <ShoppingBag size={18} /> },
    { name: "History", path: "/my-orders", icon: <ClipboardList size={18} /> },
    { name: "Profile Settings", path: "/profile", icon: <Settings size={18} /> },
  ];

  const menuItems = user?.role === "admin" ? adminLinks : buyerLinks;

  return (
    <>
      {/* 1. Backdrop - Industrial Blur (Responsive Z-Index) */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} 
        onClick={closeSidebar} 
      />

      {/* 2. Sidebar Panel - Slate-900 Theme */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] sm:w-72 bg-[#1e293b] z-[110] shadow-[10px_0_40px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-in-out flex flex-col border-r border-slate-800 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Header: Exit Control */}
        <div className="p-4 flex items-center justify-end">
            <button 
              onClick={closeSidebar} 
              className="p-2.5 bg-slate-900/50 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-all border border-slate-800 active:scale-90"
            >
              <X size={20} />
            </button>
        </div>

        {/* User Identity Section */}
        <div className="px-8 pb-8 pt-4 flex flex-col items-center text-center border-b border-slate-800/50 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-blue-500 border-2 border-slate-800 mb-4 shadow-2xl relative group">
            <UserIcon size={32} />
            {user?.role === "admin" && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-lg border-2 border-[#1e293b]">
                <ShieldCheck size={12} className="text-white" />
              </div>
            )}
          </div>
          
          <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">
            {user?.role === "admin" ? "Systems Administrator" : "Authenticated Client"}
          </p>
          <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter leading-none">
            {firstName}
          </h2>
        </div>

        {/* Navigation Registry - Scrollable if items overflow */}
        <nav className="flex-grow px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={closeSidebar} 
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all border ${
                isActive(item.path) 
                  ? "bg-blue-600/10 text-blue-500 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                  : "text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <span className={isActive(item.path) ? "text-blue-500" : "text-slate-600"}>
                {item.icon}
              </span> 
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Footer Action */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/20">
          <button 
            onClick={() => {
              closeSidebar();
              logout();
            }} 
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-red-500 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-950/20"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;