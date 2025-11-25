import React, { useRef } from 'react';
import { API_BASE_URL } from '../../api/apiConfig';

const OtpVerificationForm = ({ email, otp, setOtp, setView, setMessage, isLoading, setIsLoading }) => {
  const inputsRef = useRef([]);
  const length = 6;

  const getOtpString = () => otp.join("");

  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const enteredOtp = getOtpString();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: "OTP Verified Successfully!" });
        setView('reset');
      } else {
        setMessage({ type: 'error', text: data.detail || "Invalid OTP." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Network error during verification." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
        <p className="text-gray-600 mt-2 text-sm">We sent a 6-digit code to <span className="font-semibold text-green-700">{email}</span></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || getOtpString().length !== length}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="flex flex-col items-center mt-6 space-y-2">
        <button
            onClick={() => {
                setOtp(Array(length).fill(""));
                setView('forgot');
            }}
            className="text-sm text-green-600 hover:text-green-700"
        >
            Resend Code / Change Email
        </button>
      </div>
    </div>
  );
};

export default OtpVerificationForm;