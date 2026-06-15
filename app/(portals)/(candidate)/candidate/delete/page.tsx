'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldX, Sun, Moon, ShieldAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import CandidateNavbar from '@/components/CandidateNavbar';

export default function CandidateDeletePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const role = String(sessionData.user?.role || '').toUpperCase();
        if (!sessionData.user || role !== 'CANDIDATE') {
          router.push('/login');
          return;
        }
        setUser(sessionData.user);

        // Load applications list
        const dashRes = await fetch('/api/candidate/dashboard');
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setApplications(dashData.applications || []);
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

  const handleWithdrawApplication = async (jobId: number, title: string) => {
    if (!confirm(`Are you sure you want to withdraw your application for ${title}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/candidate/apply', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        alert('Application withdrawn successfully.');
        loadData(); // reload
      } else {
        alert('Failed to withdraw application.');
      }
    } catch (e) {
      alert('Error withdrawing application.');
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
        Loading delete handler...
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
            {/* Active applications list */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldX className="w-5 h-5 text-red-500" />
                Active Submitted Applications
              </h2>
              <p className="text-sm text-slate-500 mb-6">Withdraw or delete active, pending job submissions from your history.</p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.job.title}</h4>
                        <p className="text-xs text-slate-500">{app.job.company} • {app.job.location}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold">
                          {app.status}
                        </span>
                        <button 
                          onClick={() => handleWithdrawApplication(app.job_id, app.job.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Withdraw
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-6">You have no active applications matches to withdraw.</p>
                )}
              </div>
            </div>

            {/* POPIA Erasure */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors border-red-200 dark:border-red-950/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Data Privacy & POPIA Erasure Rights
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                Under the Protection of Personal Information Act (POPIA), you are entitled to have all your personal information, CV metrics, parsing cache, and active matching logs erased from our systems entirely.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition" 
                  onClick={() => alert('Your data export request has been submitted. Prepare for a follow-up email details shortly.')}
                >
                  Request Data Export
                </button>
                <button 
                  className="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-950/20 transition"
                  onClick={() => { if(confirm('Are you absolutely sure you want to permanently delete your candidate account and erase all information? This cannot be undone.')) alert('Account erasure request sent. Our support team will confirm via email.'); }}
                >
                  Delete Account & Erase All Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
