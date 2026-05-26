import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";

function Signup() {
  const { signup, login } = useContext(AuthContext); 
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "Weak", color: "bg-slate-700" });

  const navigate = useNavigate();

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    setStrength({ score, label: labels[score], color: colors[score] });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match!");
    setLoading(true);
    const result = await signup({ full_name: fullName, email, password, role: 'buyer' });
    if (result.success) {
      toast.success(result.unverified ? "UNVERIFIED ACCOUNT" : "CODE SENT", { icon: null });
      navigate("/verify-email", { state: { email } });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    
    const res = await fetch(`${API_BASE_URL}/google-login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });
    const data = await res.json();
    if (res.ok) {
      sessionStorage.setItem("gas_user", JSON.stringify(data));
      sessionStorage.setItem("gas_token", data.token);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#0f172a] font-sans">
      {/* Responsive container: Scales width and padding for mobile/desktop */}
      <div className="bg-[#1e293b] p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-[95%] sm:max-w-md border border-slate-800">
        
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
            CREATE <span className="text-blue-500">ACCOUNT</span>
          </h2>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 text-red-500 p-3 sm:p-4 rounded-xl border border-red-500/20 text-[9px] sm:text-[10px] font-black uppercase italic animate-shake">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text" 
              required 
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-xl outline-none text-white font-bold text-sm focus:border-blue-500 transition-colors" 
              placeholder="FULL NAME" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="email" 
              required 
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-xl outline-none text-white font-bold text-sm focus:border-blue-500 transition-colors" 
              placeholder="EMAIL ADDRESS" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-xl outline-none text-white font-bold text-sm focus:border-blue-500 transition-colors" 
              placeholder="PASSWORD" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1">
                <span className="text-slate-500">
                  Strength: <span className={strength.label !== "Weak" ? "text-blue-400" : "text-red-500"}>{strength.label}</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all duration-500 ${i <= strength.score ? strength.color : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="password" 
              required 
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 rounded-xl outline-none text-white font-bold text-sm focus:border-blue-500 transition-colors" 
              placeholder="CONFIRM PASSWORD" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Register Now</>}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 sm:mx-4 text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Google Login Wrapper: ensures width responsiveness */}
          <div className="flex justify-center bg-white rounded-xl p-1 overflow-hidden">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              theme="filled_blue" 
              shape="square" 
              width="100%" 
            />
          </div>
        </form>

        <p className="mt-6 sm:mt-8 text-center text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Already a user? <Link to="/login" className="text-blue-500 font-black hover:underline ml-1">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;