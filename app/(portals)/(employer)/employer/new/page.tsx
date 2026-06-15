'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Briefcase, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import RichTextEditor from '@/components/RichTextEditor';
import PortalSidebar from '@/components/PortalSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function EmployerNewPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [mandatorySkills, setMandatorySkills] = useState('');
  const [techStack, setTechStack] = useState('');
  const [duration, setDuration] = useState('30');

  const [aiLoading, setAiLoading] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
        if (!data.user || (role !== 'EMPLOYER' && role !== 'CLIENT')) {
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
          router.push('/employer/dashboard');
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

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between pl-14 pr-4 md:px-8 flex-shrink-0 transition-colors">
          <h1 className="text-xl font-bold dark:text-white">Create New Job Posting</h1>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-[#7145FF]/10 dark:bg-[#7145FF]/20 text-[#7145FF] dark:text-violet-300 px-3 py-1 rounded-full text-sm font-semibold border border-[#7145FF]/20 dark:border-[#7145FF]/30">
              <span className="w-2 h-2 bg-[#7145FF] dark:bg-[#7145FF] rounded-full animate-pulse"></span>
              {user?.role || 'EMPLOYER'}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 transition-colors">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Post a New Role
              </h2>
              
              <form onSubmit={handleCreateJob} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer" 
                      className="flex-1 p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleAiAutofill}
                      disabled={aiLoading}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 dark:hover:bg-purple-950 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {aiLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      AI Autofill
                    </button>
                  </div>
                </div>

                {aiLoading ? (
                  <div className="space-y-4 animate-pulse p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-400 font-medium text-sm">
                      <Clock className="w-5 h-5 animate-spin" />
                      Generating description, requirements, and tech stack...
                    </div>
                    <div className="h-4 bg-purple-200 dark:bg-purple-900/40 rounded w-1/4 mb-2"></div>
                    <div className="h-32 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-full"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Job Description (Rich Text Builder)</label>
                      <RichTextEditor 
                        content={description}
                        onChange={setDescription}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
                        <input 
                          type="text"
                          value={yearsExperience}
                          onChange={e => setYearsExperience(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                          placeholder="e.g. 5+ years"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mandatory Skills</label>
                        <input 
                          type="text"
                          value={mandatorySkills}
                          onChange={e => setMandatorySkills(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                          placeholder="e.g. React, Node, SQL"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tech Stack</label>
                        <input 
                          type="text"
                          value={techStack}
                          onChange={e => setTechStack(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                          placeholder="e.g. GitHub, GCP, Prisma"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Listing Duration</label>
                        <select 
                          value={duration}
                          onChange={e => setDuration(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                        >
                          <option value="30">30 Days</option>
                          <option value="60">60 Days</option>
                          <option value="90">90 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={savingJob || !title || !description}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-50 text-base"
                >
                  Pay & Publish Job (R500)
                </button>
              </form>
          </div>
        </div>
      </main>
    </div>
  );
}
