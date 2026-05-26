import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../api.jsx";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP } = useContext(AuthContext);

  // CRITICAL: Persistent Email Logic
  // Check location state first, if null (refresh), check sessionStorage
  const [email, setEmail] = useState(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) {
      sessionStorage.setItem("pending_verify_email", stateEmail);
      return stateEmail;
    }
    return sessionStorage.getItem("pending_verify_email") || "";
  });

  // CRITICAL: Persistent Timer Logic
  const [timer, setTimer] = useState(() => {
    const savedTimer = sessionStorage.getItem("otp_timer");
    return savedTimer ? parseInt(savedTimer, 10) : 120;
  });
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("SESSION EXPIRED. PLEASE SIGNUP AGAIN.", { icon: null });
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev - 1;
          sessionStorage.setItem("otp_timer", newTime); // Save timer to storage
          return newTime;
        });
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("ENTER 6-DIGIT CODE", { icon: null });
    
    setLoading(true);
    const result = await verifyOTP(email, otp);

    if (result.success) {
      // FIXED: Force clear any accidental session data before redirecting
      // This ensures Navbar and Sidebar stay in "Guest Mode" until manual login
      sessionStorage.removeItem("gas_user");
      sessionStorage.removeItem("gas_token");
      
      sessionStorage.removeItem("pending_verify_email"); // Cleanup
      sessionStorage.removeItem("otp_timer");

      toast.success("EMAIL VERIFIED. PLEASE LOGIN.", { icon: null });
      navigate("/login");
    } else {
      toast.error(result.message?.toUpperCase() || "VERIFICATION ERROR", { icon: null });
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      // UPDATED: Using API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        toast.success("CODE RESENT", { icon: null });
        setTimer(120);
        sessionStorage.setItem("otp_timer", 120);
        setCanResend(false);
      } else {
        const data = await res.json();
        toast.error(data.error?.toUpperCase() || "RESEND FAILED", { icon: null });
      }
    } catch (err) {
      toast.error("SERVER UNREACHABLE", { icon: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 sm:px-6 lg:px-8 font-sans">
      {/* Responsive container: adjusts padding and max-width based on screen size */}
      <div className="bg-[#1e293b] p-6 sm:p-8 md:p-12 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-2xl w-full max-w-[95%] sm:max-w-md text-center border border-slate-800">
        
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white">
          Confirm <span className="text-blue-500">Email</span>
        </h2>
        
        <div className="mt-4 py-2 px-3 sm:px-4 bg-slate-900/50 rounded-lg inline-block border border-slate-700/50 max-w-full">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest break-all">
            Inbox: <span className="text-blue-400">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
          <div className="relative">
            {/* Input scaled for mobile visibility */}
            <input 
              type="text" 
              className="w-full text-center text-2xl sm:text-3xl font-black tracking-[0.3em] sm:tracking-[0.5em] py-4 sm:py-5 bg-slate-900 text-white rounded-xl border border-slate-700 outline-none placeholder:text-slate-800 focus:border-blue-500 transition-colors"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength="6"
              required
            />
            
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 px-1">
               <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">
                 Enter code provided
               </span>
               <button 
                type="button" 
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  canResend ? "text-blue-500 underline hover:text-blue-400" : "text-slate-600"
                }`}
               >
                {canResend ? "Resend" : `Wait ${formatTime(timer)}`}
               </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            {loading ? "Verifying..." : "Confirm Code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmail;