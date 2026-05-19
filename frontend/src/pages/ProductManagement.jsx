import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ChevronLeft, Camera, Upload } from "lucide-react";
import toast from "react-hot-toast";

function ProductManagement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null); 
  const token = sessionStorage.getItem("gas_token");

  const CATEGORIES = ["Gas Cylinder", "Accessories"];
  const SUB_OPTIONS = { 
    "Gas Cylinder": ["TotalEnergies", "K-Gas", "Pro-Gas", "Rubis", "Afrigas", "SeaGas", "Lake Gas"],
    "Accessories": ["Single Burner", "Double Burner", "Regulator", "Gas Hose", "Lantern", "Cooker Stand"]
  };

  const [formData, setFormData] = useState({
    name: "",
    category: "Gas Cylinder",
    brand: "TotalEnergies",
    price: "",
    weight: "",
    stock: 10
  });

  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);    
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          // UPDATED: Using import.meta.env.VITE_API_URL
          const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}/`);
          const data = await response.json();
          setFormData({
            name: data.name,
            category: data.category || "Gas Cylinder",
            price: data.price,
            brand: data.brand || "TotalEnergies",
            weight: data.weight,
            stock: data.stock
          });
          if (data.image) setPreviewUrl(data.image); 
        } catch (error) {
          toast.error("FAILED TO LOAD DETAILS", { icon: null });
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData({ ...formData, category: value, brand: SUB_OPTIONS[value][0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. FRONTEND LOCK
    if (loading) return; 
    setLoading(true);

    const uploadData = new FormData();
    Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
    if (selectedFile) uploadData.append("image", selectedFile); 

    // UPDATED: Using import.meta.env.VITE_API_URL
    const url = id 
      ? `${import.meta.env.VITE_API_URL}/products/${id}/` 
      : `${import.meta.env.VITE_API_URL}/products/`;
    const method = id ? "PATCH" : "POST";

    const performUpdate = async () => {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Token ${token}`
        },
        body: uploadData
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    };

    toast.promise(performUpdate(), {
      loading: 'UPLOADING DATA AND IMAGE',
      success: () => { 
        setTimeout(() => navigate("/admin"), 1000); 
        return 'INVENTORY UPDATED'; 
      },
      error: 'SYNC ERROR CHECK FILE OR CONNECTION',
    }, {
      icon: null,
      success: { icon: null },
      error: { icon: null },
      loading: { icon: null }
    }).finally(() => {
      setLoading(false);
    }); 
  };

  return (
    <div className="bg-[#0f172a] min-h-screen pb-20 font-sans text-slate-200">
      {/* Header - Made fully responsive with flex-row scaling */}
      <div className="bg-[#1e293b] border-b border-slate-800 py-4 sm:py-6 px-4 sm:px-6 mb-6 sm:mb-8 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/admin")} className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-blue-500 font-black text-[10px] sm:text-xs uppercase tracking-widest transition">
            <ChevronLeft size={16} /> BACK
          </button>
          <h1 className="text-base sm:text-xl font-black italic tracking-tighter text-white uppercase text-right">
            {id ? "EDIT GAS RECORD" : "NEW INVENTORY ENTRY"}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Image Upload Section - Full width on mobile, 1 column on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-[#1e293b] p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-slate-800 text-center">
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">PRODUCT PHOTO</label>
              <div 
                onClick={() => !loading && fileInputRef.current.click()} 
                className={`group relative aspect-square max-w-[250px] lg:max-w-full mx-auto bg-slate-900 rounded-3xl overflow-hidden border-2 border-dashed border-slate-800 flex items-center justify-center transition-all ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-blue-500"}`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-700 flex flex-col items-center">
                    <Camera size={40} strokeWidth={1} className="mb-2 group-hover:text-blue-500 transition-colors" />
                    <p className="text-[9px] sm:text-[10px] font-black uppercase italic">TAP TO UPLOAD</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Upload className="text-blue-500" size={24} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={loading}
              />
              <p className="mt-4 text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase italic">SUPPORTS JPG PNG OR CAMERA</p>
            </div>
          </div>

          {/* Form Content - Full width on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1e293b] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-800 space-y-6">
              
              <div>
                <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">ITEM NAME</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange} disabled={loading} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-black text-sm sm:text-base text-white italic uppercase focus:border-blue-500 transition-all disabled:opacity-50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">CATEGORY</label>
                  <select name="category" value={formData.category} onChange={handleChange} disabled={loading} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-bold text-sm text-white transition-all focus:border-blue-500 disabled:opacity-50 appearance-none">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">BRAND / TYPE</label>
                  <select name="brand" value={formData.brand} onChange={handleChange} disabled={loading} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-bold text-sm text-white transition-all focus:border-blue-500 disabled:opacity-50 appearance-none">
                    {SUB_OPTIONS[formData.category].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">PRICE (KES)</label>
                  <input name="price" type="number" required value={formData.price} onChange={handleChange} disabled={loading} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-black italic text-sm text-white focus:border-blue-500 transition-all disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">WEIGHT</label>
                  <input name="weight" type="text" value={formData.weight} onChange={handleChange} disabled={loading} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-bold text-sm text-white focus:border-blue-500 transition-all disabled:opacity-50" placeholder="E.G. 6KG" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition shadow-lg active:scale-95 ${loading ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20"}`}
                >
                  <Save size={18} /> {loading ? "UPLOADING..." : id ? "UPDATE ENTRY" : "SAVE TO SHOP"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductManagement;