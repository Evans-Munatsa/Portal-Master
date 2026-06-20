'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LaunchPathLogo from '@/components/LaunchPathLogo';
import { ThanosSidebarWidget } from '@/components/ThanosSidebarWidget';
import { 
  ShieldAlert, 
  Users, 
  Building, 
  Activity, 
  ShieldBan, 
  RefreshCw, 
  Eye, 
  LogOut, 
  Briefcase, 
  Calendar, 
  Sparkles, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight, 
  Search, 
  Sliders, 
  MapPin,
  Video
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';

import SuperadminCandidateInspector from './SuperadminCandidateInspector';
import SuperadminJobModal from './SuperadminJobModal';
import SuperadminCandidateModal from './SuperadminCandidateModal';
import SuperadminEmployerModal from './SuperadminEmployerModal';

export default function SuperadminDashboard({ 
  data, 
  user, 
  onRefresh, 
  onLogout,
  initialTab = 'Analytics'
}: { 
  data: any; 
  user: any; 
  onRefresh: () => void; 
  onLogout: () => void; 
  initialTab?: string;
}) {
  const router = useRouter();
  const { 
    candidates = [], 
    employers = [], 
    jobs = [],
    matches = [], 
    applications = [], 
    interviews = [], 
    stats = {} 
  } = data || {};

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [inspectCandidate, setInspectCandidate] = useState<any>(null);
  const [inspectTab, setInspectTab] = useState('profile');

  // Search local states
  const [searchQuery, setSearchQuery] = useState('');

  // Modals Visibility States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const [isCandModalOpen, setIsCandModalOpen] = useState(false);
  const [editingCand, setEditingCand] = useState<any>(null);

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);

  // Manual Matcher States
  const [matchCandId, setMatchCandId] = useState('');
  const [matchJobId, setMatchJobId] = useState('');
  const [matchScore, setMatchScore] = useState(90);
  const [matchSkillsMatched, setMatchSkillsMatched] = useState('React, TypeScript, Next.js, Engineering leadership');
  const [matchSkillsMissing, setMatchSkillsMissing] = useState('Advanced Cloud Architecture (AWS/GCP)');
  const [matchRecommendation, setMatchRecommendation] = useState('Strong operational fit with candidate experience background');
  const [matchFitSummary, setMatchFitSummary] = useState('Candidate is recommended for quick hiring screen in alignment with core stack requirements.');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Handle Tab changes & state resets
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery('');
    setInspectCandidate(null);
    setSubmitError('');
    setSubmitSuccess('');

    let path = '/admin/dashboard';
    if (tab === 'Interviews') path = '/admin/interviews';
    else if (tab === 'Jobs') path = '/admin/jobs';
    else if (tab === 'Talent') path = '/admin/talent';
    else if (tab === 'Corporate') path = '/admin/corporate';
    else if (tab === 'Matcher') path = '/admin/matcher';

    router.push(path);
  };

  const handleRescoreAll = async () => {
    if (!confirm('Are you sure you want to trigger a system-wide AI re-score? This process is intensive.')) return;
    
    try {
      const res = await fetch('/api/superadmin/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESCORE_ALL' })
      });
      const resData = await res.json();
      if (res.ok) alert(resData.message);
      else alert('Error: ' + resData.error);
    } catch (err: any) {
      alert('Error triggering rescore: ' + err.message);
    }
  };

  // GENERAL SUBMIT UTILITY FOR MODALS
  const sendOverrideAction = async (action: string, payload: any) => {
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const res = await fetch('/api/superadmin/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Server error occurred');
      }
      setSubmitSuccess(result.message || 'Operation completed successfully!');
      onRefresh();
      return { success: true, data: result };
    } catch (err: any) {
      setSubmitError(err.message || 'Verification error, please check fields.');
      return { success: false, error: err.message };
    }
  };

  // JOB OPERATIONS
  const openJobCreate = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const openJobEdit = (job: any) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to permanently delete this job post? This action is immediate.')) return;
    await sendOverrideAction('DELETE_JOB', { jobId });
  };

  // CANDIDATE OPERATIONS
  const openCandCreate = () => {
    setEditingCand(null);
    setIsCandModalOpen(true);
  };

  const openCandEdit = (cand: any) => {
    setEditingCand(cand);
    setIsCandModalOpen(true);
  };

  const handleDeleteCandidate = async (candidateId: number) => {
    if (!confirm('Confirm deletion of Candidate profile? This deletes connected applications and resume texts.')) return;
    await sendOverrideAction('DELETE_CANDIDATE', { candidateId });
  };

  // EMPLOYER OPERATIONS
  const openEmpCreate = () => {
    setEditingEmp(null);
    setIsEmpModalOpen(true);
  };

  const openEmpEdit = (emp: any) => {
    setEditingEmp(emp);
    setIsEmpModalOpen(true);
  };

  const handleDeleteEmployer = async (employerId: number) => {
    if (!confirm(`Are you sure you want to permanently delete Employer ID ${employerId}? This terminates all connected job definitions.`)) return;
    await sendOverrideAction('DELETE_EMPLOYER', { employerId });
  };

  // MANUAL MATCH OPERATIONS
  const handleManualMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchCandId || !matchJobId) {
      setSubmitError('Please select active Candidate and active Corporate Job Posting');
      return;
    }

    const payload = {
      candidate_id: parseInt(matchCandId),
      job_id: parseInt(matchJobId),
      match_score: matchScore,
      matched_skills: matchSkillsMatched,
      missing_skills: matchSkillsMissing,
      recommendation: matchRecommendation,
      fit_summary: matchFitSummary
    };

    const result = await sendOverrideAction('MANUAL_MATCH', payload);
    if (result.success) {
      alert('Success! Candidate matched manually. Application placed in active pipelines.');
      setMatchCandId('');
      setMatchJobId('');
    }
  };

  // FILTERED RESOURCES BASED ON QUERY Search bar
  const filteredJobs = jobs.filter((job: any) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.status?.toLowerCase().includes(q)
    );
  });

  const filteredCandidates = candidates.filter((c: any) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.professional_title?.toLowerCase().includes(q) ||
      c.experience_level?.toLowerCase().includes(q)
    );
  });

  const filteredEmployers = employers.filter((e: any) => {
    const q = searchQuery.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    );
  });

  // ANALYTICS PRE-COMPILATIONS
  const appStatusCounts = (applications || []).reduce((acc: any, app: any) => {
    const status = app.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusColors: Record<string, string> = {
    'Offered': '#10B981',      // emerald
    'Interviewing': '#7145FF', // violet
    'Reviewed': '#3B82F6',     // blue
    'Pending': '#F59E0B',      // amber
    'Rejected': '#EF4444'       // red
  };

  const appStatusChartData = Object.keys(appStatusCounts).map(status => ({
    name: status,
    value: appStatusCounts[status],
    color: statusColors[status] || '#7145FF'
  }));

  const matchBuckets = [
    { name: 'Prime (85-100%)', count: 0, fill: '#10B981' },
    { name: 'Strong (70-84%)', count: 0, fill: '#7145FF' },
    { name: 'Moderate (50-69%)', count: 0, fill: '#3B82F6' },
    { name: 'Developing (<50%)', count: 0, fill: '#64748B' }
  ];

  (matches || []).forEach((m: any) => {
    if (m.match_score >= 85) matchBuckets[0].count++;
    else if (m.match_score >= 70) matchBuckets[1].count++;
    else if (m.match_score >= 50) matchBuckets[2].count++;
    else matchBuckets[3].count++;
  });

  // 30-Day Cumulative Time-series for active job postings and candidate registrations
  const trendData = (() => {
    const dataPoints: any[] = [];
    const today = new Date();
    
    // Setup 30 sub-intervals in the past
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dataPoints.push({
        date: dateStr,
        Candidates: 0,
        Jobs: 0,
        timestamp: d.getTime()
      });
    }

    // Map candidate registration dates
    let candidatesWithDates = 0;
    (candidates || []).forEach((cand: any) => {
      const rawDate = cand.created_at || cand.createdAt;
      if (rawDate) {
        const candTime = new Date(rawDate).getTime();
        candidatesWithDates++;
        dataPoints.forEach(point => {
          if (point.timestamp >= candTime) {
            point.Candidates += 1;
          }
        });
      }
    });

    // Handle candidates without a date seamlessly
    const candidatesWithoutDates = (candidates || []).length - candidatesWithDates;
    dataPoints.forEach((point, idx) => {
      const growthFactor = 0.4 + (idx / 29) * 0.6;
      point.Candidates += Math.round(candidatesWithoutDates * growthFactor);
    });

    // Map job posting dates
    let jobsWithDates = 0;
    (jobs || []).forEach((job: any) => {
      const rawDate = job.created_at || job.createdAt || job.posted_at;
      if (rawDate) {
        const jobTime = new Date(rawDate).getTime();
        jobsWithDates++;
        dataPoints.forEach(point => {
          if (point.timestamp >= jobTime) {
            point.Jobs += 1;
          }
        });
      }
    });

    // Handle job posts without explicit timestamps
    const jobsWithoutDates = (jobs || []).length - jobsWithDates;
    dataPoints.forEach((point, idx) => {
      const growthFactor = 0.3 + (idx / 29) * 0.7;
      point.Jobs += Math.round(jobsWithoutDates * growthFactor);
    });

    return dataPoints;
  })();

  return (
    <div className="w-full h-screen bg-slate-900 flex overflow-hidden font-sans text-slate-300">
      
      {/* Sidebar navigation aligned with LaunchPath brand style guide */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex flex-col items-start gap-4 mb-8">
            <LaunchPathLogo variant="full" textColor="text-white" />
            <span className="px-2.5 py-0.5 bg-[#7145FF]/10 text-[#7145FF] text-[10px] font-bold rounded-md uppercase border border-[#7145FF]/30 select-none">
              Super Admin
            </span>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => handleTabChange('Analytics')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                activeTab === 'Analytics' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className={`w-5 h-5 ${activeTab === 'Analytics' ? 'text-[#7145FF]' : ''}`} />
              <span>Platform Insights</span>
            </button>

            <button 
              onClick={() => handleTabChange('Interviews')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                activeTab === 'Interviews' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'Interviews' ? 'text-[#7145FF]' : ''}`} />
              <span>Active Interviews</span>
            </button>

            <button 
              onClick={() => handleTabChange('Jobs')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                activeTab === 'Jobs' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className={`w-5 h-5 ${activeTab === 'Jobs' ? 'text-[#7145FF]' : ''}`} />
              <span>Job Postings</span>
            </button>

            <button 
              onClick={() => handleTabChange('Talent')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                activeTab === 'Talent' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className={`w-5 h-5 ${activeTab === 'Talent' ? 'text-[#7145FF]' : ''}`} />
              <span>Talent Pool</span>
            </button>

            <button 
              onClick={() => handleTabChange('Corporate')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                activeTab === 'Corporate' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building className={`w-5 h-5 ${activeTab === 'Corporate' ? 'text-[#7145FF]' : ''}`} />
              <span>Employer Index</span>
            </button>

            <button 
              onClick={() => handleTabChange('Matcher')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                activeTab === 'Matcher' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10 shadow-radial' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className={`w-5 h-5 ${activeTab === 'Matcher' ? 'text-violet-300' : ''}`} />
              <span className="flex-1 text-left">Manual Matchmaker</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            </button>
          </nav>
        </div>

        <div className="px-2">
          <ThanosSidebarWidget currentRole="SUPERADMIN" />
        </div>

        <div className="mt-auto p-4 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-10 h-10 rounded-full bg-[#7145FF]/20 flex items-center justify-center text-xs font-mono font-bold text-[#7145FF] flex-shrink-0 border border-[#7145FF]/30">
                 {user?.name?.substring(0, 2).toUpperCase() || 'SA'}
               </div>
               <div className="flex-1 overflow-hidden font-sans">
                 <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                 <p className="text-[10px] font-mono text-[#7145FF] uppercase tracking-widest truncate">Global Root</p>
               </div>
            </div>
            <button 
              onClick={onLogout} 
              className="text-slate-500 hover:text-[#7145FF] transition ml-2 cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        
        {/* Header section styled with LaunchPath visual language */}
        <header className="bg-slate-950 h-16 border-b border-slate-800 flex items-center justify-between px-8 flex-shrink-0 select-none">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {activeTab === 'Analytics' && 'Platform Performance Dashboard'}
            {activeTab === 'Interviews' && 'Operational Interview Registry'}
            {activeTab === 'Jobs' && 'Interactive Open Jobs Direct CRUD'}
            {activeTab === 'Talent' && 'Registered Candidate Talent Directories'}
            {activeTab === 'Corporate' && 'Strategic Employer Tenant Directories'}
            {activeTab === 'Matcher' && 'Superadmin Candidate-Employer Matcher'}
          </h1>
          <div className="flex items-center gap-6 select-none">
            <span className="px-2.5 py-0.5 bg-[#7145FF]/10 text-[#7145FF] text-[10px] font-mono font-bold rounded-md uppercase border border-[#7145FF]/25">
              Secure Operations
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: CORE ANALYTICS INSIGHTS */}
          {activeTab === 'Analytics' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7145FF]" />
                    Engine Analytics & Diagnostics
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Real-time visual monitoring of cross-tenant hiring pipelines, standard matches, overall interview confirmations, and cumulative success metrics.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onRefresh} 
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync Data
                  </button>
                  <button 
                    onClick={handleRescoreAll} 
                    className="flex items-center gap-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-[#7145FF]/10 cursor-pointer"
                  >
                    Force Global Match Audit
                  </button>
                </div>
              </div>

              {/* VIDEO INTERVIEWS PENDING REVIEW STATUS ALERT BANNER */}
              {stats?.pendingVideoInterviewsCount > 0 && (
                <div role="alert" className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-scale-in">
                  <div className="flex gap-3">
                    <div className="bg-amber-500/20 text-amber-500 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                      <Video className="w-5 h-5 text-amber-550 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Action Required: Video Interviews Pending Review</h4>
                      <p className="text-xs text-amber-500/90 mt-0.5 font-medium">
                        There are {stats.pendingVideoInterviewsCount} candidate video recording submissions awaiting manual grading, coaching comments, and overall rating alignment.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleTabChange('Talent')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Go to Review Console →
                  </button>
                </div>
              )}

              {/* Stats Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm animate-fade-in">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Registered Candidates</p>
                  <p className="text-3xl font-black text-white font-mono">{stats?.totalCandidates || 0}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm animate-fade-in">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Employer Tenants</p>
                  <p className="text-3xl font-black text-white font-mono">{stats?.totalEmployers || 0}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm animate-fade-in">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Total Open Job Posts</p>
                  <p className="text-3xl font-black text-[#7145FF] font-mono">{stats?.totalJobs || 0}</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl shadow-sm animate-fade-in">
                  <p className="text-[10px] font-mono font-bold text-amber-550 uppercase tracking-widest mb-1.5 font-sans">Videos Waiting Review</p>
                  <p className={`text-3xl font-black font-mono ${stats?.pendingVideoInterviewsCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                    {stats?.pendingVideoInterviewsCount || 0}
                  </p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm animate-fade-in">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Placement Success Rate</p>
                  <div className="flex items-baseline gap-2">
                     <p className="text-3xl font-black text-emerald-400 font-mono">{stats?.successRate || 0}%</p>
                     <span className="text-xs font-mono text-slate-500 font-sans">Target 80%</span>
                  </div>
                </div>
              </div>

              {/* Nice Charts Block */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart A: Success Rates & Application Pipeline Status */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-sm">Application Success & Status Pipeline</h3>
                      <p className="text-[11px] text-slate-400">Breakdown of applicant pipeline velocity and final placements.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      Live Stream
                    </span>
                  </div>
                  
                  <div className="h-64 flex items-center justify-center">
                    {appStatusChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appStatusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {appStatusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#020617', 
                              border: '1px solid #1e293b',
                              borderRadius: '12px'
                            }} 
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-500 text-xs italic">No active application pipeline datasets loaded.</div>
                    )}
                  </div>
                </div>

                {/* Chart B: Job Match Score distribution */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-sm">Fit Score Distribution Inferences</h3>
                      <p className="text-[11px] text-slate-400">Active machine matches grouped by structural similarity bands.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/10">
                      Mean Match: {stats?.averageMatchScore || 0}%
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={matchBuckets}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(113, 69, 255, 0.05)' }}
                          contentStyle={{ 
                            backgroundColor: '#020617', 
                            border: '1px solid #1e293b', 
                            borderRadius: '12px'
                          }} 
                        />
                        <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={32}>
                          {matchBuckets.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Comprehensive 30-Day Platform Growth Timeline */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">30-Day Platform Engagement & Growth Trends</h3>
                    <p className="text-[11px] text-slate-400">Comparing cumulative candidate profiles and active workspace job listings.</p>
                  </div>
                  <div className="flex gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#7145FF]" />
                      <span className="text-slate-300">Candidates: {stats?.totalCandidates || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#34D399]" />
                      <span className="text-slate-300">Active Jobs: {stats?.totalJobs || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7145FF" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#7145FF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34D399" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#020617', 
                          border: '1px solid #1e293b', 
                          borderRadius: '12px'
                        }} 
                        itemStyle={{ fontSize: '11px' }}
                        labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Candidates" 
                        name="Candidate Registrations"
                        stroke="#7145FF" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCand)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Jobs" 
                        name="Active Job Postings"
                        stroke="#34D399" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorJobs)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Job matches overview in Analytics view for thorough platform auditing */}
              <div className="bg-slate-950/65 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">Targeted Job Match Inferences</h3>
                    <p className="text-xs text-slate-400">Deep structural matching scores computed across global resume embeddings.</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    Total: {matches.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10.5px] uppercase font-mono font-extrabold tracking-widest text-slate-500">
                        <th className="py-3 px-2">Job Title</th>
                        <th className="py-3 px-2">Candidate Name</th>
                        <th className="py-3 px-2 text-center">Score</th>
                        <th className="py-3 px-2">Fit Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {matches.slice(0, 5).map((m: any, idx: number) => {
                        const score = m.match_score;
                        let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        if (score < 50) badgeColor = "bg-slate-500/10 text-slate-400 border-slate-500/10";
                        else if (score < 70) badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/15";
                        else if (score < 85) badgeColor = "bg-[#7145FF]/10 text-[#7145FF] border-[#7145FF]/20";

                        return (
                          <tr key={m.id || idx} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3 px-2">
                              <span className="font-semibold text-white block">{m.job?.title || 'Unknown Role'}</span>
                              <span className="text-[10px] text-slate-500">{m.job?.company}</span>
                            </td>
                            <td className="py-3 px-2 text-slate-300 font-medium">{m.candidate?.name}</td>
                            <td className="py-3 px-2 text-center font-mono font-bold text-white">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                                {score}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-xs text-slate-400 max-w-xs truncate">{m.fit_summary || 'No summary'}</td>
                          </tr>
                        );
                      })}
                      {matches.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-xs text-slate-500 italic">
                            No active match datasets created by candidate resume tasks yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ACTIVE INITIATED INTERVIEWS & PARTIES */}
          {activeTab === 'Interviews' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base font-sans mt-0.5">Operational Initiated Interviews</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    System record of all scheduled corporate meetings, candidate technical reviews, and current confirmation status.
                  </p>
                </div>
                <button 
                  onClick={onRefresh}
                  className="flex items-center gap-1.5 p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload Data
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-fade-in">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/70 border-b border-slate-800">
                    <tr className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Involved Candidate / Talent</th>
                      <th className="px-6 py-4">Initiating Employer / Client</th>
                      <th className="px-6 py-4">Target Job / Position</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 bg-slate-950/20">
                    {interviews?.map((iv: any) => {
                      let statusBadge = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                      if (iv.status === 'Confirmed') statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      else if (iv.status === 'Cancelled') statusBadge = "bg-red-500/10 text-red-400 border-red-500/20";
                      else if (iv.status === 'Rescheduled') statusBadge = "bg-blue-500/10 text-blue-400 border-blue-500/20";

                      return (
                        <tr key={iv.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-600">#{iv.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white text-sm block">{iv.candidate?.name || 'Incomplete Profile'}</span>
                            <span className="text-xs text-slate-550">{iv.candidate?.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white text-sm block">{iv.employer?.name || 'Platform Corp'}</span>
                            <span className="text-xs text-slate-555">{iv.employer?.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-white text-xs block">{iv.application?.job?.title || 'Job Post deleted'}</span>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{iv.application?.job?.company || 'LaunchPath Partner'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-300 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{new Date(iv.proposed_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${statusBadge}`}>
                              {iv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {(!interviews || interviews.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                          No initiated physical corporate interviews recorded in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: JOBS INDEX (With Full CRUD) */}
          {activeTab === 'Jobs' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base font-sans mt-0.5">Open Jobs Registry Operations</h3>
                  <p className="text-xs text-slate-400">
                    Execute global creation, publishing scope adjustments, and direct deletion parameters of real-time postings.
                  </p>
                </div>
                <button 
                  onClick={openJobCreate}
                  className="flex items-center gap-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-md shadow-[#7145FF]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Deploy New Job Posting
                </button>
              </div>

              {/* Search Bar for filtering jobs */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-500 h-4.5 w-4.5 animate-pulse" />
                <input 
                  type="text" 
                  placeholder="Filter through global open job postings by title, company, or specifications..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#7145FF] transition-all text-slate-200 font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="bg-slate-950 border border-slate-805 rounded-2xl overflow-hidden shadow-lg animate-fade-in">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#7145FF]/5 border-b border-slate-805">
                     <tr className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                       <th className="px-6 py-4">Job Info & Company</th>
                       <th className="px-6 py-4">Core Specifications</th>
                       <th className="px-6 py-4">Assigned Tenant Owner</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Administrative Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                    {filteredJobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-[#7145FF]/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">{job.title}</p>
                          <p className="text-xs text-[#7145FF] font-semibold mt-0.5">{job.company}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10.5px] text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{job.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-sans space-y-1 text-slate-350">
                          {job.years_experience && (
                            <p>👨‍💻 <span className="font-semibold text-white">{job.years_experience}</span> Exp</p>
                          )}
                          {(job.salary_min || job.salary_max) && (
                            <p>💰 <span className="font-semibold text-white">R {job.salary_min?.toLocaleString()} - R {job.salary_max?.toLocaleString()}</span></p>
                          )}
                          {job.mandatory_skills && job.mandatory_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {job.mandatory_skills.map((s: string, idx: number) => (
                                <span key={idx} className="bg-slate-900 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {job.employer ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-200">{job.employer.name}</p>
                              <p className="text-slate-550 font-mono text-[10px]">{job.employer.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Unassigned (Native Admin Role)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            job.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-slate-805 text-slate-400 border-slate-700'
                          }`}>
                            {job.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button 
                              onClick={() => openJobEdit(job)}
                              className="p-1.5 hover:bg-[#7145FF]/20 text-[#a385ff] rounded-lg border border-[#7145FF]/10 hover:border-[#7145FF]/30 transition cursor-pointer"
                              title="Edit Job Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredJobs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-xs">No matching active job postings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TALENT LOGS (With Candidate CRUD) */}
          {activeTab === 'Talent' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-955 border border-slate-800 p-6 rounded-2xl gap-4">
                 <div className="space-y-1">
                   <h3 className="font-bold text-white text-base font-sans mt-0.5">Platform Talent Directory Operations</h3>
                   <p className="text-xs text-slate-404">
                     Complete candidate profile controls. Onload existing candidates manually, specify resume documents, or remove profile registry items.
                   </p>
                 </div>
                 <button 
                   onClick={openCandCreate}
                   className="flex items-center gap-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-md shadow-[#7145FF]/20 cursor-pointer"
                 >
                   <Plus className="w-4 h-4" /> Onload Existing Candidate
                 </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-550 h-4.5 w-4.5" />
                <input 
                  type="text" 
                  placeholder="Filter through candidate talents by name, email, credentials, or experience..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#7145FF] transition-all text-slate-200 font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="bg-slate-955 border border-slate-805 rounded-2xl overflow-hidden shadow-lg animate-fade-in bg-slate-950">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#7145FF]/5 border-b border-slate-805">
                     <tr className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                       <th className="px-6 py-4">ID</th>
                       <th className="px-6 py-4">Candidate Identity</th>
                       <th className="px-6 py-4">Professional Title & Level</th>
                       <th className="px-6 py-4">Credentials & Links</th>
                       <th className="px-6 py-4 text-right">Administrative Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                    {filteredCandidates.map((c: any) => (
                      <tr key={c.id} className="hover:bg-[#7145FF]/5 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-slate-600">#{c.id}</td>
                        <td className="px-6 py-4 font-sans">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm">{c.name}</p>
                            {c.video_interviews?.[0]?.status === 'PENDING_REVIEW' && (
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase animate-pulse">
                                Pending Video
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-450 font-mono">{c.email}</p>
                        </td>
                        <td className="px-6 py-4 font-sans">
                          <p className="text-sm font-semibold text-slate-300">{c.professional_title || 'No Title Listed'}</p>
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#7145FF] bg-[#7145FF]/10 px-2.5 py-0.5 rounded mt-1.5 inline-block border border-[#7145FF]/15 font-mono">
                            {c.experience_level || 'ENTRY-LEVEL'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-sans">
                          <div className="space-y-1">
                            {c.linkedin_url && (
                              <p>🔗 <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a></p>
                            )}
                            {c.github_url && (
                              <p>💻 <a href={c.github_url} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">GitHub</a></p>
                            )}
                            {!c.linkedin_url && !c.github_url && <span className="text-slate-550 italic">No links configured</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end font-sans">
                            {c.video_interviews?.[0]?.status === 'PENDING_REVIEW' ? (
                              <button 
                                onClick={() => { setInspectCandidate(c); setInspectTab('video'); }}
                                className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3.5 py-1.5 rounded-xl border border-amber-500/25 flex items-center gap-1 cursor-pointer transition font-mono animate-pulse"
                                title="Review Pending Candidate Video Interview"
                              >
                                <Video className="w-3.5 h-3.5 text-amber-500" /> REVIEW VIDEO
                              </button>
                            ) : (
                              <button 
                                onClick={() => { setInspectCandidate(c); setInspectTab('profile'); }}
                                className="text-xs bg-[#7145FF]/10 hover:bg-[#7145FF]/20 text-[#a385ff] px-3.5 py-1.5 rounded-xl border border-[#7145FF]/20 flex items-center gap-1 cursor-pointer transition font-mono"
                                title="Inspect Candidate Show Page"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#a385ff]" /> INSPECT PROFILE
                              </button>
                            )}
                            <button 
                              onClick={() => openCandEdit(c)}
                              className="p-1.5 hover:bg-[#7145FF]/20 text-[#a385ff] rounded-lg border border-[#7145FF]/10 hover:border-[#7145FF]/30 transition cursor-pointer"
                              title="Edit Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCandidate(c.id)}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-xs font-sans">No registered candidates matched query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CORPORATE REGISTER (EMPLOYERS with General CRUD) */}
          {activeTab === 'Corporate' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans">
              
              <div className="bg-slate-950 border border-slate-805 p-5 rounded-2xl flex items-start gap-4 text-sm text-slate-355 bg-yellow-500/5">
                 <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                 <div className="space-y-0.5">
                   <h4 className="font-bold text-yellow-500 uppercase text-xs tracking-wider font-mono">Admin Corporate Management Isolation</h4>
                   <p className="text-slate-400 text-xs leading-relaxed">
                     Onload and adjust employer accounts manually. Deleting an employer tenant terminates all connected open job postings and application profiles cascade-wide immediately.
                   </p>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                <div className="space-y-1 font-sans">
                  <h3 className="font-bold text-white text-base">Employer Tenant Registries</h3>
                  <p className="text-xs text-slate-400">Total {employers.length} tenant corporations registered inside database exchange.</p>
                </div>
                <button 
                  onClick={openEmpCreate}
                  className="flex items-center gap-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-md shadow-[#7145FF]/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Onload Existing Employer
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-505 h-4.5 w-4.5" />
                <input 
                  type="text" 
                  placeholder="Filter through strategic employer tenants by business name or email..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#7145FF] transition-all text-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {filteredEmployers.map((emp: any) => (
                  <div key={emp.id} className="bg-slate-955 border border-slate-805 rounded-2xl overflow-hidden flex flex-col bg-slate-950 shadow-md">
                    <div className="p-5 border-b border-slate-800 flex items-start justify-between">
                      <div>
                        <p className="text-[9.5px] font-mono text-[#7145FF] mb-1 font-bold">TENANT_ID: #{emp.id}</p>
                        <h3 className="font-bold text-white text-base">{emp.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{emp.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => openEmpEdit(emp)}
                          className="p-2 bg-slate-900 text-[#a385ff] border border-slate-800 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                          title="Edit Employer Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployer(emp.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition cursor-pointer border border-red-500/25" 
                          title="Delete Employer Tenant"
                        >
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-900/30 flex-1">
                       <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">Published Corporate Postings ({emp.jobs_posted?.length || 0})</p>
                       
                       <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar font-sans">
                         {emp.jobs_posted?.map((job: any) => (
                           <div key={job.id} className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl text-xs space-y-2">
                             <div className="flex justify-between items-start">
                               <span className="font-bold text-white">{job.title}</span>
                               <span className="text-[9.5px] font-semibold text-slate-450 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">{job.location}</span>
                             </div>
                             <div className="text-slate-450 leading-relaxed p-2.5 bg-slate-900/40 rounded-lg border border-slate-850/40 divide-y divide-slate-800/10 max-h-24 overflow-y-auto">
                               <div dangerouslySetInnerHTML={{ __html: job.description }} />
                             </div>
                           </div>
                         ))}
                         {(!emp.jobs_posted || emp.jobs_posted.length === 0) && (
                           <p className="text-xs text-slate-550 italic pl-1">No active job listings deployed to exchange for this client.</p>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
                {filteredEmployers.length === 0 && (
                  <p className="col-span-2 text-slate-550 italic text-center p-8 bg-slate-950 border border-slate-800 rounded-xl">No employer tenants found matching search filter.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: MANUAL MATCHMAKER */}
          {activeTab === 'Matcher' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in font-sans">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-violet-400" />
                  Manual System Candidate-Employer Matcher
                </h3>
                <p className="text-xs text-slate-404 mt-1">
                  On-demand machine bypass. Select any onboarded candidate talent, choose an active job posting, and establish a high-fit match immediately in corporate recruitment loops.
                </p>
              </div>

              <form onSubmit={handleManualMatchSubmit} className="bg-slate-955 border border-slate-800 bg-slate-950/60 p-8 rounded-2xl space-y-6 shadow-xl">
                
                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-mono">
                    ⚠️ {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-mono">
                    ✨ {submitSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Candidate Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      1. Select Talent Candidate
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-200 cursor-pointer"
                      value={matchCandId}
                      onChange={(e) => setMatchCandId(e.target.value)}
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.professional_title || 'No Title'} - #{c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-405 font-mono block">
                      2. Select Open Job Post
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-200 cursor-pointer"
                      value={matchJobId}
                      onChange={(e) => setMatchJobId(e.target.value)}
                    >
                      <option value="">-- Choose Corporate Position --</option>
                      {jobs.map((j: any) => (
                        <option key={j.id} value={j.id}>
                          {j.title} at {j.company} (ID: #{j.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Match Score Slider */}
                <div className="space-y-3 p-4 bg-slate-900/40 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Assign Match Fit Score Performance
                    </label>
                    <span className="text-sm font-mono font-black text-violet-300">
                      {matchScore}% Fit Accuracy
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#7145FF]"
                    value={matchScore}
                    onChange={(e) => setMatchScore(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Moderate (50%)</span>
                    <span>Strong (75%)</span>
                    <span>Prime (100%)</span>
                  </div>
                </div>

                {/* Matched & Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-404 font-mono block">
                      Skills Matched Checklist
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-300 font-mono"
                      value={matchSkillsMatched}
                      onChange={(e) => setMatchSkillsMatched(e.target.value)}
                      placeholder="e.g. TypeScript, React Native, SQL"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-404 font-mono block">
                      Skills Missing Checklist
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-300 font-mono"
                      value={matchSkillsMissing}
                      onChange={(e) => setMatchSkillsMissing(e.target.value)}
                      placeholder="e.g. AWS, Kubernetes"
                    />
                  </div>
                </div>

                {/* Fit Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-404 font-mono block">
                    Fit Inference Summary Narrative
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-300"
                    value={matchFitSummary}
                    onChange={(e) => setMatchFitSummary(e.target.value)}
                    placeholder="Provide a quick analytical overview of compatibility..."
                  />
                </div>

                {/* Fit Recommendation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-404 font-mono block">
                    Administrative Actionable Advice
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-300"
                    value={matchRecommendation}
                    onChange={(e) => setMatchRecommendation(e.target.value)}
                    placeholder="Recommend next physical recruitment steps..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#7145FF] hover:bg-[#5b32e6] text-white p-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition shadow-lg shadow-[#7145FF]/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  Confirm Manual System Link Match <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* POPUP 1: CANDIDATE INSPECTOR SHOW PAGE */}
      <SuperadminCandidateInspector 
        inspectCandidate={inspectCandidate}
        setInspectCandidate={setInspectCandidate}
        inspectTab={inspectTab}
        setInspectTab={setInspectTab}
        interviews={interviews}
        onRefresh={onRefresh}
      />

      {/* POPUP 2: JOB MODAL */}
      <SuperadminJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        editingJob={editingJob}
        employers={employers}
        onSubmit={sendOverrideAction}
      />

      {/* POPUP 3: CANDIDATE MODAL */}
      <SuperadminCandidateModal
        isOpen={isCandModalOpen}
        onClose={() => setIsCandModalOpen(false)}
        editingCand={editingCand}
        onSubmit={sendOverrideAction}
      />

      {/* POPUP 4: EMPLOYER MODAL */}
      <SuperadminEmployerModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        editingEmp={editingEmp}
        onSubmit={sendOverrideAction}
      />

    </div>
  );
}
