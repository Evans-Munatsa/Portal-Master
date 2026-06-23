'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, User, Building2, Loader2, Phone } from 'lucide-react';
import LaunchPathLogo from '@/components/LaunchPathLogo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState<'talent' | 'client'>('talent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          phone, 
          role: accountType === 'talent' ? 'CANDIDATE' : 'CLIENT' 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      
      if (accountType === 'talent') {
        router.push('/onboarding');
      } else {
        router.push('/employer/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LaunchPathLogo variant="full" />
          </Link>
          <div className="text-sm font-medium text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7145FF] hover:text-[#5b32e6] transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Create an account</h1>
              <p className="text-slate-500">Join LaunchPath to find opportunities or talent</p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setAccountType('talent')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold transition-colors ${
                    accountType === 'talent'
                      ? 'border-[#7145FF] bg-[#7145FF]/5 text-[#7145FF]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  I&apos;m a Talent
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('client')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold transition-colors ${
                    accountType === 'client'
                      ? 'border-[#7145FF] bg-[#7145FF]/5 text-[#7145FF]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  I&apos;m a Client
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7145FF]/20 focus:border-[#7145FF] transition-colors outline-none text-slate-900"
                    placeholder="e.g. +1 (555) 012-3456"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7145FF] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#5b32e6] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7145FF] disabled:opacity-70 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Create Account <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 mt-2 text-center">
            <p className="text-sm text-slate-600">
              By creating an account, you agree to the LaunchPath{' '}
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
