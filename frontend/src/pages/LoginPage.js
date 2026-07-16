import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(token);
      toast.success('Welcome to ZIA CODM!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid token');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (adminKey === 'ZIA_ADMIN_2026') {
      // Set admin token
      localStorage.setItem('zia_admin', 'true');
      toast.success('Admin access granted');
      navigate('/admin');
    } else {
      toast.error('Invalid admin key');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-wider">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">ZIA</span>
            <span className="text-white">CODM</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Account Checker Dashboard</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex mb-6 border-b border-gray-800">
          <button 
            onClick={() => setShowAdmin(false)}
            className={`flex-1 pb-3 text-center font-semibold transition-colors ${!showAdmin ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setShowAdmin(true)}
            className={`flex-1 pb-3 text-center font-semibold transition-colors ${showAdmin ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500'}`}
          >
            Get Token
          </button>
        </div>

        {!showAdmin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Access Token</label>
              <div className="relative">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your Telegram token..."
                  className="w-full bg-[#12121a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                />
                <i className="fas fa-key absolute right-4 top-3.5 text-gray-600"></i>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Get your token from <span className="text-purple-400">@ZIA_CODM_Bot</span> on Telegram
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> Access Dashboard
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#12121a] border border-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">
                <i className="fab fa-telegram text-blue-400 mr-2"></i>How to get access:
              </h4>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Open Telegram and find <span className="text-cyan-400 font-mono">@ZIA_CODM_Bot</span></li>
                <li>Send <span className="text-yellow-400 font-mono">/start</span> to the bot</li>
                <li>Click "Get Access Token"</li>
                <li>Copy the token and paste it in the Login tab</li>
              </ol>
            </div>
          </div>
        )}

        {/* Admin Toggle */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-xs text-gray-600 hover:text-purple-400 transition-colors"
          >
            <i className="fas fa-shield-alt mr-1"></i> Admin Panel
          </button>
        </div>

        {showAdmin && (
          <form onSubmit={handleAdminLogin} className="mt-4 pt-4 border-t border-gray-800 space-y-3">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin Secret Key"
              className="w-full bg-[#12121a] border border-red-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="w-full bg-red-600/20 border border-red-600 text-red-400 font-bold py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm"
            >
              <i className="fas fa-lock mr-2"></i> Access Admin Panel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
