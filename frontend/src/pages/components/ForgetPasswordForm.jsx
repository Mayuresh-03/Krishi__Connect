import React from 'react';
import { Mail, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from '../../api/apiConfig';

const ForgotPasswordForm = ({ email, setEmail, setView, setMessage, isLoading, setIsLoading }) => {
  
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok || response.status === 200) {
        setMessage({ type: 'success', text: data.message });
        setView('otp');
      } else {
        setMessage({ type: 'error', text: data.detail || "Failed to initiate password reset." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Network error. Could not request OTP." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-600 mt-2">Enter your email to receive a verification code.</p>
      </div>

      <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
        <div>
           <label className="block text-sm font-medium text-gray-700">Registered Email</label>
           <div className="relative mt-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
               placeholder="you@example.com"
               required
             />
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50"
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>

      <button
        onClick={() => setView('login')}
        className="mt-6 w-full flex items-center justify-center text-sm text-green-600 hover:text-green-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
      </button>
    </div>
  );
};

export default ForgotPasswordForm;