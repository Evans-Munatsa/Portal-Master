'use client';

import { useState, useEffect } from 'react';
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
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Settings2,
  ArrowRight,
  Lock,
  Mail,
  FileText,
  Check,
  Search,
  Sliders,
  DollarSign,
  MapPin,
  X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
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
    jobs = [],
    matches = [], 
    applications = [], 
    interviews = [], 
    stats = {} 
  } = data || {};

  const [activeTab, setActiveTab] = useState('Analytics');
  const [inspectCandidate, setInspectCandidate] = useState<any>(null);
  const [inspectTab, setInspectTab] = useState('profile');

  // Search local states
  const [searchQuery, setSearchQuery] = useState('');

  // 1. JOB MODAL STATES
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobSalaryMin, setJobSalaryMin] = useState('');
  const [jobSalaryMax, setJobSalaryMax] = useState('');
  const [jobEmployerId, setJobEmployerId] = useState('');
  const [jobYearsExperience, setJobYearsExperience] = useState('');
  const [jobMandatorySkills, setJobMandatorySkills] = useState('');
  const [jobTechStack, setJobTechStack] = useState('');
  const [jobStatus, setJobStatus] = useState('ACTIVE');

  // 2. CANDIDATE MODAL STATES
  const [isCandModalOpen, setIsCandModalOpen] = useState(false);
  const [editingCand, setEditingCand] = useState<any>(null);
  const [candEmail, setCandEmail] = useState('');
  const [candPassword, setCandPassword] = useState('');
  const [candName, setCandName] = useState('');
  const [candProfessionalTitle, setCandProfessionalTitle] = useState('');
  const [candExperienceLevel, setCandExperienceLevel] = useState('INTERMEDIATE');
  const [candResumeText, setCandResumeText] = useState('');
  const [candLinkedinUrl, setCandLinkedinUrl] = useState('');
  const [candGithubUrl, setCandGithubUrl] = useState('');

  // 3. EMPLOYER MODAL STATES
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empName, setEmpName] = useState('');

  // 4. MANUAL MATCH STATES
  const [matchCandId, setMatchCandId] = useState('');
  const [matchJobId, setMatchJobId] = useState('');
  const [matchScore, setMatchScore] = useState(90);
  const [matchSkillsMatched, setMatchSkillsMatched] = useState('React, TypeScript, Next.js, Engineering leadership');
  const [matchSkillsMissing, setMatchSkillsMissing] = useState('Advanced Cloud Architecture (AWS/GCP)');
  const [matchRecommendation, setMatchRecommendation] = useState('Strong operational fit with candidate experience background');
  const [matchFitSummary, setMatchFitSummary] = useState('Candidate is recommended for quick hiring screen in alignment with core stack requirements.');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Auto pre-fill company name if employer is selected
  useEffect(() => {
    if (jobEmployerId) {
      const matchedEmployer = employers.find((e: any) => String(e.id) === String(jobEmployerId));
      if (matchedEmployer) {
        setJobCompany(matchedEmployer.name || '');
      }
    }
  }, [jobEmployerId, employers]);

  // Handle Tab changes & state resets
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery('');
    setInspectCandidate(null);
    setSubmitError('');
    setSubmitSuccess('');
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

  // GENERAL SUBMIT UTILITY
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
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobDescription('');
    setJobSalaryMin('');
    setJobSalaryMax('');
    setJobEmployerId(employers[0]?.id ? String(employers[0].id) : '');
    setJobYearsExperience('');
    setJobMandatorySkills('');
    setJobTechStack('');
    setJobStatus('ACTIVE');
    setSubmitError('');
    setSubmitSuccess('');
    setIsJobModalOpen(true);
  };

  const openJobEdit = (job: any) => {
    setEditingJob(job);
    setJobTitle(job.title || '');
    setJobCompany(job.company || '');
    setJobLocation(job.location || '');
    setJobDescription(job.description || '');
    setJobSalaryMin(job.salary_min ? String(job.salary_min) : '');
    setJobSalaryMax(job.salary_max ? String(job.salary_max) : '');
    setJobEmployerId(job.employer_id ? String(job.employer_id) : '');
    setJobYearsExperience(job.years_experience || '');
    setJobMandatorySkills(Array.isArray(job.mandatory_skills) ? job.mandatory_skills.join(', ') : '');
    setJobTechStack(Array.isArray(job.tech_stack) ? job.tech_stack.join(', ') : '');
    setJobStatus(job.status || 'ACTIVE');
    setSubmitError('');
    setSubmitSuccess('');
    setIsJobModalOpen(true);
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobLocation || !jobDescription) {
      setSubmitError('Required attributes: Title, Location, and Description');
      return;
    }

    const payload = {
      id: editingJob?.id,
      title: jobTitle,
      company: jobCompany || 'Strategic Client Partner',
      location: jobLocation,
      description: jobDescription,
      salary_min: jobSalaryMin ? parseInt(jobSalaryMin) : null,
      salary_max: jobSalaryMax ? parseInt(jobSalaryMax) : null,
      employer_id: jobEmployerId ? parseInt(jobEmployerId) : null,
      years_experience: jobYearsExperience,
      mandatory_skills: jobMandatorySkills,
      tech_stack: jobTechStack,
      status: jobStatus
    };

    const action = editingJob ? 'UPDATE_JOB' : 'CREATE_JOB';
    const result = await sendOverrideAction(action, payload);
    if (result.success) {
      setTimeout(() => setIsJobModalOpen(false), 1200);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to permanently delete this job post? This action is immediate.')) return;
    await sendOverrideAction('DELETE_JOB', { jobId });
  };

  // CANDIDATE OPERATIONS
  const openCandCreate = () => {
    setEditingCand(null);
    setCandEmail('');
    setCandPassword('');
    setCandName('');
    setCandProfessionalTitle('');
    setCandExperienceLevel('INTERMEDIATE');
    setCandResumeText('');
    setCandLinkedinUrl('');
    setCandGithubUrl('');
    setSubmitError('');
    setSubmitSuccess('');
    setIsCandModalOpen(true);
  };

  const openCandEdit = (cand: any) => {
    setEditingCand(cand);
    setCandEmail(cand.email || '');
    setCandPassword(''); // Leave blank to skip password change
    setCandName(cand.name || '');
    setCandProfessionalTitle(cand.professional_title || '');
    setCandExperienceLevel(cand.experience_level || 'INTERMEDIATE');
    setCandResumeText(cand.resume_text || '');
    setCandLinkedinUrl(cand.linkedin_url || '');
    setCandGithubUrl(cand.github_url || '');
    setSubmitError('');
    setSubmitSuccess('');
    setIsCandModalOpen(true);
  };

  const handleCandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candEmail || (!editingCand && !candPassword)) {
      setSubmitError('Email and Password are required');
      return;
    }

    const payload = {
      id: editingCand?.id,
      email: candEmail,
      password: candPassword,
      name: candName,
      professional_title: candProfessionalTitle,
      experience_level: candExperienceLevel,
      resume_text: candResumeText,
      linkedin_url: candLinkedinUrl,
      github_url: candGithubUrl
    };

    const action = editingCand ? 'UPDATE_CANDIDATE' : 'CREATE_CANDIDATE';
    const result = await sendOverrideAction(action, payload);
    if (result.success) {
      setTimeout(() => setIsCandModalOpen(false), 1200);
    }
  };

  const handleDeleteCandidate = async (candidateId: number) => {
    if (!confirm('Confirm deletion of Candidate profile? This deletes connected applications and resume texts.')) return;
    await sendOverrideAction('DELETE_CANDIDATE', { candidateId });
  };

  // EMPLOYER OPERATIONS
  const openEmpCreate = () => {
    setEditingEmp(null);
    setEmpEmail('');
    setEmpPassword('');
    setEmpName('');
    setSubmitError('');
    setSubmitSuccess('');
    setIsEmpModalOpen(true);
  };

  const openEmpEdit = (emp: any) => {
    setEditingEmp(emp);
    setEmpEmail(emp.email || '');
    setEmpPassword('');
    setEmpName(emp.name || '');
    setSubmitError('');
    setSubmitSuccess('');
    setIsEmpModalOpen(true);
  };

  const handleEmpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empEmail || (!editingEmp && !empPassword)) {
      setSubmitError('Email and Password are required');
      return;
    }

    const payload = {
      id: editingEmp?.id,
      email: empEmail,
      password: empPassword,
      name: empName
    };

    const action = editingEmp ? 'UPDATE_EMPLOYER' : 'CREATE_EMPLOYER';
    const result = await sendOverrideAction(action, payload);
    if (result.success) {
      setTimeout(() => setIsEmpModalOpen(false), 1200);
    }
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
      // reset selections
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

  return (
    <div className="w-full h-screen bg-slate-900 flex overflow-hidden font-sans text-slate-300">
      
      {/* Sidebar navigation aligned with LaunchPath brand style guide */}
      <aside className="w-70 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg id-analytics-tab transition-all font-medium ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg id-interviews-tab transition-all font-medium ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg id-jobs-tab transition-all font-medium ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg id-talent-tab transition-all font-medium ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg id-corp-tab transition-all font-medium ${
                activeTab === 'Corporate' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building className={`w-5 h-5 ${activeTab === 'Corporate' ? 'text-[#7145FF]' : ''}`} />
              <span>Employer Pool</span>
            </button>

            <button 
              onClick={() => handleTabChange('Matcher')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg id-matcher-tab transition-all font-medium ${
                activeTab === 'Matcher' 
                  ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/35 shadow-sm shadow-[#7145FF]/10 shadow-radial' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className={`w-5 h-5 ${activeTab === 'Matcher' ? 'text-violet-300' : ''}`} />
              <span className="flex-1">Manual Matchmaker</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-450 animate-pulse" />
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
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Open Job Posts</p>
                  <p className="text-3xl font-black text-[#7145FF] font-mono">{stats?.totalJobs || 0}</p>
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
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base font-sans">Operational Initiated Interviews</h3>
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

          {/* TAB 3: JOBS INDEX (With Full CRUD) */}
          {activeTab === 'Jobs' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-lg font-sans">Open Jobs Registry Operations</h3>
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
                <Search className="absolute left-3.5 top-3.5 text-slate-500 h-4.5 w-4.5" />
                <input 
                  type="text" 
                  placeholder="Filter through global open job postings by title, company, or specifications..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#7145FF] transition-all text-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="bg-slate-950 border border-slate-805 rounded-2xl overflow-hidden shadow-lg">
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
                              <p className="text-slate-500 font-mono text-[10px]">{job.employer.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Unassigned (Native Admin Role)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            job.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {job.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button 
                              onClick={() => openJobEdit(job)}
                              className="p-1.5 hover:bg-[#7145FF]/20 text-[#a385ff] rounded-lg border border-[#7145FF]/10 hover:border-[#7145FF]/30 transition"
                              title="Edit Job Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition"
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
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-xs">
                          No matching active job postings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TALENT LOGS (With Candidate CRUD) */}
          {activeTab === 'Talent' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                 <div className="space-y-1">
                   <h3 className="font-bold text-white text-lg font-sans">Platform Talent Directory Operations</h3>
                   <p className="text-xs text-slate-400">
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
                <Search className="absolute left-3.5 top-3.5 text-slate-500 h-4.5 w-4.5" />
                <input 
                  type="text" 
                  placeholder="Filter through candidate talents by name, email, credentials, or experience..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#7145FF] transition-all text-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="bg-slate-950 border border-slate-805 rounded-2xl overflow-hidden shadow-lg">
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
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          <p className="text-xs text-slate-450 font-mono">{c.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-300">{c.professional_title || 'No Title Listed'}</p>
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#7145FF] bg-[#7145FF]/10 px-2.5 py-0.5 rounded mt-1.5 inline-block border border-[#7145FF]/15 font-mono">
                            {c.experience_level || 'ENTRY-LEVEL'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
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
                          <div className="flex items-center gap-2 justify-end">
                            <button 
                              onClick={() => { setInspectCandidate(c); setInspectTab('profile'); }}
                              className="text-xs bg-[#7145FF]/10 hover:bg-[#7145FF]/20 text-[#a385ff] px-3.5 py-1.5 rounded-xl border border-[#7145FF]/20 flex items-center gap-1 cursor-pointer transition font-mono"
                              title="Inspect Candidate Show Page"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#a385ff]" /> INSPECT PROFILE
                            </button>
                            <button 
                              onClick={() => openCandEdit(c)}
                              className="p-1.5 hover:bg-[#7145FF]/20 text-[#a385ff] rounded-lg border border-[#7145FF]/10 hover:border-[#7145FF]/30 transition"
                              title="Edit Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCandidate(c.id)}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition"
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
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-xs">No registered candidates matched query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CORPORATE REGISTER (EMPLOYERS with General CRUD) */}
          {activeTab === 'Corporate' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              
              <div className="bg-slate-950 border border-slate-805 p-5 rounded-2xl flex items-start gap-4 text-sm text-slate-355 bg-yellow-500/5">
                 <ShieldAlert className="w-5 h-5 text-yellow-550 flex-shrink-0 mt-0.5" />
                 <div className="space-y-0.5">
                   <h4 className="font-bold text-yellow-450 uppercase text-xs tracking-wider">Admin Corporate Management Isolation</h4>
                   <p className="text-slate-400 text-xs">
                     Onload and adjust employer accounts manually. Deleting an employer tenant terminates all connected open job postings and application profiles cascade-wide immediately.
                   </p>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base font-sans">Employer Tenant Registries</h3>
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
                <Search className="absolute left-3.5 top-3.5 text-slate-500 h-4.5 w-4.5" />
                <input 
                  type="text" 
                  placeholder="Filter through strategic employer tenants by business name or email..." 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#7145FF] transition-all text-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEmployers.map((emp: any) => (
                  <div key={emp.id} className="bg-slate-955 border border-slate-805 rounded-2xl overflow-hidden flex flex-col bg-slate-950 shadow-md">
                    <div className="p-5 border-b border-slate-800 flex items-start justify-between">
                      <div>
                        <p className="text-[9.5px] font-mono text-[#7145FF] mb-1 font-bold">TENANT_ID: #{emp.id}</p>
                        <h3 className="font-bold text-white text-base">{emp.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{emp.email}</p>
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
                       
                       <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
                  <p className="col-span-2 text-slate-500 italic text-center p-8 bg-slate-950 border border-slate-800 rounded-xl">No employer tenants found matching search filter.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: MANUAL MATCHMAKER */}
          {activeTab === 'Matcher' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-violet-400" />
                  Manual System Candidate-Employer Matcher
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  On-demand machine bypass. Select any onboarded candidate talent, choose an active job posting, and establish a high-fit match immediately in corporate recruitment loops.
                </p>
              </div>

              <form onSubmit={handleManualMatchSubmit} className="bg-slate-955 border border-slate-800 bg-slate-950/60 p-8 rounded-2xl space-y-6 shadow-xl">
                
                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                    ⚠️ {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
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
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-200"
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      2. Select Open Job Post
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#7145FF] text-slate-200"
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
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
                  className="w-full bg-gradient-to-r from-[#7145FF] to-[#8d69ff] hover:from-[#5c31e6] hover:to-[#7145FF] text-white p-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition shadow-lg shadow-[#7145FF]/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  Confirm Manual System Link Match <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 1. JOB MODAL (CREATE / EDIT) */}
        {isJobModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-90 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl animate-scale-in">
              <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-950">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider">
                  <Briefcase className="w-4 h-4 text-[#7145FF]" />
                  {editingJob ? `Modify Job Posting #${editingJob.id}` : 'Deploy New Job Posting'}
                </h3>
                <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJobSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                    {submitSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Job Title *</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Assign Employer Tenant *</label>
                    <select
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobEmployerId}
                      onChange={(e) => setJobEmployerId(e.target.value)}
                    >
                      <option value="">No Active Employer Selection</option>
                      {employers.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Corporate Business Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      placeholder="Leave blank to auto-prefill from selected employer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Physical Location *</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="e.g. Johannesburg / Hybrid"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Salary Minimum (ZAR)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobSalaryMin}
                      onChange={(e) => setJobSalaryMin(e.target.value)}
                      placeholder="e.g. 60000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Salary Maximum (ZAR)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobSalaryMax}
                      onChange={(e) => setJobSalaryMax(e.target.value)}
                      placeholder="e.g. 110000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Experience Requirements</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={jobYearsExperience}
                      onChange={(e) => setJobYearsExperience(e.target.value)}
                      placeholder="e.g. 5+ Years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Mandatory Skills (Comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                      value={jobMandatorySkills}
                      onChange={(e) => setJobMandatorySkills(e.target.value)}
                      placeholder="React, Node.js, SQL"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Other Tech Stack (Comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                      value={jobTechStack}
                      onChange={(e) => setJobTechStack(e.target.value)}
                      placeholder="Tailwind, Docker, AWS"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Publish Scope Status</label>
                  <select
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE (Open to applications)</option>
                    <option value="PENDING">PENDING (Draft review)</option>
                    <option value="CLOSED">CLOSED (De-listed)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block font-sans">Full Job Description (HTML / text) *</label>
                  <textarea 
                    rows={5}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Detail core duties, technology stacks, benefits, and specifications..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 bg-slate-950/20">
                  <button 
                    type="button" 
                    onClick={() => setIsJobModalOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition cursor-pointer font-bold"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {editingJob ? 'Update Profile' : 'Publish to Exchange'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. CANDIDATE MODAL (CREATE / EDIT) */}
        {isCandModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-90 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl animate-scale-in">
              <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-950">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider">
                  <Users className="w-4 h-4 text-[#7145FF]" />
                  {editingCand ? `Edit Candidate: ${editingCand.name}` : 'Onload New Talent Candidate'}
                </h3>
                <button onClick={() => setIsCandModalOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCandSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                    {submitSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Email Address *</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={candEmail}
                      onChange={(e) => setCandEmail(e.target.value)}
                      placeholder="candidate@workplace.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">
                      {editingCand ? 'Password (Leave blank to keep same)' : 'Secure Password *'}
                    </label>
                    <input 
                      type="password" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={candPassword}
                      onChange={(e) => setCandPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Candidate Human Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={candName}
                      onChange={(e) => setCandName(e.target.value)}
                      placeholder="e.g. Jane Foster"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Professional Designation</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      value={candProfessionalTitle}
                      onChange={(e) => setCandProfessionalTitle(e.target.value)}
                      placeholder="e.g. Lead React Developer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Experience Group Level</label>
                  <select
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                    value={candExperienceLevel}
                    onChange={(e) => setCandExperienceLevel(e.target.value)}
                  >
                    <option value="ENTRY">ENTRY (0-2 Years)</option>
                    <option value="INTERMEDIATE">INTERMEDIATE (2-5 Years)</option>
                    <option value="SENIOR">SENIOR (5-8 Years)</option>
                    <option value="LEAD">LEAD / PRINCIPAL (8+ Years)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">LinkedIn Profile URL</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                      value={candLinkedinUrl}
                      onChange={(e) => setCandLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/jane-foster"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">GitHub Profile URL</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                      value={candGithubUrl}
                      onChange={(e) => setCandGithubUrl(e.target.value)}
                      placeholder="https://github.com/janefoster328"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block font-sans">System Parsed Resume Raw Text Document</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed"
                    value={candResumeText}
                    onChange={(e) => setCandResumeText(e.target.value)}
                    placeholder="Enter resume text summary used for structural system matching calculations..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 bg-slate-950/20">
                  <button 
                    type="button" 
                    onClick={() => setIsCandModalOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {editingCand ? 'Save Profile' : 'Onload Candidate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. EMPLOYER MODAL (CREATE / EDIT) */}
        {isEmpModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-90 w-full max-w-md overflow-hidden flex flex-col shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl animate-scale-in">
              <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-950">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider">
                  <Building className="w-4 h-4 text-[#7145FF]" />
                  {editingEmp ? `Edit Employer: ${editingEmp.name}` : 'Onload Corporate Employer'}
                </h3>
                <button onClick={() => setIsEmpModalOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEmpSubmit} className="p-6 space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                    {submitSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Tenant Organization / Corporate Name *</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Standard Bank Group"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Tenant Root Corporate Email *</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="recruitment@corporate.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">
                    {editingEmp ? 'Password (Leave blank to keep same)' : 'Secure Password *'}
                  </label>
                  <input 
                    type="password" 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 bg-slate-950/20">
                  <button 
                    type="button" 
                    onClick={() => setIsEmpModalOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {editingEmp ? 'Save Profile' : 'Onload Employer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Candidate Inspector Modal (Modern Show Page) */}
        {inspectCandidate && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800 rounded-3xl animate-scale-in">
              
              {/* Header block with candidate branding */}
              <div className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7145FF] to-indigo-500 flex items-center justify-center text-lg font-mono font-black text-white border border-[#7145FF]/30 select-none shadow-lg shadow-[#7145FF]/10">
                    {inspectCandidate.name?.substring(0, 2).toUpperCase() || 'CD'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      {inspectCandidate.name}
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 bg-[#7145FF]/10 border border-[#7145FF]/30 rounded text-[#a385ff] font-extrabold shadow-sm animate-pulse">
                        #{inspectCandidate.id}
                      </span>
                    </h2>
                    <p className="text-sm font-semibold text-slate-400 mt-0.5">{inspectCandidate.professional_title || 'Software Candidate'}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {inspectCandidate.email}
                      </span>
                      {inspectCandidate.experience_level && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 border border-slate-700/60 rounded text-slate-300 font-mono text-[10.5px]">
                          EXP: {inspectCandidate.experience_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* External links and state trackers */}
                <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
                  {inspectCandidate.linkedin_url && (
                    <a 
                      href={inspectCandidate.linkedin_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-550/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition font-mono"
                    >
                      LinkedIn <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {inspectCandidate.github_url && (
                    <a 
                      href={inspectCandidate.github_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/25 text-pink-405 border border-pink-550/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition font-mono"
                    >
                      GitHub <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button 
                    onClick={() => setInspectCandidate(null)}
                    className="p-2 border border-slate-800 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition cursor-pointer font-bold ml-1"
                    title="Close Inspect Profile"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation within the candidate inspection portal */}
              <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setInspectTab('profile')}
                  className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                    inspectTab === 'profile'
                      ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                      : 'text-slate-450 hover:text-slate-200 hover:bg-slate-855'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-400" /> RESUME PAYLOAD
                </button>
                
                <button
                  onClick={() => setInspectTab('video')}
                  className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 relative ${
                    inspectTab === 'video'
                      ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                      : 'text-slate-450 hover:text-slate-200 hover:bg-slate-855'
                  }`}
                >
                  <Activity className="w-4 h-4 text-violet-400" /> 
                  VIDEO READINESS 
                  {inspectCandidate.video_interviews?.length > 0 && (
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute top-1 right-2" />
                  )}
                </button>

                <button
                  onClick={() => setInspectTab('matches')}
                  className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                    inspectTab === 'matches'
                      ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                      : 'text-slate-450 hover:text-slate-200 hover:bg-slate-855'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-blue-400" /> POSITION MATCHES ({inspectCandidate.job_matches?.length || 0})
                </button>

                <button
                  onClick={() => setInspectTab('pipeline')}
                  className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                    inspectTab === 'pipeline'
                      ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                      : 'text-slate-450 hover:text-slate-200 hover:bg-slate-855'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-400" /> HIRING PIPELINE
                </button>
              </div>

              {/* Core Panels Wrapper */}
              <div className="flex-1 overflow-y-auto p-8 min-h-0 bg-slate-900 space-y-6">

                {/* PANEL 1: PROFILE & PARSED RESUME TEXT */}
                {inspectTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Basic details cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Candidate Designation</span>
                        <p className="text-white font-bold text-sm mt-1">{inspectCandidate.professional_title || 'General Software Architect'}</p>
                      </div>
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Email Authentication</span>
                        <p className="text-white font-bold text-sm mt-1">{inspectCandidate.email || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Resume Processing Tasks</span>
                        <div className="mt-1 flex items-center gap-2">
                          {inspectCandidate.resume_tasks && inspectCandidate.resume_tasks.length > 0 ? (
                            (() => {
                              const task = inspectCandidate.resume_tasks[0];
                              let taskColor = "text-yellow-405";
                              if (task.status === 'COMPLETED') taskColor = "text-emerald-400";
                              else if (task.status === 'FAILED') taskColor = "text-red-400";
                              return (
                                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${taskColor}`}>
                                  {task.status} ({task.progress}%)
                                </span>
                              );
                            })()
                          ) : (
                            <span className="text-xs text-slate-500 italic font-mono">No tasks queued</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Full text parsed from resume PDF uploads */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-950/10 p-1 rounded-lg">
                        <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#7145FF]">System Parsed Resume Text Content</h4>
                        <button 
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.navigator && window.navigator.clipboard) {
                              window.navigator.clipboard.writeText(inspectCandidate.resume_text || '');
                              alert('Resume text copied to clipboard successfully!');
                            }
                          }} 
                          type="button"
                          className="text-[10px] font-mono font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded transition max-w-max cursor-pointer"
                        >
                          COPY TO CLIPBOARD
                        </button>
                      </div>
                      
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 text-xs text-emerald-400/90 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-slate-800 scrolling-touch select-text">
                        {inspectCandidate.resume_text || 'NO_PHYSICAL_RESUME_PAYLOAD_DEPLOYED_FOR_MATCHING'}
                      </div>

                      <p className="text-[10.5px] italic text-slate-400 text-center leading-normal">
                        This text document matches standard embeddings extracted upon initial upload. Secure recruitment policies apply under South African POPIA regulations.
                      </p>
                    </div>
                  </div>
                )}

                {/* PANEL 2: VIDEO INTERVIEW & READINESS */}
                {inspectTab === 'video' && (
                  <div className="space-y-6 animate-fade-in">
                    {(() => {
                      const readiness = inspectCandidate.video_interviews?.[0];
                      if (!readiness) {
                        return (
                          <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl p-8 space-y-4">
                            <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-650">
                              <ShieldAlert className="w-8 h-8 text-slate-500" />
                            </div>
                            <div className="max-w-md mx-auto space-y-1.5">
                              <h3 className="font-bold text-white text-base">Video Interview Incomplete</h3>
                              <p className="text-xs text-slate-450 leading-relaxed">
                                This candidate has not recorded their video interview or completed their initial readiness screen yet. Remind them to complete it via their profile settings.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Else, render the video readiness report
                      let scoresColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
                      if (readiness.score < 55) scoresColor = "text-red-400 border-red-500/20 bg-red-500/5";
                      else if (readiness.score < 75) scoresColor = "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";

                      let parsedQuestions: any[] = [];
                      try {
                        parsedQuestions = typeof readiness.questions === 'string' 
                          ? JSON.parse(readiness.questions) 
                          : (readiness.questions || []);
                      } catch (e) {
                        parsedQuestions = [];
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                          
                          {/* Video player and general details */}
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Candidate Stream Presentation Recording</span>
                              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative shadow-lg">
                                <video 
                                  controls 
                                  src={readiness.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-man-delivering-presentation-on-a-screen-40331-large.mp4'} 
                                  className="w-full h-full object-cover"
                                  poster="https://picsum.photos/seed/recruitment-review/800/450"
                                />
                              </div>
                            </div>

                            <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-850 space-y-2.5">
                              <div className="flex justify-between items-center font-mono">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Overall Readiness Quotient</span>
                                <span className={`text-sm font-bold px-2.5 py-0.5 rounded border ${scoresColor}`}>
                                  {readiness.score}% Rating
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#7145FF] to-indigo-500 transition-all duration-300" 
                                  style={{ width: `${readiness.score}%` }}
                                />
                              </div>
                            </div>

                            {/* Recruiter Coaching Comment */}
                            <div className="p-5 bg-[#7145FF]/5 rounded-2xl border border-[#7145FF]/15 space-y-2">
                              <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest block">AI Evaluator / Recruiter Coaching Feedback</span>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">{readiness.feedback || 'Coaching diagnostics pending evaluation.'}</p>
                            </div>
                          </div>

                          {/* Answers and speech transcripts */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-800/80 pb-2">Readiness Speech Transcripts ({parsedQuestions.length})</span>
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                              {parsedQuestions.map((q: any, qi: number) => (
                                <div key={q.id || qi} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3 text-xs animate-fade-in">
                                  <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 font-semibold text-slate-200">
                                    <span>Q0{q.id || qi + 1}: {q.title}</span>
                                    <span className="text-[10px] font-mono text-[#a385ff] font-extrabold uppercase bg-[#7145FF]/10 px-2.5 py-0.5 border border-[#7145FF]/20 rounded-full">
                                      {q.questionScore || q.score || q.question_score || 0}% Score
                                    </span>
                                  </div>
                                  <p className="italic text-slate-350 leading-relaxed p-3 bg-slate-100/5 border border-slate-800/60 rounded-xl leading-relaxed">
                                    &ldquo;{q.transcript || 'No transcript generated for this response.'}&rdquo;
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* PANEL 3: POSITION MATCHES MATRIX */}
                {inspectTab === 'matches' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center bg-slate-950/40 p-4 border border-slate-805 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-white text-sm">Targeted Compatibility Matrix</h4>
                        <p className="text-xs text-slate-400 mt-1">Cross-referencing candidate qualifications with live system open position mandates.</p>
                      </div>
                      <span className="px-2.5 py-0.5 font-mono text-[10px] font-extrabold bg-[#7145FF]/10 text-[#a385ff] rounded border border-[#7145FF]/20">
                        Matches found: {inspectCandidate.job_matches?.length || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {inspectCandidate.job_matches && inspectCandidate.job_matches.length > 0 ? (
                        inspectCandidate.job_matches.map((m: any, idx: number) => {
                          const score = m.match_score;
                          let progressColor = "bg-[#7145FF]";
                          let badgeStyle = "bg-[#7145FF]/10 text-white border-[#7145FF]/20";
                          if (score >= 85) {
                            progressColor = "bg-emerald-500";
                            badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                          } else if (score < 60) {
                            progressColor = "bg-slate-500";
                            badgeStyle = "bg-slate-800 text-slate-400 border-slate-700";
                          }

                          return (
                            <div key={m.id || idx} className="bg-slate-950/50 border border-slate-850 rounded-2xl overflow-hidden p-5 flex flex-col space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Computed compatibility</span>
                                  <h4 className="font-bold text-white text-sm mt-0.5">{m.job?.title || 'External Matching Task'}</h4>
                                  <p className="text-xs text-[#a385ff] font-semibold">{m.job?.company || 'LaunchPath Network'}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 font-mono font-extrabold rounded-full border text-xs ${badgeStyle}`}>
                                  {score}% Fit
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full ${progressColor}`} style={{ width: `${score}%` }} />
                                </div>
                              </div>

                              {/* Skills alignment */}
                              <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                                <div className="space-y-1">
                                  <span className="font-bold font-mono tracking-wide text-emerald-400 uppercase text-[9.5px]">Matched Skills</span>
                                  <p className="text-slate-355 p-2 bg-slate-900/40 border border-slate-850 rounded-xl min-h-12 leading-relaxed font-mono">
                                    {m.matched_skills || 'No skills mapped'}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold font-mono tracking-wide text-red-400 uppercase text-[9.5px]">Missing Skills</span>
                                  <p className="text-slate-355 p-2 bg-slate-900/40 border border-slate-850 rounded-xl min-h-12 leading-relaxed font-mono">
                                    {m.missing_skills || 'None (100% Fit Alignment)'}
                                  </p>
                                </div>
                              </div>

                              {/* Analytical summaries */}
                              <div className="space-y-2 pt-2 border-t border-slate-850 text-xs">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block">Fit Summary Inference</span>
                                  <p className="text-slate-300 leading-relaxed font-medium">{m.fit_summary || 'Fit synthesis pending.'}</p>
                                </div>
                                <div className="space-y-0.5 pt-1.5 border-t border-slate-850/60">
                                  <span className="font-bold text-[#a385ff] uppercase text-[9px] tracking-wider block">Recruitment Advice</span>
                                  <p className="text-slate-300 italic">{m.recommendation || 'Recommendation pipeline pending.'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-12 bg-slate-950/10 border border-dashed border-slate-800 rounded-3xl p-6">
                          <p className="text-xs text-slate-500 italic">No direct position matching embeddings generated inside database yet. Run force-rescore or create manual linkages inside manual Matchmaker panel.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PANEL 4: HIRING PIPELINE & APPLICATIONS */}
                {inspectTab === 'pipeline' && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Active job applications */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-400" /> Active Job Application Profiles
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-slate-500">Registered: {inspectCandidate.applications?.length || 0}</span>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-[#7145FF]/5 border-b border-slate-855 text-slate-500 leading-normal font-mono">
                            <tr className="uppercase">
                              <th className="px-5 py-3">Applied Position</th>
                              <th className="px-5 py-3">Company Client</th>
                              <th className="px-5 py-3">Submission Date</th>
                              <th className="px-5 py-3 text-center">Pipeline Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60 bg-slate-950/10">
                            {inspectCandidate.applications && inspectCandidate.applications.length > 0 ? (
                              inspectCandidate.applications.map((app: any, idx: number) => {
                                let statusCls = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                                if (['Interviewing', 'Offered'].includes(app.status)) {
                                  statusCls = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                                } else if (app.status === 'Rejected' || app.status === 'Declined') {
                                  statusCls = "bg-red-500/10 text-red-400 border-red-500/20";
                                } else if (app.status === 'Reviewed') {
                                  statusCls = "bg-blue-500/10 text-blue-400 border-blue-500/15";
                                }

                                return (
                                  <tr key={app.id || idx} className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-5 py-3.5 font-bold text-white">{app.job?.title || 'Deleted Position'}</td>
                                    <td className="px-5 py-3.5 text-slate-350 font-semibold">{app.job?.company || 'LaunchPath Client'}</td>
                                    <td className="px-5 py-3.5 font-mono text-slate-450">
                                      {app.applied_at ? new Date(app.applied_at).toLocaleString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9.5px] uppercase font-mono font-bold tracking-wider ${statusCls}`}>
                                        {app.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-slate-500 italic">This candidate has not submitted applications directly yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Physical scheduled interviews */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-violet-400" /> Physical & Proposed Scheduled Interviews
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const matchIv = (interviews || []).filter((iv: any) => iv.candidate_id === inspectCandidate.id);
                          if (matchIv.length === 0) {
                            return (
                              <p className="col-span-2 text-xs text-slate-500 italic p-6 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl text-center">
                                No physical or zoom interviews scheduled for this candidate yet.
                              </p>
                            );
                          }

                          return matchIv.map((iv: any) => {
                            let statusBadge = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                            if (iv.status === 'Confirmed') statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                            else if (iv.status === 'Cancelled') statusBadge = "bg-red-500/10 text-red-400 border-red-500/20";

                            return (
                              <div key={iv.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3 font-sans animate-fade-in">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">INTERVIEW_ID: #{iv.id}</p>
                                    <h5 className="font-bold text-white text-xs mt-0.5">{iv.application?.job?.title || 'Open Position'}</h5>
                                    <p className="text-slate-450 text-[11.5px] mt-0.5">{iv.application?.job?.company || 'Employer Tenant'}</p>
                                  </div>
                                  <span className={`text-[9px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border ${statusBadge}`}>
                                    {iv.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs font-mono text-slate-300">
                                  <Clock className="w-3.5 h-3.5 text-[#a385ff]" />
                                  <span>{new Date(iv.proposed_time).toLocaleString()}</span>
                                </div>
                                {iv.notes && (
                                  <p className="text-xs text-slate-400 italic p-2 bg-slate-900/30 border border-slate-800 rounded-xl">
                                    Notes: {iv.notes}
                                  </p>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Footer controls */}
              <div className="p-5 border-t border-slate-800/80 bg-slate-950 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-550 leading-relaxed max-w-sm">
                  Superadmin Candidate Dossier inspection view. Actions logged dynamically to platform logs.
                </span>
                <button 
                  onClick={() => setInspectCandidate(null)} 
                  className="px-6 py-2.5 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#7145FF]/10 cursor-pointer font-sans uppercase tracking-wider"
                >
                  Completed Inspection
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
