'use client';

import { useState } from 'react';
import LaunchPathLogo from '@/components/LaunchPathLogo';
import { 
  ShieldAlert, 
  Users, 
  Building, 
  Activity, 
  ShieldBan, 
  RefreshCw, 
  Eye, 
  LayoutDashboard, 
  LogOut, 
  Briefcase, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Award,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';

export default function SuperadminDashboard({ 
  data, 
  user, 
  onRefresh, 
  onLogout 
}: { 
  data: any; 
  user: any; 
  onRefresh: () => void; 
  onLogout: () => void; 
}) {
  const { 
    candidates = [], 
    employers = [], 
    matches = [], 
    applications = [], 
    interviews = [], 
    stats = {} 
  } = data || {};

  const [activeTab, setActiveTab] = useState('Analytics');
  const [inspectCandidate, setInspectCandidate] = useState<any>(null);

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

  const handleDeleteEmployer = async (employerId: number) => {
    if (!confirm(`Are you sure you want to permanently delete Employer ID ${employerId}? This action cannot be undone.`)) return;

    try {
      const res = await fetch('/api/superadmin/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_EMPLOYER', payload: { employerId } })
      });
      if (res.ok) {
        onRefresh();
      } else {
        const errorData = await res.json();
        alert('Failed to delete employer: ' + errorData.error);
      }
    } catch (err: any) {
      alert('Error deleting employer: ' + err.message);
    }
  };

  // APPLICATION STATUS PIPELINE DATA
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

  // MATCH SKILLS DISTRIBUTIONS CATEGORIES
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
              onClick={() => { setActiveTab('Analytics'); setInspectCandidate(null); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                activeTab === 'Analytics' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className={`w-5 h-5 ${activeTab === 'Analytics' ? 'text-[#7145FF]' : ''}`} />
              <span>Platform Insights</span>
            </button>

            <button 
              onClick={() => { setActiveTab('Interviews'); setInspectCandidate(null); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                activeTab === 'Interviews' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'Interviews' ? 'text-[#7145FF]' : ''}`} />
              <span>Active Interviews</span>
            </button>

            <button 
              onClick={() => { setActiveTab('Talent'); setInspectCandidate(null); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                activeTab === 'Talent' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className={`w-5 h-5 ${activeTab === 'Talent' ? 'text-[#7145FF]' : ''}`} />
              <span>Talent Pool</span>
            </button>

            <button 
              onClick={() => { setActiveTab('Corporate'); setInspectCandidate(null); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                activeTab === 'Corporate' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building className={`w-5 h-5 ${activeTab === 'Corporate' ? 'text-[#7145FF]' : ''}`} />
              <span>Employer Index</span>
            </button>
          </nav>
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
            {activeTab === 'Talent' && 'LaunchPath Active Talent Directory'}
            {activeTab === 'Corporate' && 'Strategic Employer Tenant Index'}
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
            <div className="max-w-6xl mx-auto space-y-8">
              
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
                <button 
                  onClick={handleRescoreAll} 
                  className="flex items-center gap-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-[#7145FF]/10 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                  Force Global Match Audit
                </button>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">Registered Candidates</p>
                  <p className="text-3xl font-black text-white font-mono">{stats?.totalCandidates || 0}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">Employer Tenants</p>
                  <p className="text-3xl font-black text-white font-mono">{stats?.totalEmployers || 0}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">Initiated Interviews</p>
                  <p className="text-3xl font-black text-[#7145FF] font-mono">{stats?.totalInterviews || 0}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">Placement Success Rate</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-emerald-400 font-mono">{stats?.successRate || 0}%</p>
                    <span className="text-xs font-mono text-slate-550">Target 80%</span>
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
                      <p className="text-[11px] text-slate-505">Breakdown of applicant pipeline velocity and final placements.</p>
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
                      <p className="text-[11px] text-slate-505">Active machine matches grouped by structural similarity bands.</p>
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
                          axisLine={false} // removes default vertical line
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
                        <th className="py-3 px-2">Fit Quality</th>
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
                            <td className="py-3 px-2 text-center">
                              <span className="font-mono font-bold text-white">{score}%</span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                {score >= 85 ? 'PRIME' : score >= 70 ? 'STRONG MATCH' : score >= 50 ? 'AVERAGE' : 'LOW FIT'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {matches.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-xs text-slate-500 italic">
                            No match datasets created by candidate resume tasks yet.
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
                  <h3 className="font-bold text-white text-base">Operational Initiated Interviews</h3>
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

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
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
                            <span className="text-xs text-slate-500">{iv.candidate?.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white text-sm block">{iv.employer?.name || 'Platform Corp'}</span>
                            <span className="text-xs text-slate-500">{iv.employer?.email}</span>
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

          {/* TAB 3: TALENT LOGS */}
          {activeTab === 'Talent' && (
            <div className="max-w-6xl mx-auto bg-slate-950 border border-slate-805 rounded-2xl overflow-hidden shadow-lg animate-fade-in">
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                 <h3 className="font-bold text-white flex items-center gap-2">Platform Talent Directory</h3>
                 <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                   {candidates?.length || 0} Registered Candidates
                 </span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#7145FF]/5 border-b border-slate-805">
                   <tr className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                     <th className="px-6 py-3.5">ID</th>
                     <th className="px-6 py-3.5">Candidate Identity</th>
                     <th className="px-6 py-3.5">Professional Title & Level</th>
                     <th className="px-6 py-3.5 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                  {candidates?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-[#7145FF]/5 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-650">#{c.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-sm">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-300">{c.professional_title || 'No Title Listed'}</p>
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#7145FF] bg-[#7145FF]/10 px-2.5 py-0.5 rounded mt-1.5 inline-block border border-[#7145FF]/15">
                          {c.experience_level || 'ENTRY-LEVEL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => setInspectCandidate(c)}
                           className="text-xs bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 ml-auto cursor-pointer font-bold transition"
                         >
                           <Eye className="w-3.5 h-3.5 text-[#7145FF]" /> Inspect Payload
                         </button>
                      </td>
                    </tr>
                  ))}
                  {(!candidates || candidates.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic text-xs">No registered candidates in system registry.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CORPORATE REGISTER (EMPLOYERS) */}
          {activeTab === 'Corporate' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-slate-950 border border-slate-805 p-5 rounded-2xl flex items-start gap-4 text-sm text-slate-350 bg-yellow-500/5">
                 <ShieldAlert className="w-5 h-5 text-yellow-550 flex-shrink-0 mt-0.5" />
                 <div className="space-y-0.5">
                   <h4 className="font-bold text-yellow-450 uppercase text-xs tracking-wider">Operational Isolation Level Indicator</h4>
                   <p className="text-slate-400 text-xs">
                     You are viewing isolated multi-tenant corporate employer tenants. Employer accounts containment ensures safe isolation; however, deleting a tenant terminates all connected job definitions and applicant profiles cascade-wide.
                   </p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {employers?.map((emp: any) => (
                  <div key={emp.id} className="bg-slate-955 border border-slate-805 rounded-2xl overflow-hidden flex flex-col bg-slate-950">
                    <div className="p-5 border-b border-slate-800 flex items-start justify-between">
                      <div>
                        <p className="text-[9.5px] font-mono text-[#7145FF] mb-1 font-bold">TENANT_ID: #{emp.id}</p>
                        <h3 className="font-bold text-white text-base">{emp.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{emp.email}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteEmployer(emp.id)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition cursor-pointer border border-red-500/20" 
                        title="Delete Employer Tenant"
                      >
                        <ShieldBan className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 bg-slate-900/30 flex-1">
                       <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">Published Corporate Postings ({emp.jobs_posted?.length || 0})</p>
                       
                       <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                         {emp.jobs_posted?.map((job: any) => (
                           <div key={job.id} className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl text-xs space-y-2">
                             <div className="flex justify-between items-start">
                               <span className="font-bold text-white">{job.title}</span>
                               <span className="text-[9.5px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">{job.location}</span>
                             </div>
                             <div className="text-slate-450 leading-relaxed font-normal p-2.5 bg-slate-905 rounded-lg border border-slate-850/40 divide-y divide-slate-800/10 max-h-24 overflow-y-auto">
                               <div dangerouslySetInnerHTML={{ __html: job.description }} />
                             </div>
                           </div>
                         ))}
                         {(!emp.jobs_posted || emp.jobs_posted.length === 0) && (
                           <p className="text-xs text-slate-500 italic pl-1">No active job listings deployed to exchange for this client.</p>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
                {(!employers || employers.length === 0) && (
                  <p className="col-span-2 text-slate-500 italic text-center p-8 bg-slate-950 border border-slate-800 rounded-xl">No active employer profiles created.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Candidate Inspector Modal */}
        {inspectCandidate && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-90 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl bg-slate-905 border border-slate-800 rounded-2xl">
              <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#7145FF]" />
                  Resume Payload Inspection: {inspectCandidate.name}
                </h3>
                <button 
                  onClick={() => setInspectCandidate(null)}
                  className="text-slate-400 hover:text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
              <div className="p-6 overflow-y-auto min-h-0 space-y-6 bg-slate-900">
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7145FF] mb-2.5">System Parsed Document Metadata</p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {inspectCandidate.resume_text || 'NO_PHYSICAL_PAYLOAD_DEPLOYED'}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-850 bg-slate-950 flex justify-end">
                <button 
                  onClick={() => setInspectCandidate(null)} 
                  className="px-4 py-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Confirm Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
