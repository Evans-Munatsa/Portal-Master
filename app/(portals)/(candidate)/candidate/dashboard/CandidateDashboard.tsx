'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, FileText, Upload, Briefcase, Eye, BadgeCheck, ShieldAlert, ArrowLeft, User, Bookmark, BookmarkCheck, Moon, Sun, CheckCircle2, XCircle, Clock, PlusCircle, Video } from 'lucide-react';
import sanitizeHtml from 'sanitize-html';
import { useTheme } from 'next-themes';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import CandidateNavbar from '@/components/CandidateNavbar';
import PracticeHeatmap from '@/components/PracticeHeatmap';

function CircularProgress({ score }: { score: number }) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  const COLORS = [score >= 80 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626', 'transparent'];

  return (
    <div className="w-12 h-12 relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={18}
              outerRadius={24}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-800 dark:text-slate-200">
        {score}%
      </div>
    </div>
  );
}

function CategoryBreakdownChart({ questions }: { questions: any[] }) {
  const hasScores = Array.isArray(questions) && questions.some((q) => (q.questionScore || q.score || 0) > 0);
  if (!hasScores) {
    return (
      <div className="w-full h-[140px] mt-1.5 flex items-center justify-center text-center">
        <p className="text-xs text-slate-400 dark:text-slate-505 italic">
          Awaiting manual grading by Super Admin to plot metrics.
        </p>
      </div>
    );
  }

  const data = questions.map((q) => {
    let shortName = q.title || '';
    if (q.title && q.title.includes('&')) {
      shortName = q.title.split('&')[0].trim();
    }
    return {
      category: shortName,
      score: q.questionScore || 0,
    };
  });

  return (
    <div className="w-full h-[140px] mt-1.5 flex items-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 2, right: 10, left: -24, bottom: 2 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            dataKey="category"
            type="category"
            axisLine={false}
            tickLine={false}
            width={120}
            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '11.5px',
              color: '#fff',
            }}
            cursor={{ fill: 'rgba(113, 69, 255, 0.05)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={11}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill="#7145FF" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReadinessGauge({ score, status }: { score: number | null | undefined; status?: string }) {
  const isPending = status === 'PENDING_REVIEW';
  const hasScore = !isPending && typeof score === 'number' && score >= 0;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (hasScore) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [score, hasScore]);

  const displayScore = hasScore ? animatedScore : 0;
  
  // LaunchPath theme: Premium violet #7145FF.
  const strokeColor = hasScore 
    ? (score >= 80 ? '#7145FF' : score >= 50 ? '#a78bfa' : '#ef4444')
    : '#cbd5e1';

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - displayScore / 100);

  return (
    <div className="ready-score-gauge w-12 h-12 relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full shadow-sm">
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 p-1">
          <circle 
            cx="24" 
            cy="24" 
            r={radius} 
            stroke="currentColor" 
            className="text-slate-200 dark:text-slate-700" 
            strokeWidth="3.2" 
            fill="transparent" 
          />
          {hasScore ? (
            <circle 
              cx="24" 
              cy="24" 
              r={radius} 
              stroke={strokeColor} 
              strokeWidth="3.2" 
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ transitionProperty: 'stroke-dashoffset' }}
            />
          ) : isPending ? (
            <circle 
              cx="24" 
              cy="24" 
              r={radius} 
              stroke="#f59e0b" 
              strokeWidth="3.2" 
              strokeDasharray="4,2" 
              fill="transparent" 
              className="animate-spin text-amber-500"
              style={{ transformOrigin: 'center', animationDuration: '6s' }}
            />
          ) : (
            <circle 
              cx="24" 
              cy="24" 
              r={radius} 
              stroke="#cbd5e1" 
              strokeWidth="1.5" 
              strokeDasharray="3,3" 
              fill="transparent" 
              className="text-slate-350 dark:text-slate-600"
            />
          )}
        </svg>
      </div>
      <div className="absolute inset-y-0 inset-x-0 flex items-center justify-center">
        {isPending ? (
          <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
        ) : (
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">
            {hasScore ? `${Math.round(displayScore)}%` : '—'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CandidateDashboard({ data, user, onRefresh, onLogout }: { data: any, user: any, onRefresh: () => void, onLogout: () => void }) {
  const { matches = [], savedJobs: initialSaved = [], applications = [], allJobs = [], readinessInterview = null } = data || {};
  const [activeTab, setActiveTab ] = useState('Jobs');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobsMap, setSavedJobsMap] = useState<Record<number, boolean>>(() => {
    const acc: Record<number, boolean> = {};
    initialSaved.forEach((id: number) => { acc[id] = true; });
    return acc;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam && ['Jobs', 'AllJobs', 'Saved', 'Applications', 'Profile'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.pushState(null, '', url.pathname + url.search);
    }
  }, [activeTab, mounted]);

  // LinkedIn OAuth event listener & popup initiator
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        alert('LinkedIn Profile Synced Successfully! Syncing matching pipeline...');
        onRefresh();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onRefresh]);

  const [syncingLinkedIn, setSyncingLinkedIn] = useState(false);

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

  // Profile Settings State
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resumeTask, setResumeTask] = useState<any>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<number, boolean>>({});
  const [hasInitializedTask, setHasInitializedTask] = useState(false);

  // Profile editable details state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileTitle, setProfileTitle] = useState(user?.professional_title || '');
  const [profileExp, setProfileExp] = useState(user?.experience_level || '');
  const [profileResumeText, setProfileResumeText] = useState(user?.resume_text || '');
  const [profileLinkedin, setProfileLinkedin] = useState(user?.linkedin_url || '');
  const [profileGithub, setProfileGithub] = useState(user?.github_url || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingResume, setIsEditingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileTitle(user.professional_title || '');
      setProfileExp(user.experience_level || '');
      setProfileResumeText(user.resume_text || '');
      setProfileLinkedin(user.linkedin_url || '');
      setProfileGithub(user.github_url || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchTaskStatus = async () => {
      try {
        const res = await fetch('/api/candidate/resume-status');
        if (res.ok) {
          const { task } = await res.json();
          if (task) {
            const isFinished = task.status === 'COMPLETED' || task.status === 'FAILED';

            // If checking on mount and the task is already finished, ignore it
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
                onRefresh(); // refresh dashboard data to get new matches
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
    } else if (!resumeTask && !hasInitializedTask) {
      fetchTaskStatus();
    }

    return () => clearInterval(interval);
  }, [resumeTask, completedTaskIds, hasInitializedTask, onRefresh]);

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

  const handleApply = async (jobId: number) => {
    try {
      const res = await fetch('/api/candidate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        alert('Application submitted successfully!');
        onRefresh();
      } else {
        alert('Failed to apply. You may have already applied.');
      }
    } catch (err) {
      alert('Error submitting application.');
    }
  };

  const handleSaveJob = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/candidate/save-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        const d = await res.json();
        setSavedJobsMap(prev => ({ ...prev, [jobId]: d.saved }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
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
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          professional_title: profileTitle,
          experience_level: profileExp,
          resume_text: profileResumeText,
          linkedin_url: profileLinkedin,
          github_url: profileGithub,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        alert('Profile saved successfully!');
        setIsEditingProfile(false);
        setIsEditingResume(false);
        if (result.taskId) {
          setResumeTask({ status: 'PROCESSING', progress: 0, id: result.taskId });
        }
        onRefresh();
      } else {
        const err = await res.json();
        alert('Failed to save profile: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Salary not specified';
    if (!min) return `Up to $${max.toLocaleString()}`;
    if (!max) return `From $${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const renderJobs = (jobList: any[]) => {
    return (
      <>
        {(activeTab === 'Jobs' || activeTab === 'AllJobs') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm mb-6 transition-colors space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, location, or tech stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
          {jobList?.map((match: any) => {
            const isSaved = !!savedJobsMap[match.job_id];
            return (
              <div 
                key={match.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group cursor-pointer" 
                onClick={() => setSelectedJob(match)}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-slate-950 dark:text-white group-hover:text-[#7145FF] dark:group-hover:text-violet-400 transition-colors leading-snug truncate">{match.title}</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 truncate">{match.company} • {match.location}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{formatSalary(match.salary_min, match.salary_max)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <button 
                      onClick={(e) => handleSaveJob(e, match.job_id)} 
                      className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-violet-100 text-[#7145FF] dark:bg-[#7145FF]/20 dark:text-violet-300' : 'bg-slate-100 text-slate-500 hover:text-[#7145FF] hover:bg-violet-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {/* AI Match Gauge */}
                      <div className="flex flex-col items-center">
                        {match.match_score > 0 ? (
                          <CircularProgress score={match.match_score} />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-400 select-none border border-dashed border-slate-300 dark:border-slate-700">
                            —
                          </div>
                        )}
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">AI Match</span>
                      </div>

                      {/* Job Readiness Gauge */}
                      <div className="flex flex-col items-center">
                        <ReadinessGauge score={readinessInterview?.score} status={readinessInterview?.status} />
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Readiness</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 mb-4 h-12 overflow-hidden line-clamp-2 leading-relaxed font-normal">
                  {match.fit_summary}
                </div>
              </div>
            );
          })}
          {(!jobList || jobList.length === 0) && (
            <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400 font-medium">
              No jobs match your criteria.
            </div>
          )}
        </div>
      </>
    );
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
        onRefresh();
      } else {
        alert('Failed to update interview.');
      }
    } catch (e) {
      alert('Error updating interview.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500" />;
      case 'Interviewing': return <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-500" />;
      case 'Hired': return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const baseJobs = activeTab === 'Saved' 
    ? matches.filter((m: any) => savedJobsMap[m.job_id]) 
    : (activeTab === 'AllJobs' || (activeTab === 'Jobs' && matches.length === 0) ? allJobs : matches);

  const displayedJobs = baseJobs.filter((m: any) => {
    // Keyword Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = m.title?.toLowerCase().includes(query);
      const companyMatch = m.company?.toLowerCase().includes(query);
      const locationMatch = m.location?.toLowerCase().includes(query);
      const descMatch = (m.description || m.job_description || '')?.toLowerCase().includes(query);
      if (!titleMatch && !companyMatch && !locationMatch && !descMatch) {
        return false;
      }
    }

    return true;
  });

  return (
    <div 
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      className="w-full h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors"
    >
      
      {/* Top Navbar */}
      <CandidateNavbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationsCount={applications?.length || 0}
        onLogout={onLogout}
        onTabChange={() => setSelectedJob(null)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
        {/* TAB 1: JOB BROWSER & SAVED JOBS */}
        {(activeTab === 'Jobs' || activeTab === 'Saved' || activeTab === 'AllJobs') && !selectedJob && (
          <div className="max-w-6xl mx-auto space-y-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <h2 className="text-2xl font-extrabold tracking-tight dark:text-white">
                        {activeTab === 'Saved' ? 'Saved Jobs' : activeTab === 'AllJobs' ? 'All Active Vacancies' : 'AI Matched Job Feed'}
                      </h2>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        {activeTab === 'Jobs' ? 'Based on your parsed resume text & criteria.' : activeTab === 'AllJobs' ? 'All active job vacancies published on LaunchPath.' : 'Jobs you have bookmarked.'}
                      </p>
                   </div>
                   <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-900/40 self-start md:self-center">
                     {activeTab === 'AllJobs' ? <Briefcase className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                     <span>
                       {activeTab === 'Saved' ? 'Saved Matches' : activeTab === 'AllJobs' ? 'Total Vacancies' : 'Active Matches'}: {displayedJobs.length}
                     </span>
                   </div>
                </div>

                {/* Upwork style Sub-navigation Tabs nested directly inside the header card */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    onClick={() => setActiveTab('Jobs')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      activeTab === 'Jobs'
                        ? 'bg-blue-600 text-white shadow-md cursor-pointer'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Best Matches</span>
                    <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === 'Jobs' ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-extrabold'}`}>
                      {matches.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('AllJobs')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      activeTab === 'AllJobs'
                        ? 'bg-blue-600 text-white shadow-md cursor-pointer'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-305 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>All Job Postings</span>
                    <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === 'AllJobs' ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-extrabold'}`}>
                      {allJobs.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('Saved')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      activeTab === 'Saved'
                        ? 'bg-blue-600 text-white shadow-md cursor-pointer'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-355 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Saved Bookmarks</span>
                    <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === 'Saved' ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-extrabold'}`}>
                      {Object.keys(savedJobsMap).filter(k => savedJobsMap[Number(k)]).length}
                    </span>
                  </button>
                </div>
             </div>

             {activeTab === 'Jobs' && matches.length === 0 && (
               <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/40 p-5 rounded-xl text-amber-900 dark:text-amber-305 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm transition-colors">
                 <div>
                   <h4 className="font-bold text-base">No Resume Analyzed Yet!</h4>
                   <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                     Upload your resume in Profile settings to calculate AI match confidence scores and unlock detailed advice. Showing all active talent posts & jobs in the meantime.
                   </p>
                 </div>
                 <button onClick={() => setActiveTab('Profile')} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow transition-all self-start sm:self-center cursor-pointer">
                   Go to Profile Control
                 </button>
               </div>
             )}

             {renderJobs(displayedJobs)}
          </div>
        )}

        {/* TAB APPLICATIONS */}
        {activeTab === 'Applications' && !selectedJob && (
           <div className="max-w-6xl mx-auto space-y-6">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-bold dark:text-white">My Applications</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 pb-1">Track the status of your submitted applications.</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.length > 0 ? applications.map((app: any) => (
                    <div key={app.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-4">
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                         <div>
                           <h3 className="font-bold text-lg text-slate-950 dark:text-white leading-normal">{app.job.title}</h3>
                           <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{app.job.company} • {app.job.location}</p>
                           <p className="text-xs text-slate-550 mt-2 font-medium">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                         </div>
                         <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg shadow-sm mt-3 sm:mt-0">
                           {getStatusIcon(app.status)}
                           <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{app.status}</span>
                         </div>
                       </div>
                       
                       {app.interviews && app.interviews.length > 0 && (
                         <div className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interviews</h4>
                           {app.interviews.map((iv: any) => (
                             <div key={iv.id} className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-3">
                               <div>
                                 <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(iv.proposed_time).toLocaleString()}</p>
                                 <p className="text-slate-600 text-xs mt-1">Status: <strong className={iv.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}>{iv.status}</strong></p>
                                 {iv.notes && <p className="text-slate-600 dark:text-slate-400 text-xs italic mt-1 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">{iv.notes}</p>}
                               </div>
                               {iv.status === 'Proposed' && (
                                 <div className="flex gap-2">
                                   <button onClick={() => handleUpdateInterview(iv.id, 'Confirmed')} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold cursor-pointer">Confirm</button>
                                   <button onClick={() => handleUpdateInterview(iv.id, 'Rescheduled')} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer">Request Reschedule</button>
                                   <button onClick={() => handleUpdateInterview(iv.id, 'Cancelled')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold cursor-pointer">Decline</button>
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  )) : (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium pb-12">
                      You haven&apos;t submitted any job applications yet.
                    </div>
                  )}
                </div>
             </div>
           </div>
        )}

        {/* JOB DETAIL PANEL (Slide-out/Modal simulation) */}
        {(activeTab === 'Jobs' || activeTab === 'Saved' || activeTab === 'Applications' || activeTab === 'AllJobs') && selectedJob && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col transition-colors">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex flex-col items-start gap-4">
               <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-sm font-bold mb-2 cursor-pointer">
                 <ArrowLeft className="w-4 h-4"/> Back
               </button>
               <div>
                 <h2 className="text-2xl font-extrabold leading-snug">{selectedJob.title}</h2>
                 <p className="text-slate-300 font-medium mt-1">{selectedJob.company} • {selectedJob.location}</p>
                 <span className="inline-block bg-slate-800 dark:bg-slate-900 text-blue-300 px-3 py-1 rounded text-xs font-bold font-mono mt-2 border border-slate-700">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
               </div>
               <div className="w-full flex justify-between items-center gap-4 border-t border-slate-800 pt-4 mt-2">
                 {selectedJob.match_score > 0 ? (
                   <div className="bg-blue-500/20 text-blue-300 px-4 py-2 border border-blue-500/35 rounded-lg text-sm font-bold flex items-center gap-2">
                     <Sparkles className="w-4 h-4 text-blue-400"/> AI Confidence Match: {selectedJob.match_score}%
                   </div>
                 ) : (
                   <div className="bg-slate-500/20 text-slate-300 px-4 py-2 border border-slate-500/35 rounded-lg text-sm font-bold flex items-center gap-2">
                     <Sparkles className="w-4 h-4 text-slate-400"/> Upload resume to run AI match analyzer
                   </div>
                 )}
                 <button onClick={() => handleApply(selectedJob.job_id)} className="bg-blue-600 hover:bg-blue-550 active:scale-95 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-lg text-sm cursor-pointer">
                   Apply Now
                 </button>
               </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-2 space-y-6">
                 <div>
                   <h3 className="text-xs font-bold text-slate-550 dark:text-slate-405 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Job Description</h3>
                   <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedJob.job_description || '<p>Description text unavailable.</p>') }}></div>
                 </div>
               </div>
               
               {/* Match Details Sidebar */}
               <div className="space-y-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                      <BadgeCheck className="w-4 h-4 text-green-600 dark:text-green-500"/> Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.matched_skills?.map((skill: string, i: number) => (
                        <span key={i} className="text-xs bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-400 px-2 py-1 rounded font-bold">{skill}</span>
                      ))}
                      {(!selectedJob.matched_skills || selectedJob.matched_skills.length === 0) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">None matched yet.</p>
                      )}
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-4 h-4 text-red-500"/> Missing Requirements
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.missing_skills?.map((skill: string, i: number) => (
                        <span key={i} className="text-xs bg-red-50 dark:bg-red-955 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-400 px-2 py-1 rounded font-bold opacity-90">{skill}</span>
                      ))}
                      {(!selectedJob.missing_skills || selectedJob.missing_skills.length === 0) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">None identified.</p>
                      )}
                    </div>
                 </div>
                 <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Recruiter AI Fit Advice</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">{selectedJob.fit_summary}</p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'Profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header / Profile card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              {!isEditingProfile ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex flex-shrink-0 items-center justify-center border-4 border-white dark:border-slate-800 shadow">
                      <User className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold dark:text-white">{user?.name || 'Talent'}</h2>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{user?.professional_title || 'No professional title set'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="inline-block text-xs font-bold text-[#7145FF] dark:text-violet-405 bg-violet-100 dark:bg-[#7145FF]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                          {user?.experience_level || 'Entry-Level'}
                        </span>
                        {user?.linkedin_url && (
                          <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full hover:underline transition-all">
                            LinkedIn
                          </a>
                        )}
                        {user?.github_url && (
                          <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full hover:underline transition-all">
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileName(user?.name || '');
                      setProfileTitle(user?.professional_title || '');
                      setProfileExp(user?.experience_level || 'Junior');
                      setProfileLinkedin(user?.linkedin_url || '');
                      setProfileGithub(user?.github_url || '');
                      setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Edit Professional Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Experience Level</label>
                    <select
                      value={profileExp}
                      onChange={(e) => setProfileExp(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid-Level">Mid-Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">LinkedIn Profile URL</label>
                      <input
                        type="text"
                        value={profileLinkedin}
                        onChange={(e) => setProfileLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">GitHub Profile URL</label>
                      <input
                        type="text"
                        value={profileGithub}
                        onChange={(e) => setProfileGithub(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Details'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* LinkedIn profile sync integration */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0A66C2] fill-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn Profile Integration
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Authenticate and sync your LinkedIn profile details directly to your dynamic LaunchPath profile.</p>
                </div>
                <button
                  type="button"
                  disabled={syncingLinkedIn}
                  onClick={handleLinkedInConnect}
                  className="px-4 py-2.5 bg-[#0a66c2] hover:bg-[#004182] disabled:bg-[#0a66c2]/50 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition flex items-center gap-2 border-none"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  {syncingLinkedIn ? 'Connecting...' : 'Sync LinkedIn Data'}
                </button>
              </div>
            </div>

            {/* 30-Day Practice Heatmap Section */}
            <PracticeHeatmap />

             {/* Job Readiness Interview Credentials Section */}
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                   <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400"/> Job Readiness Interview Credentials
                 </h3>
                 <Link
                   href="/candidate/readiness-interview"
                   className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-transparent rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow"
                 >
                   <Sparkles className="w-3.5 h-3.5" />
                   <span>{readinessInterview ? 'Retake Interview' : 'Initiate Interview'}</span>
                 </Link>
               </div>

               <div className="p-6">
                 {readinessInterview ? (
                   <div className="space-y-6">
                     
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                       
                       <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                         <span className="text-[10px] font-mono font-bold tracking-widest text-slate-405 dark:text-slate-500 uppercase mb-2">Overall Score</span>
                         <div className="relative h-20 w-20 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90">
                             <circle cx="40" cy="40" r="34" stroke="currentColor" className="text-slate-250 dark:text-slate-800" strokeWidth="6" fill="transparent" />
                             <circle cx="40" cy="40" r="34" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="6" fill="transparent"
                               strokeDasharray={2 * Math.PI * 34}
                               strokeDashoffset={2 * Math.PI * 34 * (1 - (readinessInterview.status === 'PENDING_REVIEW' ? 0 : readinessInterview.score) / 100)} />
                           </svg>
                           <span className="absolute text-[11px] font-black uppercase text-amber-500 animate-pulse">{readinessInterview.status === 'PENDING_REVIEW' ? 'PENDING' : `${readinessInterview.score}%`}</span>
                         </div>
                         <span className={`text-[10px] font-bold mt-2.5 px-3 py-0.5 rounded-full uppercase tracking-wider ${
                           readinessInterview.status === 'PENDING_REVIEW'
                             ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
                             : 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30'
                         }`}>
                           {readinessInterview.status === 'PENDING_REVIEW' ? 'Under Review' : 'Job Ready'}
                         </span>
                       </div>

                       <div className="md:col-span-5 flex flex-col justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                         <h4 className="text-[10px] font-mono font-bold text-slate-405 dark:text-slate-500 uppercase tracking-widest mb-1 pl-1">
                           Performance Breakdown
                         </h4>
                         <CategoryBreakdownChart 
                           questions={
                             typeof readinessInterview.questions === 'string' 
                               ? JSON.parse(readinessInterview.questions) 
                               : (readinessInterview.questions || [])
                           } 
                         />
                       </div>

                       <div className="md:col-span-4 flex flex-col justify-center space-y-2">
                         <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Recruiter Coaching Summary</h4>
                         <p className="text-xs text-slate-705 dark:text-slate-300 leading-relaxed font-medium">
                           {readinessInterview.feedback}
                         </p>
                       </div>

                     </div>

                     <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                       <h4 className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                         <Video className="w-3.5 h-3.5 text-blue-400" />
                         Candidate Video Stream Output Playback
                       </h4>
                       <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-w-lg mx-auto">
                         <video 
                           controls 
                           src={readinessInterview.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-man-delivering-presentation-on-a-screen-40331-large.mp4'} 
                           className="w-full h-full object-cover"
                           poster="https://picsum.photos/seed/interview-preview/800/450"
                         />
                       </div>
                     </div>

                     <div className="space-y-4">
                       <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                         Speech Transcripts & Structured Question Feedback
                       </h4>
                       <div className="space-y-3">
                         {(typeof readinessInterview.questions === 'string' 
                           ? JSON.parse(readinessInterview.questions) 
                           : (readinessInterview.questions || [])
                         ).map((q: any) => (
                           <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                             <div className="flex justify-between items-start gap-4">
                               <div className="space-y-1">
                                 <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[9px] font-mono rounded font-bold uppercase text-slate-500">
                                   Question 0{q.id}
                                 </span>
                                 <h5 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                                   {q.title}
                                 </h5>
                               </div>
                               <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded">
                                 Readiness: {q.questionScore}%
                               </span>
                             </div>

                             <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-300 text-xs italic leading-relaxed">
                               <span className="font-bold text-[10px] font-mono not-italic text-blue-550 uppercase block mb-1">AUTOMATED SPEECH TRANSCRIPT:</span>
                               &ldquo;{q.transcript}&rdquo;
                             </div>

                             <div className="space-y-1.5">
                               <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expert Coaching Points:</span>
                               <ul className="list-disc list-inside space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                 {q.points?.map((p: string, idx: number) => (
                                   <li key={idx} className="leading-relaxed">{p}</li>
                                 ))}
                               </ul>
                             </div>

                           </div>
                         ))}
                       </div>
                     </div>

                   </div>
                 ) : (
                   <div className="text-center py-8 space-y-4 max-w-sm mx-auto">
                     <Video className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
                     <div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-205 text-sm">No Readiness Interview Completed</h4>
                       <p className="text-xs text-slate-500 mt-1">
                         Obtain simulated real-time visual credentials using standard timed questions to showcase communication proficiency to employers.
                       </p>
                     </div>
                     <Link
                       href="/candidate/readiness-interview"
                       className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg text-xs transition cursor-pointer shadow-indigo-500/10 shadow hover:-translate-y-0.5"
                     >
                       <Sparkles className="w-3.5 h-3.5" />
                       <span>Start Timed Evaluation</span>
                     </Link>
                   </div>
                 )}
               </div>
             </div>

             {/* Resume viewer and editor */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400"/> Current Extracted Resume
                </h3>
                {user?.resume_text && !isEditingResume && (
                  <button
                    onClick={() => {
                      setProfileResumeText(user?.resume_text || '');
                      setIsEditingResume(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    Edit Resume Text
                  </button>
                )}
              </div>

              <div className="p-6">
                {isEditingResume ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">
                        You can directly edit the parsed plain-text used by our AI LaunchPath engine to recalculate compatibility scores. Saving updates will refresh relevant matches.
                      </p>
                      <textarea
                        value={profileResumeText}
                        onChange={(e) => setProfileResumeText(e.target.value)}
                        required
                        rows={12}
                        className="w-full p-4 font-mono text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Paste or edit your resume text here..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingResume(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save & Re-score'}
                      </button>
                    </div>
                  </form>
                ) : user?.resume_text ? (
                  <div className="space-y-4">
                    <div className="max-h-72 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 select-text whitespace-pre-wrap">
                      {user.resume_text}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Our system matches you against jobs based on the extracted resume metrics shown above. You can edit this text directly or upload a newer document below.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium mb-1">No resume uploaded or extracted yet.</p>
                    <p className="text-xs">Upload a PDF below to populate your parsed profile and enable AI LaunchPath recommendations.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document upload / re-upload area */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400"/> {user?.resume_text ? 'Upload Newer Resume Document' : 'Upload Resume Document'}
                </h3>
              </div>
              
              {resumeTask && resumeTask.status !== 'FAILED' ? (
                <div className="p-8 m-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <h4 className="font-bold text-slate-805 dark:text-slate-200 mb-2">Resume Processing Queue</h4>
                  <p className="text-sm text-slate-650 dark:text-slate-350 mb-6 leading-relaxed">Your resume is currently being processed by our AI to extract skills and find the best job matches.</p>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 mb-2 overflow-hidden border border-slate-305 dark:border-slate-700 shadow-inner overflow-hidden">
                    <div className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2" style={{ width: `${resumeTask.progress}%` }}>
                      {resumeTask.progress > 10 && <span className="text-[10px] text-white font-bold">{resumeTask.progress}%</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-slate-400">
                    <span>Status: <strong className="text-blue-600 dark:text-blue-400">{resumeTask.status}</strong></span>
                    <span>{resumeTask.progress === 100 ? 'Finalizing...' : 'Extracting match metrics...'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 m-6 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Drag and drop your updated PDF resume here</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Uploading triggers bulk processing of your skill extractions</p>
                  <button 
                    disabled={uploading}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {uploading ? 'Initiating Task...' : 'Browse Files'}
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
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'Settings' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
             <h2 className="text-xl font-bold mb-6">Account Settings</h2>
             <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-1">Current Password</label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-sans" placeholder="Required if changing password"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-1">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-sans"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-sans"/>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold py-3 rounded-lg shadow-md transition text-sm cursor-pointer border-none">
                    Save Changes
                  </button>
                </div>
             </form>

             <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-205 mb-4 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-blue-500" />
                 Data Privacy & POPIA
               </h3>
               <p className="text-sm text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
                 In accordance with the Protection of Personal Information Act (POPIA), you have the right to request an export of your personal data or request complete deletion of your account and associated records.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 font-bold text-sm">
                 <button className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" onClick={() => alert('Your data export request has been submitted. You will receive an email shortly.')}>
                   Request Data Export
                 </button>
                 <button className="px-4 py-2.5 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition cursor-pointer" onClick={() => { if(confirm('Are you sure you want to delete your account? This action is permanent and all data will be lost.')) alert('Account deletion requested. Support will contact you to verify.'); }}>
                   Delete Account & Data
                 </button>
               </div>
             </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
