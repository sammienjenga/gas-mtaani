import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../api.jsx";
import { Package, ShoppingCart, Users, Edit3, Trash2, Search, Loader2, Zap, ZapOff, Clock } from "lucide-react";
import toast from "react-hot-toast";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ inventory: 0, customers: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  
  const [dealInputs, setDealInputs] = useState({}); 

  const token = sessionStorage.getItem("gas_token");
  // UPDATED: Using environment variable for URLs
  const BACKEND_URL = API_BASE_URL;

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const fetchDashboardData = async () => {
    try {
      const headers = { "Authorization": `Token ${token}` };
      const [prodRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/products/`, { headers }),
        fetch(`${BACKEND_URL}/dashboard-stats/`, { headers })
      ]);
      
      const products = await prodRes.json();
      const dashboardStats = await statsRes.json();
      
      if (products.daily_deals && products.catalog) {
        setInventory([...products.daily_deals, ...products.catalog]);
      } else {
        setInventory(Array.isArray(products) ? products : []);
      }
      
      setStats(dashboardStats);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      toast.error("DATABASE CONNECTION LOST", { icon: null });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 20000);
        return () => clearInterval(interval);
    }
  }, [user]);

  const handleUpdateProduct = async (id, payload) => {
    try {
      const response = await fetch(`${BACKEND_URL}/products/${id}/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Token ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error();
      
      const updatedProduct = await response.json();
      
      setInventory(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      if (payload.is_deal === false) {
          toast.success("DEAL DEACTIVATED", { icon: null });
      } else if (payload.is_deal === true) {
          toast.success("DEAL SCHEDULED", { icon: null });
          setDealInputs(prev => ({...prev, [id]: { price: "", startTime: "", endTime: "" }}));
      } else {
          toast.success("PRODUCT UPDATED", { icon: null });
      }
    } catch (error) {
      toast.error("FAILED TO UPDATE", { icon: null });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`PERMANENTLY DELETE ${name.toUpperCase()}?`)) return;
    try {
      const response = await fetch(`${BACKEND_URL}/products/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
      });
      if (!response.ok) throw new Error();
      setInventory(inventory.filter(p => p.id !== id));
      toast.success("PRODUCT REMOVED", { icon: null });
    } catch (error) {
      toast.error("FAILED TO DELETE", { icon: null });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto bg-[#0f172a] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="mb-10 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="w-full md:w-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            ADMIN <span className="text-blue-500">CONTROL</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic">
            Secure Database Sync / Daily Deal Management
          </p>
        </div>
        <button 
          onClick={() => navigate("/admin/add-product")}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-900/20"
        >
          + Add New Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 md:mb-12">
        <StatCard label="Live Inventory" value={stats.inventory} color="bg-blue-600" icon={<Package />} />
        <StatCard label="Active Orders" value={stats.orders} color="bg-slate-800 border border-slate-700" icon={<ShoppingCart />} />
        <StatCard label="Verified Customers" value={stats.customers} color="bg-slate-800 border border-slate-700" icon={<Users />} />
      </div>

      {/* Table Section */}
      <div className="bg-[#1e293b] rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-6">
          <h3 className="font-black text-white italic uppercase tracking-tighter text-lg md:text-xl underline underline-offset-8 decoration-blue-500">Inventory Management</h3>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="FILTER PRODUCTS..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-white outline-none focus:border-blue-500 placeholder:text-slate-700"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 md:px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Detail</th>
                <th className="px-6 md:px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Set Deal (Price | From | To)</th>
                <th className="px-6 md:px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 md:px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {inventory
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((p) => {
                const getImageUrl = (path) => {
                    if (!path) return "/placeholder-gas.png";
                    if (path.startsWith("http")) return path;
                    // Fix for Django Media URL
                    const baseMedia = BACKEND_URL.replace('/api', '');
                    return `${baseMedia}${path.startsWith("/") ? "" : "/"}${path}`;
                };

                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 md:px-8 py-6 flex items-center gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0">
                        <img src={getImageUrl(p.image)} className="w-full h-full object-contain p-1" alt={p.name} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-white uppercase italic tracking-tight text-xs md:text-sm block truncate">{p.name}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${p.is_deal_active ? 'text-slate-500 line-through' : 'text-blue-500'}`}>
                          KES {parseFloat(p.price).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 md:px-8 py-6">
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <input 
                              type="number" 
                              placeholder="PRICE" 
                              className="w-16 sm:w-20 bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-1 text-center text-emerald-500 text-[10px] font-black outline-none focus:border-emerald-500/50"
                              value={dealInputs[p.id]?.price || ""}
                              onChange={(e) => setDealInputs({...dealInputs, [p.id]: {...dealInputs[p.id], price: e.target.value}})}
                          />
                          
                          <div className="flex flex-col">
                            <span className="text-[7px] text-slate-600 font-black uppercase mb-1 text-center">From</span>
                            <select 
                                className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-1 text-white text-[10px] font-black outline-none focus:border-blue-500 appearance-none text-center cursor-pointer min-w-[65px]"
                                value={dealInputs[p.id]?.startTime || ""}
                                onChange={(e) => setDealInputs({...dealInputs, [p.id]: {...dealInputs[p.id], startTime: e.target.value}})}
                            >
                                <option value="">--:--</option>
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>

                          <span className="text-slate-700 font-black text-[10px] mt-4 hidden sm:inline">➔</span>

                          <div className="flex flex-col">
                            <span className="text-[7px] text-slate-600 font-black uppercase mb-1 text-center">To</span>
                            <select 
                                className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-1 text-white text-[10px] font-black outline-none focus:border-blue-500 appearance-none text-center cursor-pointer min-w-[65px]"
                                value={dealInputs[p.id]?.endTime || ""}
                                onChange={(e) => setDealInputs({...dealInputs, [p.id]: {...dealInputs[p.id], endTime: e.target.value}})}
                            >
                                <option value="">--:--</option>
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>

                          <button 
                              onClick={() => handleUpdateProduct(p.id, { 
                                  deal_price: parseFloat(dealInputs[p.id]?.price),
                                  deal_start_time: dealInputs[p.id]?.startTime,
                                  deal_end_time: dealInputs[p.id]?.endTime,
                                  is_deal: true 
                              })}
                              disabled={!dealInputs[p.id]?.price || !dealInputs[p.id]?.startTime || !dealInputs[p.id]?.endTime}
                              className="p-2.5 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition disabled:opacity-20 mt-4"
                          >
                              <Clock size={14} />
                          </button>
                      </div>
                    </td>

                    <td className="px-6 md:px-8 py-6 text-center">
                      <button 
                        onClick={() => handleUpdateProduct(p.id, { is_deal: !p.is_deal_active })}
                        className={`px-3 md:px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-tighter flex items-center gap-2 mx-auto transition-all ${
                          p.is_deal_active 
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                          : "bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        {p.is_deal_active ? <Zap size={12} fill="white"/> : <ZapOff size={12}/>}
                        {p.is_deal_active ? "Live" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 md:px-8 py-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => navigate(`/admin/edit-product/${p.id}`)} className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:text-blue-500 border border-slate-800 transition">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2.5 bg-slate-900 rounded-xl text-slate-400 hover:text-red-500 border border-slate-800 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {inventory.length === 0 && !loading && (
             <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">
                No items in database
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-[#1e293b] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 flex items-center gap-5 md:gap-6 shadow-xl">
    <div className={`${color} text-white p-3 md:p-4 rounded-2xl shadow-inner flex-shrink-0`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic truncate">{label}</p>
      <p className="text-3xl md:text-4xl font-black text-white italic tracking-tighter leading-none">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;