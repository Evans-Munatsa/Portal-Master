'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import LaunchPathLogo from '@/components/LaunchPathLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in');
      }
      
      let portalUrl = '/candidate/dashboard';
      if (data.role === 'SUPERADMIN') portalUrl = '/admin/dashboard';
      else if (data.role === 'EMPLOYER' || data.role === 'CLIENT') portalUrl = '/employer/dashboard';
      
      router.push(portalUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request reset');
      
      setSuccessMsg(data.message);
      // For demonstration purposes only - in production token goes to email
      if (data._devToken) {
        setResetToken(data._devToken);
        setView('reset');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      setSuccessMsg('Password successfully reset. You can now log in.');
      setView('login');
      setPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-205">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LaunchPathLogo variant="full" />
          </Link>
          <div className="text-sm font-medium text-slate-650">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#7145FF] hover:text-[#5b32e6] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
              <p className="text-slate-500">Log in to your LaunchPath account</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-100">
                {successMsg}
              </div>
            )}

            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#7145FF] focus:ring-[#7145FF] border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button 
                    type="button" 
                    onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }} 
                    className="font-medium text-[#7145FF] hover:text-[#5b32e6]"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7145FF] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#5b32e6] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7145FF] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Log In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
            )}

            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="text-center mb-6 -mt-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h2>
                  <p className="text-sm text-slate-500">Enter your email and we&apos;ll send a reset token.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#7145FF] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#5b32e6] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7145FF] disabled:opacity-70 mb-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors focus:outline-none"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {view === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="text-center mb-6 -mt-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Set New Password</h2>
                  <p className="text-sm text-slate-500">Enter your reset token and new password.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="block w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="block w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900 font-mono text-sm"
                    placeholder="Token sent to email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#7145FF] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#5b32e6] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7145FF] disabled:opacity-70 mb-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save New Password'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(''); setSuccessMsg(''); setResetToken(''); setNewPassword(''); }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3 px-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 mt-2 text-center">
            <p className="text-sm text-slate-600">
              By logging in, you agree to the LaunchPath{' '}
              <a href="#" className="underline hover:text-slate-900">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-slate-900">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
