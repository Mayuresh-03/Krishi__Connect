import React, { useState } from 'react';
import { KeyRound, CheckCircle } from "lucide-react";
import { API_BASE_URL } from '../../api/apiConfig';

const ResetPasswordForm = ({ email, otp, setView, setMessage, isLoading, setIsLoading }) => {
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== reNewPassword) {
        setMessage({ type: 'error', text: "Passwords do not match." });
        return;
    }
    if (newPassword.length < 8) {
        setMessage({ type: 'error', text: "Password must be at least 8 characters." });
        return;
    }
    
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    if (!hasLower || !hasUpper || !hasSpecial) {
        setMessage({ type: 'error', text: "Password must have lowercase, uppercase, and special characters." });
        return;
    }

    setIsLoading(true);
    setMessage(null);
    const enteredOtp = otp.join(""); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: "Password reset successful! Please login." });
        setTimeout(() => setView('login'), 2000); 
      } else {
        setMessage({ type: 'error', text: data.detail || "Reset failed." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Network error during reset." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Password</h1>
        <p className="text-gray-600 mt-2">Create a secure password for your account.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
        <div>
           <label className="block text-sm font-medium text-gray-700">New Password</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
               required
             />
           </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="password"
               value={reNewPassword}
               onChange={(e) => setReNewPassword(e.target.value)}
               className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
               required
             />
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50"
        >
          {isLoading ? "Resetting..." : "Set New Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;