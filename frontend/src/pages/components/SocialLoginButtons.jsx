import React from 'react';
import { GoogleIcon, MicrosoftIcon } from './AuthIcons'; // Adjust path if needed

const SocialLoginButtons = ({ handleGoogleLogin }) => (
  <>
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-300"></span>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white/50 backdrop-blur-sm rounded text-gray-500">Or continue with</span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors bg-white/80">
        <GoogleIcon />
        <span>Google</span>
      </button>
      <button type="button" className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors bg-white/80">
        <MicrosoftIcon />
        <span>Microsoft</span>
      </button>
    </div>
  </>
);

export default SocialLoginButtons;