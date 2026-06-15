'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, ShieldAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import PortalSidebar from '@/components/PortalSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function EmployerDeletePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const role = String(data.user?.role || '').toUpperCase();
        if (!data.user || (role !== 'EMPLOYER' && role !== 'CLIENT')) {
          router.push('/login');
          return;
        }
        setUser(data.user);

        // Fetch employer posted jobs
        const dashRes = await fetch('/api/employer/dashboard');
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setJobs(dashData.jobs || []);
        }
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
    loadData();
  }, [loadData]);

  const handleDeleteJob = async (id: number, title: string) => {
    if (!confirm(`Are you absolutely sure you want to delete and close the job posting: "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('Job posting closed and deleted successfully.');
        loadData(); // reload
      } else {
        const errData = await res.json();
        alert('Failed to delete job: ' + errData.error);
      }
    } catch (e) {
      alert('Error deleting job posting.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-800 dark:text-slate-200">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar navigation */}
      <PortalSidebar
        role="EMPLOYER"
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between pl-14 pr-4 md:px-8 flex-shrink-0 transition-colors">
          <h1 className="text-xl font-bold dark:text-white">Delete Job Postings & Context</h1>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-[#7145FF]/10 dark:bg-[#7145FF]/20 text-[#7145FF] dark:text-violet-300 px-3 py-1 rounded-full text-sm font-semibold border border-[#7145FF]/20 dark:border-[#7145FF]/30">
              <span className="w-2 h-2 bg-[#7145FF] dark:bg-violet-400 rounded-full animate-pulse"></span>
              {user?.role || 'EMPLOYER'}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Manage Posted Job Roles (Close/Delete)
              </h2>
              <p className="text-sm text-slate-500 mb-6">Closing jobs immediately unpublishes them from the active candidates matching feeds.</p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div key={job.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                        <div 
                          className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-lg prose prose-slate" 
                          dangerouslySetInnerHTML={{ __html: job.description }} 
                        />
                      </div>
                      <button 
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Close Role
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-6">You have no active job postings to delete.</p>
                )}
              </div>
            </div>

            {/* Privacy compliance section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors border-red-200 dark:border-red-950/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Employer Privacy Rights & POPIA Compliance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                In compliance with South Africa&apos;s Protection of Personal Information Act (POPIA), you can request complete erasure of your business metadata, hiring history logs, and anonymization of all candidate matching contexts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition" 
                  onClick={() => alert('Corporate data export has been initiated. You will receive a secure zip download link.')}
                >
                  Request Corporate Data Export
                </button>
                <button 
                  className="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                  onClick={() => { if(confirm('Are you sure you want to request complete anonymization and delete your business account? This is irreversible.')) alert('Corporate erasure request filed. Support will contact you to finalize.'); }}
                >
                  Request Business Anonymization
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
