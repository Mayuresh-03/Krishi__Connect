import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuthStore } from "../authStore"
import { API_BASE_URL } from "../api/apiConfig"

// Import Components
import BackgroundLeaves from "./components/BackgroundLeaves";
import LoginForm from "./components/LoginForm";
import ForgotPasswordForm from "./components/ForgetPasswordForm";
import OtpVerificationForm from "./components/OtpVerificationForm";
import ResetPasswordForm from "./components/ResetPasswordForm";

const FarmerLoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithToken, isLoading: authLoading } = useAuthStore((state) => ({
    login: state.login,
    loginWithToken: state.loginWithToken,
    isLoading: state.loading,
  }));

  // --- Global State for View Switching ---
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'otp' | 'reset'
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Shared Data State ---
  const [email, setEmail] = useState("suyog@gmail.com");
  const [otp, setOtp] = useState("suyog123"); // Shared OTP state
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }

  // Clear message when switching views
  useEffect(() => {
    setMessage(null);
  }, [view]);

  // --- Login Handler ---
  const handleLogin = async (loginEmail, loginPassword) => {
    setMessage(null);
    try {
      const { role } = await login(loginEmail, loginPassword, null); // userRole is null initially
      if (role === 'farmer') {
        console.log("Successful farmer login. Navigating to dashboard.");
        navigate("/farmer", { replace: true });
      } else {
        setMessage({ type: 'error', text: "This account does not have farmer permissions." });
        useAuthStore.getState().logout(); 
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      console.error("Login failed:", err.message);
    }
  };

  // --- Google Login Logic ---
  const handleGoogleLogin = () => {
    const backendUrl = `${API_BASE_URL}/api/auth/login/google?role=farmer`;
    window.open(backendUrl, "oauth-login", "width=500,height=600");
  };

  useEffect(() => {
      const handleAuthMessage = (event) => {
          // Security: if (event.origin !== "http://localhost:8000") return;
          const { token } = event.data;
          if (token) {
              const user = loginWithToken(token);
              if (user && user.role === 'farmer') {
                  navigate("/farmer/os/dashboard", { replace: true });
              } else {
                  setMessage({ type: 'error', text: "This Google account is not registered as a farmer." });
                  useAuthStore.getState().logout();
              }
          }
      };
      window.addEventListener("message", handleAuthMessage);
      return () => {
          window.removeEventListener("message", handleAuthMessage);
      };
  }, [loginWithToken, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-green-600 to-gray-900">
      <BackgroundLeaves />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 border border-white/20 transition-all duration-300">
          
          <div className="text-center mb-6">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">KrishiConnect</span>
            </Link>
          </div>

          {/* MESSAGE DISPLAY (Error/Success) */}
          {message && (
             <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message.text}
             </div>
          )}

          {/* VIEW ROUTER */}
          {view === 'login' && (
            <LoginForm 
                email={email} 
                setEmail={setEmail} 
                handleLogin={handleLogin} 
                setView={setView} 
                isLoading={authLoading}
                handleGoogleLogin={handleGoogleLogin}
            />
          )}

          {view === 'forgot' && (
            <ForgotPasswordForm 
                email={email} 
                setEmail={setEmail} 
                setView={setView} 
                setMessage={setMessage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
          )}

          {view === 'otp' && (
            <OtpVerificationForm 
                email={email} 
                otp={otp} 
                setOtp={setOtp} 
                setView={setView} 
                setMessage={setMessage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
          )}

          {view === 'reset' && (
            <ResetPasswordForm 
                email={email}
                otp={otp}
                setView={setView}
                setMessage={setMessage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default FarmerLoginPage;