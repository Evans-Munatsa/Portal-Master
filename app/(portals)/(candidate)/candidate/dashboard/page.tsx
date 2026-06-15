'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Briefcase, RefreshCw } from 'lucide-react';
import CandidateDashboard from './CandidateDashboard';

export default function CandidateDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const router = useRouter();

  const loadingSteps = useMemo(() => [
    { text: 'Verifying credentials...', icon: ShieldCheck, color: 'text-emerald-500' },
    { text: 'Syncing talent profile...', icon: Sparkles, color: 'text-blue-500 animate-pulse' },
    { text: 'Analyzing active market vacancies...', icon: Briefcase, color: 'text-violet-550 dark:text-violet-400' },
    { text: 'Finalizing your matches...', icon: RefreshCw, color: 'text-blue-500 animate-spin' },
  ], []);

  // Dynamic status text update
  useEffect(() => {
    if (!loading && data) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading, data, loadingSteps.length]);

  const fetchDashboardData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const role = String(sessionData.user?.role || '').toUpperCase();
        if (!sessionData.user || role !== 'CANDIDATE') {
          router.push('/login');
          return;
        }
        const res = await fetch('/api/candidate/dashboard');
        if (res.ok) setData(await res.json());
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/');
  };

  if (loading || !data) {
    const StepIcon = loadingSteps[loadingStep].icon;
    return (
      <div 
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 select-none animate-fade-in"
      >
        {/* Subtle glowing elements in the background */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

        <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-8">
          
          {/* Main animated loading widget */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Spinning Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-200/50 dark:border-slate-800/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin ring-1 ring-blue-500/10" style={{ animationDuration: '1.2s' }}></div>
            
            {/* Middle Reverse Spinning Pulsing Ring */}
            <div className="absolute inset-3 rounded-full border-4 border-slate-200/50 dark:border-slate-800/50"></div>
            <div className="absolute inset-3 rounded-full border-4 border-b-violet-500 border-t-transparent border-r-transparent border-l-transparent animate-spin ring-1 ring-violet-500/10" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
            
            {/* Inner pulsing container holding the live-updating stage icon */}
            <div className="absolute inset-6 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 transition-colors duration-500">
              <StepIcon className={`w-6 h-6 ${loadingSteps[loadingStep].color} transition-all duration-300`} />
            </div>
          </div>

          {/* Stepper Status Headings */}
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-905 dark:text-white tracking-tight">
              Loading LaunchPath
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Please wait while we sync
            </p>
          </div>

          {/* Interactive feedback loader bar */}
          <div className="w-full space-y-4">
            <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#7145FF] to-[#F7AFF0] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>

            {/* Stepped Status Item row */}
            <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl shadow-sm backdrop-blur-sm min-h-[46px]">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-all duration-300">
                {loadingSteps[loadingStep].text}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CandidateDashboard data={data} user={data.user} onRefresh={fetchDashboardData} onLogout={handleLogout} />;
}
