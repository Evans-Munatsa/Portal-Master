'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import PortalSidebar from '@/components/PortalSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function EmployerUpdatePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Proposed interview form state
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

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

        // Fetch employer data
        const dashRes = await fetch('/api/employer/dashboard');
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

  const scheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant || !interviewDate || !interviewTime) {
       alert('Please fill in candidate slot date and time details');
       return;
    }
    
    setScheduling(true);
    const combined = new Date(`${interviewDate}T${interviewTime}`);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: selectedApplicant.id,
          candidate_id: selectedApplicant.candidate_id,
          proposed_time: combined.toISOString(),
          notes: interviewNotes
        })
      });
      if (res.ok) {
        alert('Interview slot proposed successfully!');
        setInterviewDate('');
        setInterviewTime('');
        setInterviewNotes('');
        setSelectedApplicant(null);
        loadData(); // reload pipeline
      } else {
        alert('Failed to schedule interview');
      }
    } catch (err) {
       alert('Error scheduling interview');
    } finally {
      setScheduling(false);
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
        Loading pipeline updates...
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
          <h1 className="text-xl font-bold dark:text-white">Schedule & Pipeline Management</h1>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-[#7145FF]/10 dark:bg-[#7145FF]/20 text-[#7145FF] dark:text-violet-300 px-3 py-1 rounded-full text-sm font-semibold border border-[#7145FF]/20 dark:border-[#7145FF]/30">
              <span className="w-2 h-2 bg-[#7145FF] dark:bg-violet-400 rounded-full animate-pulse"></span>
              {user?.role || 'EMPLOYER'}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
          {selectedApplicant ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors max-w-2xl mx-auto">
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-xs font-bold mb-6 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Candidate Pipeline
              </button>

              <h2 className="text-xl font-bold mb-2">Schedule Interview: {selectedApplicant.candidate.name}</h2>
              <p className="text-sm text-slate-500 mb-6">Propose and dispatch interview slot metrics for role &quot;{selectedApplicant.job.title}&quot;.</p>

              <form onSubmit={scheduleInterview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Proposed Date</label>
                    <input 
                      type="date" 
                      value={interviewDate} 
                      onChange={e => setInterviewDate(e.target.value)} 
                      className="w-full text-sm p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Proposed Time</label>
                    <input 
                      type="time" 
                      value={interviewTime} 
                      onChange={e => setInterviewTime(e.target.value)} 
                      className="w-full text-sm p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" 
                      required
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 font-mono">Zoom Link / Notes</label>
                   <input 
                     type="text" 
                     value={interviewNotes} 
                     onChange={e => setInterviewNotes(e.target.value)} 
                     placeholder="ZOOM/MEET instructions" 
                     className="w-full text-sm p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" 
                     required
                   />
                </div>
                <button 
                  type="submit" 
                  disabled={scheduling}
                  className="w-full bg-[#7145FF] hover:bg-[#5b32e6] text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mt-4"
                >
                  {scheduling ? 'Dispatching...' : 'Dispatch Proposal Invitation'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#7145FF]" />
                  Update Candidate Pipelines & Interviews
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                     <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800/50 py-3">
                       <th className="px-6 py-4">Candidate</th>
                       <th className="px-6 py-4">Applied Role</th>
                       <th className="px-6 py-4">AI Score</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {applications.length > 0 ? (
                       applications.map((app) => (
                         <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                           <td className="px-6 py-4">
                             <p className="font-bold text-slate-900 dark:text-white text-sm">{app.candidate.name}</p>
                             <p className="text-xs text-slate-500">{app.candidate.professional_title}</p>
                           </td>
                           <td className="px-6 py-4">
                             <span className="bg-[#7145FF]/10 dark:bg-[#7145FF]/20 text-[#7145FF] dark:text-violet-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-[#7145FF]/20 dark:border-[#7145FF]/30">
                               {app.job.title}
                             </span>
                           </td>
                           <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                             {app.matchContext?.match_score ? `${app.matchContext.match_score}%` : 'N/A'}
                           </td>
                           <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => setSelectedApplicant(app)} 
                               className="text-[#7145FF] hover:text-[#5b32e6] dark:text-violet-300 dark:hover:text-white font-bold text-xs bg-[#7145FF]/10 hover:bg-[#7145FF]/20 dark:bg-[#7145FF]/20 dark:hover:bg-[#7145FF]/30 px-3.5 py-1.5 rounded-lg transition"
                             >
                               Assign Interview
                             </button>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={4} className="p-10 text-center text-slate-500 text-sm">
                            No candidates have applied to your roles yet.
                         </td>
                       </tr>
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
