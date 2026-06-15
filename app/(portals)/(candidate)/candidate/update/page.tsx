'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Settings, Clock } from 'lucide-react';
import CandidateNavbar from '@/components/CandidateNavbar';

export default function CandidateUpdatePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Settings Form State
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Interview state
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
        setEmail(sessionData.user.email || '');

        // Load applications for interviews
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

  // LinkedIn OAuth event listener & popup initiator
  const [syncingLinkedIn, setSyncingLinkedIn] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        alert('LinkedIn Profile Synced Successfully!');
        loadData();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadData]);

  const handleLinkedInConnect = async () => {
    try {
      setSyncingLinkedIn(true);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`/api/auth/linkedin/url?origin=${encodeURIComponent(origin)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch auth url');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'linkedin_oauth_popup',
        'width=600,height=700'
      );
      if (!authWindow) {
        alert('Please allow popups for this site to connect your LinkedIn account.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error fetching LinkedIn Auth URL: ' + err.message);
    } finally {
      setSyncingLinkedIn(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch('/api/candidate/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword })
      });
      if (res.ok) {
         alert('Account settings updated successfully. If email or password was changed, please log in again.');
         window.location.reload();
      } else {
         const d = await res.json();
         alert('Failed to update: ' + d.error);
      }
    } catch (e) {
      alert('Error updating settings.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInterview = async (interviewId: number, status: string) => {
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert('Interview status updated successfully.');
        loadData(); // reload
      } else {
        alert('Failed to update interview.');
      }
    } catch (e) {
      alert('Error updating interview.');
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
        Loading update view...
      </div>
    );
  }

  // Filter applications with interviews
  const applicationsWithInterviews = applications.filter(app => app.interviews && app.interviews.length > 0);

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
            {/* Account Settings Forms */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00A86B]" />
                Update Credentials & Settings
              </h2>
              
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold mb-4 text-slate-500">Change password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)} 
                        className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Required only if changing password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="w-full bg-[#00A86B] text-white hover:bg-[#008f5a] font-bold py-3 rounded-lg shadow transition disabled:opacity-50"
                  >
                    {updating ? 'Saving changes...' : 'Save Updated Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* LinkedIn profile sync integration */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0A66C2] fill-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn Profile Integration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Authenticate and sync your LinkedIn profile details directly to your dynamic LaunchPath profile.</p>
                </div>
                <button
                  type="button"
                  disabled={syncingLinkedIn}
                  onClick={handleLinkedInConnect}
                  className="px-4 py-2.5 bg-[#0a66c2] hover:bg-[#004182] disabled:bg-[#0a66c2]/50 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition flex items-center gap-2 shrink-0 border-none"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  {syncingLinkedIn ? 'Connecting...' : 'Sync LinkedIn Data'}
                </button>
              </div>
            </div>

            {/* Interviews Management */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Review & Confirm Scheduled Interviews
              </h2>
              <p className="text-sm text-slate-500 mb-6">Confirm or request reschedule on active interviews proposed by hiring managers.</p>

              <div className="space-y-4">
                {applicationsWithInterviews.length > 0 ? (
                  applicationsWithInterviews.map((app) => (
                    <div key={app.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.job.title}</h4>
                          <p className="text-xs text-slate-500">{app.job.company} • {app.job.location}</p>
                        </div>
                        <span className="text-xs bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md font-semibold font-mono border border-blue-200/30">
                          {app.status}
                        </span>
                      </div>

                      <div className="mt-3 pl-4 border-l-2 border-blue-600/30">
                        {app.interviews.map((iv: any) => (
                          <div key={iv.id} className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-3">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(iv.proposed_time).toLocaleString()}</p>
                              {iv.notes && <p className="text-slate-500 italic mt-1">&quot;{iv.notes}&quot;</p>}
                              <p className="text-slate-500 text-[10px] mt-1">
                                Status: <strong className={iv.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}>{iv.status}</strong>
                              </p>
                            </div>
                            {iv.status === 'Proposed' && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleUpdateInterview(iv.id, 'Confirmed')} 
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition"
                                >
                                  Confirm Slot
                                </button>
                                <button 
                                  onClick={() => handleUpdateInterview(iv.id, 'Rescheduled')} 
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition"
                                >
                                  Reschedule
                                </button>
                                <button 
                                  onClick={() => handleUpdateInterview(iv.id, 'Cancelled')} 
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-6">No proposed interviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
