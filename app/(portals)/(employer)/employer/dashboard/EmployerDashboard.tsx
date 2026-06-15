'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Search, Sun, Moon, PlusCircle, Briefcase, Users, CheckCircle, ShieldAlert, Video, Sparkles, Play } from 'lucide-react';
import { useTheme } from 'next-themes';

import RichTextEditor from '@/components/RichTextEditor';
import PortalSidebar from '@/components/PortalSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function EmployerDashboard({ data, user, onRefresh, onLogout }: { data: any, user: any, onRefresh: () => void, onLogout: () => void }) {
  const { jobs, applications } = data;
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string | null>(null);

  // Sorting and filtering state variables
  const [filterScore, setFilterScore] = useState<number | 'All'>('All');
  const [filterExperience, setFilterExperience] = useState<string>('All');
  const [filterSkill, setFilterSkill] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('applied_at_desc');

  const filteredApplicants = (applications || [])
    .filter((app: any) => {
      // Job Posting filter (existing filter)
      if (selectedJobFilter && app.job_id !== selectedJobFilter) return false;

      // AI Match score filter
      if (filterScore !== 'All') {
        const score = app.matchContext?.match_score || 0;
        if (score < filterScore) return false;
      }

      // Experience level filter
      if (filterExperience !== 'All') {
        const candidateExp = String(app.candidate.experience_level || '').toLowerCase();
        if (filterExperience === 'Junior' && !candidateExp.includes('junior') && !candidateExp.includes('1-3')) return false;
        if (filterExperience === 'Mid' && !candidateExp.includes('mid') && !candidateExp.includes('intermediate') && !candidateExp.includes('3-5') && !candidateExp.includes('mid-level')) return false;
        if (filterExperience === 'Senior' && !candidateExp.includes('senior') && !candidateExp.includes('5-8') && !candidateExp.includes('8+')) return false;
        if (filterExperience === 'Executive' && !candidateExp.includes('executive') && !candidateExp.includes('lead') && !candidateExp.includes('director') && !candidateExp.includes('10+')) return false;
      }

      // Skill set filter
      if (filterSkill !== 'All') {
        const searchSkill = filterSkill.toLowerCase();
        const resumeText = String(app.candidate.resume_text || '').toLowerCase();
        const titleText = String(app.candidate.professional_title || '').toLowerCase();
        if (!resumeText.includes(searchSkill) && !titleText.includes(searchSkill)) return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'score_desc') {
        const aScore = a.matchContext?.match_score || 0;
        const bScore = b.matchContext?.match_score || 0;
        return bScore - aScore;
      }
      if (sortBy === 'name_asc') {
        return String(a.candidate.name || '').localeCompare(String(b.candidate.name || ''));
      }
      if (sortBy === 'readiness_desc') {
        const aRad = a.candidate.video_interviews?.[0]?.score || 0;
        const bRad = b.candidate.video_interviews?.[0]?.score || 0;
        return bRad - aRad;
      }
      // default: applied_at_desc
      return new Date(b.applied_at || 0).getTime() - new Date(a.applied_at || 0).getTime();
    });

  const scheduleInterview = async (app: any) => {
    if (!interviewDate || !interviewTime) {
       alert('Please select date and time');
       return;
    }
    const combined = new Date(`${interviewDate}T${interviewTime}`);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: app.id,
          candidate_id: app.candidate_id,
          proposed_time: combined.toISOString(),
          notes: interviewNotes
        })
      });
      if (res.ok) {
        alert('Interview proposed successfully');
        setInterviewDate('');
        setInterviewTime('');
        setInterviewNotes('');
        setSelectedApplicant(null);
        onRefresh();
      } else {
        alert('Failed to schedule interview');
      }
    } catch (err) {
       alert('Error scheduling interview');
    }
  };

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [mandatorySkills, setMandatorySkills] = useState('');
  const [techStack, setTechStack] = useState('');
  const [duration, setDuration] = useState('30');

  const [aiLoading, setAiLoading] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  const handleAiAutofill = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title) return alert('Please enter a job title first.');
    setAiLoading(true);
    try {
      const res = await fetch('/api/jobs/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const aiData = await res.json();
      if (aiData.error) throw new Error(aiData.error);
      
      setDescription(aiData.description || '');
      setYearsExperience(aiData.yearsExperienceRequired ? `${aiData.yearsExperienceRequired}+ years` : '');
      setMandatorySkills((aiData.mandatorySkills || []).join(', '));
      setTechStack((aiData.techStack || []).join(', '));
    } catch (err: any) {
      alert('AI Autofill failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setSavingJob(true);
    try {
      // Create comprehensive description avoiding schema changes for now structure wise we append details
      const fullDesc = `
${description}

**Years of Experience Required:** ${yearsExperience}
**Mandatory Skills:** ${mandatorySkills}
**Tech Stack:** ${techStack}
**Listing Duration:** ${duration} days
      `.trim();

      const res = await fetch('/api/jobs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description: fullDesc,
          years_experience: yearsExperience,
          mandatory_skills: mandatorySkills,
          tech_stack: techStack 
        }),
      });
      if (res.ok) {
        const resetData = await res.json();
        
        if (resetData.bypassed || !resetData.payfast) {
          alert('Job post created successfully (Bypassed payment)!');
          setTitle('');
          setDescription('');
          setYearsExperience('');
          setMandatorySkills('');
          setTechStack('');
          setSavingJob(false);
          onRefresh();
        } else if (resetData.payfast) {
          const { url, data } = resetData.payfast;
          const form = document.createElement('form');
          form.action = url;
          form.method = 'POST';
          form.style.display = 'none';

          for (const [key, value] of Object.entries(data)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          }

          document.body.appendChild(form);
          form.submit();
        }

      } else {
        const errorData = await res.json();
        alert('Failed to initiate checkout: ' + errorData.error);
        setSavingJob(false);
      }
    } catch (error: any) {
      alert('Error creating job: ' + error.message);
      setSavingJob(false);
    }
  };

  const filteredJobs = (jobs || []).filter((job: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      (job.years_experience && String(job.years_experience).toLowerCase().includes(q)) ||
      (job.mandatory_skills && Array.isArray(job.mandatory_skills) && job.mandatory_skills.some((s: string) => s.toLowerCase().includes(q))) ||
      (job.tech_stack && Array.isArray(job.tech_stack) && job.tech_stack.some((s: string) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="w-full h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar */}
      <PortalSidebar
        role="EMPLOYER"
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobsCount={jobs?.length || 0}
        applicationsCount={applications?.length || 0}
        onLogout={onLogout}
        onTabChange={() => setSelectedApplicant(null)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between pl-14 pr-4 md:px-8 flex-shrink-0 transition-colors">
          <h1 className="text-xl font-bold dark:text-white">{activeTab === 'Overview' ? 'Job Posts Overview' : 'Review Applicants'}</h1>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-[#7145FF]/10 dark:bg-[#7145FF]/20 text-[#7145FF] dark:text-violet-300 px-3 py-1 rounded-full text-sm font-semibold border border-[#7145FF]/20 dark:border-[#7145FF]/30">
              <span className="w-2 h-2 bg-[#7145FF] dark:bg-[#7145FF] rounded-full animate-pulse"></span>
              {user?.role || 'EMPLOYER'}
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'Overview' && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Dashboard Header & Stats Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Active Postings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your active recruitment drives, see applicant volumes, and post new vacancies.</p>
              </div>
              <Link 
                href="/employer/new" 
                className="bg-[#7145FF] hover:bg-[#5b32e6] dark:bg-[#7145FF] dark:hover:bg-[#5b32e6] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 self-start md:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Post
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-xl shadow-sm transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Job Postings</p>
                <p className="text-3xl font-bold dark:text-white">{jobs?.length || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-xl shadow-sm transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Received Applications</p>
                <p className="text-3xl font-bold dark:text-white">{applications?.length || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-xl shadow-sm transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Unscheduled Pipeline</p>
                <p className="text-3xl font-bold dark:text-white">
                  {(applications || []).filter((a: any) => !a.interviews || a.interviews.length === 0).length}
                </p>
              </div>
            </div>

            {/* Search & Filter section */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search postings by role title, description, skills, or tech stack..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Jobs list */}
            {(!filteredJobs || filteredJobs.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-center transition-colors">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Job Postings Found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-sm">
                  {searchQuery ? "No job roles match your current search criteria. Try a different query or clear the filter." : "Get started by posting your first role to LaunchPath and find the perfect candidate today."}
                </p>
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-sm font-bold px-4 py-2 rounded-lg transition">
                    Clear Search
                  </button>
                ) : (
                  <Link href="/employer/new" className="bg-[#7145FF] hover:bg-[#5b32e6] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition shadow-sm flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Create New Post
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job: any) => {
                  const jobAppsCount = (applications || []).filter((app: any) => app.job_id === job.id).length;
                  
                  // Helper to safely render badges from any shape (array, comma-string)
                  const renderBadges = (fieldVal: any, bgClass: string, textClass: string, borderClass: string) => {
                    if (!fieldVal) return null;
                    let list: string[] = [];
                    if (Array.isArray(fieldVal)) {
                      list = fieldVal;
                    } else if (typeof fieldVal === 'string') {
                      list = fieldVal.split(',').map((s: string) => s.trim()).filter(Boolean);
                    }
                    if (list.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {list.slice(0, 8).map((item, idx) => (
                          <span key={idx} className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${bgClass} ${textClass} ${borderClass} border`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    );
                  };

                  return (
                    <div 
                      key={job.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-205 flex flex-col md:flex-row md:items-start justify-between gap-6"
                    >
                      <div className="flex-1 space-y-4">
                        {/* Title & Status */}
                        <div className="flex items-start justify-between sm:justify-start gap-3 flex-wrap">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{job.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            job.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800/30'
                          }`}>
                            {job.status || 'ACTIVE'}
                          </span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {job.years_experience ? `${job.years_experience} Experience` : 'No experience limit'}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span>{job.location || 'Remote'}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span>Job ID: #{job.id}</span>
                        </div>

                        {/* Rich HTML Description snippet */}
                        <div 
                          className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 prose prose-slate prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: job.description }}
                        />

                        {/* Skills / Tech stacks block */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {((job.mandatory_skills && job.mandatory_skills.length > 0) || (typeof job.mandatory_skills === 'string' && job.mandatory_skills)) && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mandatory Skills</span>
                              {renderBadges(job.mandatory_skills, 'bg-[#7145FF]/10 dark:bg-[#7145FF]/20', 'text-[#7145FF] dark:text-violet-300', 'border-[#7145FF]/10 dark:border-[#7145FF]/20')}
                            </div>
                          )}
                          {((job.tech_stack && job.tech_stack.length > 0) || (typeof job.tech_stack === 'string' && job.tech_stack)) && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tech Stack / Tools</span>
                              {renderBadges(job.tech_stack, 'bg-purple-50 dark:bg-purple-900/10', 'text-purple-700 dark:text-purple-300', 'border-purple-100 dark:border-purple-900/30')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Hand Actions & Stats */}
                      <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-4 min-w-[150px] border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                        {/* Match Counts */}
                        <div className="text-left md:text-right">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Matches</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-400" />
                            {jobAppsCount} {jobAppsCount === 1 ? 'Candidate' : 'Candidates'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button 
                            onClick={() => {
                              setSelectedJobFilter(job.id);
                              setActiveTab('Applicants');
                            }}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-lg transition"
                          >
                            View Pipeline
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {activeTab === 'Applicants' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sidebar Column: Sorting & Filtering Sidebar */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-sm sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Filter Applicants</h3>
                <button
                  type="button"
                  onClick={() => {
                    setFilterScore('All');
                    setFilterExperience('All');
                    setFilterSkill('All');
                    setSortBy('applied_at_desc');
                  }}
                  className="text-xs text-[#7145FF] hover:underline font-bold cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-900 focus:ring-2 focus:ring-[#7145FF] focus:border-transparent outline-none transition"
                >
                  <option value="applied_at_desc">Applied Date (Newest)</option>
                  <option value="score_desc">AI Match Score (High-Low)</option>
                  <option value="readiness_desc">Practice Readiness (High-Low)</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>

              {/* AI Match Score Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Min AI Job Match</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['All', 70, 80, 90].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilterScore(s as any)}
                      className={`px-2 py-1.5 rounded-lg text-center text-xs font-semibold border transition cursor-pointer ${
                        filterScore === s
                          ? 'bg-[#7145FF]/10 border-[#7145FF] text-[#7145FF]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {s === 'All' ? 'All Scores' : `${s}%+ Match`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Experience Level</label>
                <div className="flex flex-col gap-1">
                  {['All', 'Junior', 'Mid', 'Senior', 'Executive'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFilterExperience(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition flex items-center justify-between cursor-pointer ${
                        filterExperience === level
                          ? 'bg-[#7145FF]/10 border-[#7145FF]/30 text-[#7145FF] font-bold'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span>{level === 'All' ? 'Any Experience' : `${level} Level`}</span>
                      {filterExperience === level && <span className="h-1.5 w-1.5 bg-[#7145FF] rounded-full"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Verified Skill Set */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Verified Skillset</label>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'React', 'TypeScript', 'NodeJS', 'Python', 'SQL', 'DevOps'].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setFilterSkill(skill === 'NodeJS' ? 'Node' : skill)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                        (skill === 'NodeJS' && filterSkill === 'Node') || (skill !== 'NodeJS' && filterSkill === skill)
                          ? 'bg-[#7145FF]/15 border-[#7145FF]/40 text-[#7145FF]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Main Candidates Column */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Applicant Pipeline ({filteredApplicants.length})
                </h2>
                {selectedJobFilter && (
                  <button
                    onClick={() => setSelectedJobFilter(null)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Show All Postings
                  </button>
                )}
              </div>

              {selectedJobFilter && (
                <div className="px-6 py-3 bg-[#7145FF]/5 dark:bg-[#7145FF]/10 border-b border-[#7145FF]/15 dark:border-[#7145FF]/25 flex items-center justify-between text-xs text-[#7145FF] dark:text-violet-300">
                  <span>
                    Filtering applicants for role: <span className="font-bold underline">{(jobs || []).find((j: any) => j.id === selectedJobFilter)?.title || 'Selected Job'}</span>
                  </span>
                  <button 
                    onClick={() => setSelectedJobFilter(null)} 
                    className="font-semibold hover:underline"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/20">
                     <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                       <th className="px-6 py-3">Candidate</th>
                       <th className="px-6 py-3">Applied Role</th>
                       <th className="px-6 py-3">AI Match Score</th>
                       <th className="px-6 py-3">Fit Summary</th>
                       <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {filteredApplicants.length === 0 && (
                       <tr>
                         <td colSpan={5} className="p-10 text-center text-slate-500 text-sm">
                            No candidates found matching the active filters or job postings.
                         </td>
                       </tr>
                     )}
                     {filteredApplicants.map((app: any) => (
                       <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                         <td className="px-6 py-4">
                           <p className="font-bold text-slate-900 dark:text-white text-sm">{app.candidate.name}</p>
                           <p className="text-xs text-slate-500 mt-0.5">{app.candidate.professional_title} • <span className="italic">{app.candidate.experience_level || 'General'}</span></p>
                         </td>
                         <td className="px-6 py-4">
                           <span className="bg-[#7145FF]/10 text-[#7145FF] dark:text-violet-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-[#7145FF]/20">
                             {app.job.title}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           {app.matchContext ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${app.matchContext.match_score >= 80 ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30' : 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30'}`}>
                                  {app.matchContext.match_score}%
                                </span>
                                {app.matchContext.match_score >= 80 && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                           ) : (
                              <span className="text-xs text-slate-500 italic">Not calculated</span>
                           )}
                         </td>
                         <td className="px-6 py-4">
                           <p className="text-xs text-slate-650 dark:text-slate-400 line-clamp-2 max-w-sm">
                             {app.matchContext?.fit_summary || 'N/A'}
                           </p>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <button onClick={() => setSelectedApplicant(app)} className="text-[#7145FF] hover:text-[#5b32e6] font-bold text-xs bg-[#7145FF]/10 hover:bg-[#7145FF]/20 dark:bg-[#7145FF]/20 dark:hover:bg-[#7145FF]/30 px-3.5 py-1.5 rounded transition cursor-pointer">
                             Manage
                           </button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>

                {selectedApplicant && (() => {
                  const readiness = selectedApplicant.candidate.video_interviews?.[0];
                  return (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                      <div className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl ${readiness ? 'max-w-4xl' : 'max-w-lg'} w-full overflow-hidden flex flex-col transition-all duration-300`}>
                         <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                           <div>
                             <h3 className="font-bold text-lg">Manage Candidate: {selectedApplicant.candidate.name}</h3>
                             <p className="text-xs text-slate-500 mt-1">{selectedApplicant.candidate.professional_title || 'Software Candidate'}</p>
                           </div>
                           <button onClick={() => setSelectedApplicant(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 text-2xl font-bold leading-none cursor-pointer border-none bg-transparent">
                             &times;
                           </button>
                         </div>
                       <div className={`overflow-y-auto max-h-[80vh] p-6 ${readiness ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-6'}`}>
                           
                           {/* Left column: Scheduling & Actions */}
                           <div className="space-y-6">
                         {selectedApplicant.interviews && selectedApplicant.interviews.length > 0 ? (
                           <div>
                             <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Scheduled Interviews</h4>
                             <div className="space-y-3">
                               {selectedApplicant.interviews.map((iv: any) => (
                                 <div key={iv.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950">
                                   <p className="font-bold text-sm">{new Date(iv.proposed_time).toLocaleString()}</p>
                                   <p className="text-xs text-slate-500 mt-1">Status: <span className="font-bold text-[#7145FF]">{iv.status}</span></p>
                                 </div>
                               ))}
                             </div>
                           </div>
                         ) : (
                           <p className="text-sm text-slate-500 italic">No interviews scheduled yet.</p>
                         )}

                         <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                           <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3">Propose New Interview</h4>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                               <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded" />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1">Time</label>
                               <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded" />
                             </div>
                           </div>
                           <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Notes / Video Link</label>
                              <input type="text" value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)} placeholder="Zoom/Meet link or instructions" className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded" />
                           </div>
                           <button onClick={() => scheduleInterview(selectedApplicant)} className="w-full bg-[#7145FF] hover:bg-[#5b32e6] text-white font-bold py-2 rounded transition cursor-pointer border-none">
                             Send Invite
                           </button>
                         </div>
                       </div>

                       {/* Right column: Shared Job Readiness Credentials */}
                       {readiness && (
                         <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-8 space-y-6">
                         <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                           <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                             Job Readiness Credentials
                           </h4>
                           <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-955 px-2.5 py-1 rounded-full border border-emerald-250 dark:border-emerald-800/60 font-sans">
                             Overall Score: {readiness.score}%
                           </span>
                         </div>

                         {/* Shared Video response stream player */}
                         <div className="space-y-2">
                           <span className="text-[10px] font-mono font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">Candidate Stream Recording Output</span>
                           <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm">
                             <video 
                               controls 
                               src={readiness.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-man-delivering-presentation-on-a-screen-40331-large.mp4'} 
                               className="w-full h-full object-cover"
                               poster="https://picsum.photos/seed/recruitment-review/800/450"
                             />
                           </div>
                         </div>

                         {/* Shared AI Experts feedback assessment */}
                         <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-250 dark:border-slate-805 space-y-1.5 font-sans">
                           <span className="text-[10px] font-mono font-bold text-slate-405 dark:text-slate-500 uppercase tracking-widest block">Recruiter Coaching Feedback</span>
                           <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                             {readiness.feedback}
                           </p>
                         </div>

                         {/* Question lists, transcripts, and scores */}
                         <div className="space-y-3 font-sans">
                           <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-1.5">Readiness Speech Transcripts</span>
                           <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                             {(typeof readiness.questions === 'string' 
                               ? JSON.parse(readiness.questions) 
                               : (readiness.questions || [])
                             ).map((q: any) => (
                               <div key={q.id} className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-805 rounded-lg space-y-2 text-xs">
                                 <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800/60 font-semibold">
                                   <span className="font-extrabold text-slate-800 dark:text-slate-200">Q0{q.id}: {q.title}</span>
                                   <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 font-mono">Score: {q.questionScore}%</span>
                                 </div>
                                 <p className="italic text-slate-650 dark:text-slate-305 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                                   &ldquo;{q.transcript}&rdquo;
                                 </p>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     )}

                   </div>
                </div>
              </div>
            );
          })()}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
             <h2 className="text-xl font-bold mb-6">Account Settings</h2>
             
             <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-blue-500" />
                 Data Privacy & POPIA
               </h3>
               <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                 In accordance with the Protection of Personal Information Act (POPIA), you have the right to request an export of your company data and applicant records, or request complete deletion of your employer account.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition" onClick={() => alert('Your data export request has been submitted. Prepare for a large zip file.')}>
                   Request Data Export
                 </button>
                 <button className="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition" onClick={() => { if(confirm('Are you sure you want to delete your employer account? This action is permanent, all active job posts will be closed, and applicant data will be anonymized.')) alert('Employer account deletion requested. Our team will contact you to finalize.'); }}>
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
