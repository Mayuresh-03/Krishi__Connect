import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import SocialLoginButtons from './SocialLoginButtons';

const LoginForm = ({ email, setEmail, handleLogin, setView, isLoading, handleGoogleLogin }) => {
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Farmer Portal Login</h1>
        <p className="text-gray-600 mt-2">Welcome back to KrishiConnect</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <button
              type="button"
              onClick={() => setView('forgot')}
              className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <SocialLoginButtons handleGoogleLogin={handleGoogleLogin} />

      <p className="text-center text-sm text-gray-600 mt-8">
        Don't have an account?{" "}
        <Link to="/signup-farmer" className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;