'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, PlusCircle, Upload, FileText, Sparkles, ShieldCheck, RefreshCw, Briefcase } from 'lucide-react';
import CandidateNavbar from '@/components/CandidateNavbar';

export default function CandidateNewPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumeTask, setResumeTask] = useState<any>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<number, boolean>>({});
  const [hasInitializedTask, setHasInitializedTask] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = useMemo(() => [
    { text: 'Verifying credentials...', icon: ShieldCheck, color: 'text-emerald-500' },
    { text: 'Syncing talent profile...', icon: Sparkles, color: 'text-blue-500 animate-pulse' },
    { text: 'Analyzing active market vacancies...', icon: Briefcase, color: 'text-violet-550 dark:text-violet-400' },
    { text: 'Finalizing your matches...', icon: RefreshCw, color: 'text-blue-500 animate-spin' },
  ], []);

  // Dynamic status text update
  useEffect(() => {
    if (!loading && user) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading, user, loadingSteps.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const role = String(data.user?.role || '').toUpperCase();
        if (!data.user || role !== 'CANDIDATE') {
          router.push('/login');
          return;
        }
        setUser(data.user);
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
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchTaskStatus = async () => {
      try {
        const res = await fetch('/api/candidate/resume-status');
        if (res.ok) {
          const { task } = await res.json();
          if (task) {
            const isFinished = task.status === 'COMPLETED' || task.status === 'FAILED';

            // On initial mount, if the task is already finished, mark it as handled so we don't redirect
            if (!hasInitializedTask && isFinished) {
              setCompletedTaskIds(prev => ({ ...prev, [task.id]: true }));
              setHasInitializedTask(true);
              setResumeTask(null);
              return;
            }

            setHasInitializedTask(true);

            if (isFinished && completedTaskIds[task.id]) {
              setResumeTask(null);
              return;
            }

            if (task.status === 'COMPLETED') {
              setResumeTask(task);
              setCompletedTaskIds(prev => ({ ...prev, [task.id]: true }));
              setTimeout(() => {
                setResumeTask(null);
                router.push('/candidate/dashboard'); // take them back to dashboard to see results
              }, 3000);
            } else if (task.status === 'FAILED') {
              setResumeTask(task);
              setCompletedTaskIds(prev => ({ ...prev, [task.id]: true }));
            } else {
              setResumeTask(task);
            }
          } else {
            setHasInitializedTask(true);
            setResumeTask(null);
          }
        }
      } catch (err) {}
    };

    if (resumeTask && (resumeTask.status === 'PROCESSING' || resumeTask.status === 'QUEUED')) {
      interval = setInterval(fetchTaskStatus, 2000);
    } else if (!resumeTask && !hasInitializedTask && user) {
      fetchTaskStatus();
    }

    return () => clearInterval(interval);
  }, [resumeTask, completedTaskIds, hasInitializedTask, user, router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/candidate/resume', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setResumeTask({ status: 'PROCESSING', progress: 0, id: data.taskId });
      } else {
        const errorData = await res.json();
        alert('Error uploading resume: ' + errorData.error);
      }
    } catch (err: any) {
      alert('Error uploading resume: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/');
  };

  if (loading || !user) {
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

  return (
    <div className="w-full h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <CandidateNavbar
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors text-center max-w-2xl mx-auto">
              <div className="bg-[#7145FF]/10 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-[#7145FF]">
                <PlusCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Build New Profile Context</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                LaunchPath uses intelligent parsing to extract matching metrics. Instantly compile custom vectors by dragging or browsing your latest PDF resume in the zone below!
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-lg flex items-center gap-2"><Upload className="w-5 h-5 text-blue-600"/> Upload PDF Resume</h3>
              </div>
              
              {resumeTask && resumeTask.status !== 'FAILED' ? (
                <div className="p-8 m-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Resume Processing Queue</h4>
                  <p className="text-sm text-slate-500 mb-6">Your resume is currently being processed by our AI to extract skills and find the best job matches.</p>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 mb-2 overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner">
                    <div className="bg-[#7145FF] h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2" style={{ width: `${resumeTask.progress}%` }}>
                      {resumeTask.progress > 10 && <span className="text-[10px] text-white font-bold">{resumeTask.progress}%</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-slate-400">
                    <span>Status: <strong className="text-[#7145FF] dark:text-violet-400">{resumeTask.status}</strong></span>
                    <span>{resumeTask.progress === 100 ? 'Finalizing matches...' : 'Extracting match metrics...'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 m-6 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 text-center">Drag and drop your updated PDF resume here</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-center">Uploading triggers bulk processing of your skill extractions</p>
                  <button 
                    disabled={uploading}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="bg-[#7145FF] hover:bg-[#5b32e6] text-white font-bold py-2.5 px-6 rounded-xl shadow disabled:opacity-50 transition"
                  >
                    {uploading ? 'Initiating Task...' : 'Browse PDF Files'}
                  </button>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleResumeUpload} 
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
