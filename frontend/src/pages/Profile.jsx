import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { User, Mail, ShieldCheck, MapPin, Phone, Camera, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";

function Profile() {
  const { user } = useContext(AuthContext);
  const token = sessionStorage.getItem("gas_token");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        // UPDATED: Using API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/profile/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        const data = await response.json();
        
        setFormData({
          name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || ""
        });
        setLoading(false);
      } catch (error) {
        toast.error("FAILED TO LOAD PROFILE DATA", { icon: null });
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Save Updated Profile
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // UPDATED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          location: formData.location,
          full_name: formData.name 
        })
      });

      if (response.ok) {
        toast.success("PROFILE UPDATED SUCCESSFULLY", { icon: null });
      } else {
        toast.error("UPDATE FAILED", { icon: null });
      }
    } catch (error) {
      toast.error("CONNECTION ERROR", { icon: null });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 bg-[#0f172a] min-h-screen text-slate-200">
      {/* Header Section - Responsive margins and text size */}
      <div className="mb-8 sm:mb-12 border-l-4 border-blue-600 pl-4 sm:pl-6">
        <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
          ACCOUNT <span className="text-blue-500">INFO</span>
        </h1>
        <p className="text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2">
          Karatina University Gas Hub / Delivery Settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Sidebar Profile Card - Responsive centering */}
        <div className="lg:col-span-1">
          <div className="bg-[#1e293b] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 sm:mb-8">
              <div className="w-full h-full bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center text-blue-500 border-2 border-slate-800 shadow-inner overflow-hidden">
                <User className="w-12 h-12 sm:w-20 sm:h-20" />
              </div>
              <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border-4 border-[#1e293b] hover:bg-blue-700 transition-all shadow-lg active:scale-90">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter mb-2 break-words">
              {formData.name || "USER NAME"}
            </h2>
            <div className="inline-block px-4 sm:px-5 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] bg-blue-600/10 text-blue-500 border border-blue-600/20">
               {user?.role === 'admin' ? "ADMINISTRATOR" : "VERIFIED CUSTOMER"}
            </div>
          </div>
        </div>

        {/* Edit Form - Responsive grid and padding */}
        <div className="lg:col-span-2">
          <div className="bg-[#1e293b] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 sm:py-4 text-sm font-bold text-white focus:border-blue-600 outline-none transition-all"
                    placeholder="ENTER FULL NAME"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                  <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 sm:py-4 text-sm font-bold text-slate-600 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="phone"
                    placeholder="+254..."
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 sm:py-4 text-sm font-bold text-white focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Delivery Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="location"
                    placeholder="ESTATE / HOSTEL / STREET"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 sm:py-4 text-sm font-bold text-white focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-3 text-blue-500/50">
                <ShieldCheck size={20} />
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]">Data encrypted via Atlas SSL</p>
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto bg-blue-600 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
              >
                {saving ? "SAVING..." : <><Save size={18} /> UPDATE PROFILE</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;