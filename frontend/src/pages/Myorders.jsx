import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Package, ChevronRight, MapPin, Phone, Clock, Hash, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// --- SUB-COMPONENT: Kilimall Style Progress Tracker ---
const DeliveryStepper = ({ status }) => {
  const steps = ["Pending", "Out for Delivery", "Delivered"];
  const currentStep = steps.indexOf(status);

  return (
    <div className="flex items-center w-full mt-10 mb-8 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${
              index <= currentStep 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40 scale-110" 
                : "bg-slate-900 border-slate-800 text-slate-700"
            }`}>
              {index < currentStep ? <CheckCircle2 size={20} /> : <span className="font-black italic text-sm">{index + 1}</span>}
            </div>
            <span className={`absolute -bottom-8 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-500 ${
              index <= currentStep ? "text-blue-500" : "text-slate-600"
            }`}>
              {step}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-4 bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                style={{ width: index < currentStep ? "100%" : "0%" }}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- MAIN COMPONENT ---
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // FIX: Changed from localStorage to sessionStorage to match your Auth logic
  const token = sessionStorage.getItem("gas_token");

  const fetchMyOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/api/orders/", {
        headers: { "Authorization": `Token ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data);
      } else {
        toast.error("COULD NOT RETRIEVE SHIPMENTS", { id: "fetch-error", icon: null });
      }
    } catch (error) {
      toast.error("SYSTEM ERROR UNABLE TO FETCH ORDERS", { id: "fetch-error", icon: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user, token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-white italic uppercase tracking-[0.3em] text-xs">SYNCHRONIZING LOGISTICS</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-12 pb-24 text-slate-200 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-14 border-l-4 border-blue-600 pl-6 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              TRACK <span className="text-blue-500">DELIVERIES</span>
            </h1>
            <div className="flex items-center gap-4 mt-3">
               <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                GAS MTAANI HUB
              </p>
              <div className="h-[1px] w-12 bg-slate-800"></div>
              <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
                {orders.length} ACTIVE SHIPMENTS
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </header>

        {orders.length === 0 ? (
          <div className="bg-[#1e293b] p-20 rounded-[3rem] text-center border border-slate-800 shadow-2xl">
            <Package size={60} className="mx-auto text-slate-800 mb-6" />
            <p className="text-slate-500 font-black uppercase italic tracking-widest text-sm mb-6">NO ORDERS IN PIPELINE</p>
            <button 
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#1e293b] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden transition-all hover:border-slate-700">
                <div className="bg-slate-900/50 p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-500">
                      <Hash size={14} strokeWidth={3} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">RECEIPT GAS-{String(order.id).slice(-6).toUpperCase()}</p>
                    </div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                      {/* FIX: Changed .qty to .quantity to match your backend model */}
                      {order.items && Array.isArray(order.items) 
                        ? order.items.map(i => `${i.quantity}x ${i.name}`).join(", ") 
                        : "Gas Refill"}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={12} />
                      <p className="text-[9px] font-bold uppercase tracking-widest">Est. Delivery: 45 Mins</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1 text-center">TOTAL PAYABLE</p>
                    <p className="text-3xl font-black italic text-blue-500 leading-none text-center">
                      {/* FIX: Changed total_amount to total_price to match your Serializer */}
                      KES {parseFloat(order.total_price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-10 pb-16 bg-[#1e293b]">
                  <DeliveryStepper status={order.status} />
                </div>

                <div className="bg-slate-900/80 p-6 px-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex gap-4 w-full sm:w-auto">
                    {order.status === "Out for Delivery" && (
                      <button 
                        onClick={() => toast.success("DIALING DISPATCH RIDER", { icon: null })}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-900/20"
                      >
                        <Phone size={14} /> CALL RIDER
                      </button>
                    )}
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition active:scale-95">
                      <MapPin size={14} /> TRACKING
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-slate-600 group cursor-pointer hover:text-blue-500 transition-colors">
                    <span className="text-[9px] font-black uppercase tracking-widest">View Full Manifest</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;