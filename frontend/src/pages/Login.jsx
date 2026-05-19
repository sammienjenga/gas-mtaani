import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google'; 
import toast from "react-hot-toast";

function Login() {
  const { login, sendOTP } = useContext(AuthContext); 
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success("WELCOME BACK TO GAS MTAANI", { icon: null });
        navigate(from, { replace: true });
      } else {
        if (result.not_verified) {
           toast.error("EMAIL NOT VERIFIED. SENDING CODE...", { icon: null });
           await sendOTP(email); 
           navigate("/verify-email", { state: { email: email } });
        } else {
           setError(result.message || "Invalid credentials.");
           toast.error((result.message || "LOGIN FAILED").toUpperCase(), { icon: null });
        }
      }
    } catch (err) { 
      setError("CONNECTION ERROR"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await sendOTP(email);
      if (ok) {
        toast.success("CODE SENT TO YOUR EMAIL", { icon: null });
        setView("reset");
      } else {
        setError("EMAIL NOT FOUND OR SERVER ERROR");
      }
    } catch (err) { 
      setError("SERVER CONNECTION FAILED"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // UPDATED: Using import.meta.env.VITE_API_URL
      const res = await fetch(`${import.meta.env.VITE_API_URL}/verify-otp-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });
      if (res.ok) {
        toast.success("PASSWORD UPDATED TRY LOGGING IN", { icon: null });
        setView("login");
      } else { 
        setError("INVALID OR EXPIRED CODE"); 
      }
    } catch (err) { 
      setError("RESET FAILED"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#0f172a] font-sans">
      <div className="bg-[#1e293b] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-800">
        
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            {view === 'login' ? 'Welcome Back' : view === 'forgot' ? 'Recover' : 'Verify'}
          </h2>
          <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-3 italic">
            Karatina University Gas Hub
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 text-red-500 p-4 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-red-500/20">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* --- VIEW 1: LOGIN --- */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-3 ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="email" required className="w-full pl-14 pr-4 py-3.5 sm:py-4 bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-slate-800 outline-none transition-all text-sm font-bold text-white placeholder:uppercase placeholder:text-[9px]" 
                  placeholder="EMAIL@KUSA.COM" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-3 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type={showPassword ? "text" : "password"} required className="w-full pl-14 pr-14 py-3.5 sm:py-4 bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-slate-800 outline-none transition-all text-sm font-bold text-white placeholder:uppercase placeholder:text-[9px]"
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right px-2">
              <button type="button" onClick={() => setView('forgot')} className="text-[8px] sm:text-[9px] font-black uppercase text-blue-500 tracking-widest hover:underline underline-offset-4">Forgot Password?</button>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 sm:py-5 rounded-2xl text-white font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${loading ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20 active:scale-95"}`}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><LogIn size={18} /> Secure Login</>}
            </button>

            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#1e293b] px-4 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] absolute italic">Express Access</span>
            </div>

            <div className="flex justify-center bg-white rounded-xl p-1 overflow-hidden transition-all hover:ring-2 hover:ring-blue-500">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  try {
                    // UPDATED: Using import.meta.env.VITE_API_URL
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/google-login/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: credentialResponse.credential })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      login(data.email, "google-auth-pass", data); 
                      navigate(from, { replace: true });
                      toast.success(`WELCOME ${data.full_name.toUpperCase()}`, { icon: null });
                    }
                  } catch (err) { toast.error("GOOGLE AUTH FAILED", { icon: null }); } finally { setLoading(false); }
                }}
                onError={() => toast.error("LOGIN FAILED", { icon: null })}
                theme="filled_blue"
                shape="square"
                width="100%"
              />
            </div>
          </form>
        )}

        {/* --- VIEW 2: FORGOT --- */}
        {view === 'forgot' && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <button type="button" onClick={() => setView('login')} className="flex items-center gap-2 text-[8px] sm:text-[9px] font-black uppercase text-slate-500 tracking-widest hover:text-blue-500 transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </button>
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Email Address</label>
              <input type="email" required className="w-full px-6 py-3.5 sm:py-4 bg-slate-900 border-none rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-600" 
                placeholder="EMAIL@KUSA.COM" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 rounded-2xl bg-blue-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Request Reset Code"}
            </button>
          </form>
        )}

        {/* --- VIEW 3: RESET --- */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">6-Digit Code</label>
              <input type="text" required maxLength="6" className="w-full px-6 py-3.5 sm:py-4 bg-slate-900 border-none rounded-2xl text-center text-xl sm:text-2xl font-black text-blue-500 tracking-[0.4em] sm:tracking-[0.5em] outline-none" 
                placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">New Password</label>
              <input type="password" required className="w-full px-6 py-3.5 sm:py-4 bg-slate-900 border-none rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-600" 
                placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 rounded-2xl bg-green-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-green-700 active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Reset"}
            </button>
          </form>
        )}

        {view === 'login' && (
          <p className="mt-8 sm:mt-10 text-center text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-widest">
            New to Gas Mtaani?{" "}
            <Link to="/signup" className="text-blue-500 font-black hover:underline underline-offset-8">Create Account</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;