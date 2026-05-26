import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Truck, Eye, Loader2, Package, Search } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";

function AdminOrders() {
  const [orders, setOrders] = useState([]); 
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("gas_token");

  // UPDATED: Using environment variable for the backend URL
  const API_BASE = API_BASE_URL;

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/`, {
        headers: {
          "Authorization": `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error("SYNC FAILED");
      
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("COULD NOT SYNC WITH DATABASE", { icon: null });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const updatePromise = async () => {
      const response = await fetch(`${API_BASE}/orders/${id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("UPDATE FAILED");
      
      setOrders(prev => prev.map(order => {
        const orderId = order.id || order._id;
        return orderId === id ? { ...order, status: newStatus } : order;
      }));
      
      return response.json();
    };

    toast.promise(updatePromise(), {
      loading: 'UPDATING ORDER STATUS...',
      success: `STATUS SET TO ${newStatus.toUpperCase()}`,
      error: 'FAILED TO UPDATE ORDER STATUS',
    }, {
      success: { icon: null },
      error: { icon: null },
      loading: { icon: null }
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "Out for Delivery": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "Pending": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={40} />
        <p className="font-black text-slate-500 uppercase tracking-[0.3em] text-[10px] italic">Accessing Secure Records...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 md:mb-14">
          <div className="w-full lg:w-auto">
            <Link to="/admin" className="text-blue-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 hover:underline italic">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none break-words">
              Order <span className="text-blue-500">Management</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Logistics Control Center / MongoDB</p>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["All", "Pending", "Out for Delivery", "Delivered"].map((s) => (
              <button 
                key={s}
                onClick={() => {
                  setFilter(s);
                  toast.success(`FILTER: ${s.toUpperCase()}`, { duration: 1000, icon: null });
                }}
                className={`flex-1 lg:flex-none whitespace-nowrap px-4 sm:px-6 py-3 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === s ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-[#1e293b] rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 md:px-10 py-6 md:py-7 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Ref ID</th>
                  <th className="px-6 md:px-10 py-6 md:py-7 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Manifest & Billing</th>
                  <th className="px-6 md:px-10 py-6 md:py-7 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Logistics Status</th>
                  <th className="px-6 md:px-10 py-6 md:py-7 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-center">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {orders.filter(o => filter === "All" || o.status === filter).map((order) => {
                  const orderId = order.id || order._id;
                  const items = order.items || order.items_snapshot || [];

                  return (
                    <tr key={orderId} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 group-hover:border-blue-500/50 transition-colors">
                            <Package size={16} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-black text-white text-xs sm:text-sm italic tracking-tight uppercase">
                              ORD-{orderId.toString().slice(-6)}
                            </p>
                            <p className="text-[9px] font-bold text-blue-500/70 uppercase tracking-tighter">
                              {order.user_name || order.user?.username || "CLIENT"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <p className="text-[11px] font-bold text-slate-300 uppercase leading-relaxed max-w-[280px]">
                          {items.map(item => `${item.quantity || item.qty}x ${item.product_name || item.name || 'Product'}`).join(", ") || "MANIFEST EMPTY"}
                        </p>
                        <p className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest italic">
                          KES {parseFloat(order.total_price || order.total_amount || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <span className={`px-4 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex justify-center gap-2 md:gap-3">
                          {order.status === "Pending" && (
                            <button 
                              onClick={() => updateStatus(orderId, "Out for Delivery")}
                              className="bg-blue-600 text-white p-2.5 sm:p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 active:scale-90"
                              title="Dispatch Order"
                            >
                              <Truck size={16} />
                            </button>
                          )}
                          {order.status === "Out for Delivery" && (
                            <button 
                              onClick={() => updateStatus(orderId, "Delivered")}
                              className="bg-green-600 text-white p-2.5 sm:p-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-900/20 active:scale-90"
                              title="Confirm Delivery"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button 
                            className="bg-slate-900 text-slate-400 p-2.5 sm:p-3 rounded-xl hover:text-white hover:bg-slate-800 transition border border-slate-800"
                            onClick={() => toast.success(`OPENING REF: ${orderId}`, { icon: null })}
                          >
                            <Search size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {orders.filter(o => filter === "All" || o.status === filter).length === 0 && !loading && (
              <div className="p-20 md:p-32 text-center">
                <Package size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
                <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] italic">
                  No logistics data available for this segment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;