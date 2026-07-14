import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice.js';
import { LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      dispatch(loginSuccess(data));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div 
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 mix-blend-multiply" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-white tracking-tighter text-lg border border-white/20">
              HR
            </div>
            <span className="text-2xl font-medium tracking-tight drop-shadow-md">FocusFlow</span>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-6 drop-shadow-lg">
            Modernize your workforce management.
          </h1>
          <p className="text-lg text-blue-100 drop-shadow-md">
            Everything you need to manage your global team's payroll, benefits, HR, and IT in one unified platform.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white tracking-tighter">
              HR
            </div>
            <span className="text-xl font-medium tracking-tight text-gray-900">FocusFlow</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-10">Please enter your details to sign in.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-gray-500">Remember for 30 days</span>
              </label>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium bg-[#0F172A] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-300 transition-all shadow-md shadow-black/10"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
