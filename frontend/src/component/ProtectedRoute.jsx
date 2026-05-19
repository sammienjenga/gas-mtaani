import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { Loader2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Theme-consistent Loading State
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-700 mb-4" size={40} />
      <p className="font-black uppercase italic text-blue-700 tracking-widest text-[10px]">
        Verifying Credentials...
      </p>
    </div>
  ); 

  // 2. Redirect to Login if no user exists
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check Permissions (Admins always have access, or check specific allowedRole)
  const hasAccess = !allowedRole || user.role === allowedRole || user.role === 'admin';

  // 4. Handle Access Denied with Toast Feedback
  if (!hasAccess) {
    // We use a useEffect-like approach with a custom toast to prevent infinite re-renders
    // This will show when the redirect happens
    const notifyDenied = () => {
      toast.error("Restricted Area: Admin Access Required", {
        icon: <ShieldAlert size={18} className="text-red-500" />,
        style: {
          background: '#111827', // Gray-900
          color: '#fff',
          borderRadius: '1rem',
          fontSize: '11px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }
      });
    };

    // Trigger the notification and redirect
    notifyDenied();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;