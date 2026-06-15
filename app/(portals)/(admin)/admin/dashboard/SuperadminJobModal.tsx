'use client';

import { useState, useEffect } from 'react';
import { Briefcase, X } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

interface SuperadminJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob: any;
  employers: any[];
  onSubmit: (action: string, payload: any) => Promise<any>;
}

export default function SuperadminJobModal({
  isOpen,
  onClose,
  editingJob,
  employers,
  onSubmit
}: SuperadminJobModalProps) {
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
  
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingJob) {
      setJobTitle(editingJob.title || '');
      setJobCompany(editingJob.company || '');
      setJobLocation(editingJob.location || '');
      setJobDescription(editingJob.description || '');
      setJobSalaryMin(editingJob.salary_min ? String(editingJob.salary_min) : '');
      setJobSalaryMax(editingJob.salary_max ? String(editingJob.salary_max) : '');
      setJobEmployerId(editingJob.employer_id ? String(editingJob.employer_id) : '');
      setJobYearsExperience(editingJob.years_experience || '');
      setJobMandatorySkills(Array.isArray(editingJob.mandatory_skills) ? editingJob.mandatory_skills.join(', ') : '');
      setJobTechStack(Array.isArray(editingJob.tech_stack) ? editingJob.tech_stack.join(', ') : '');
      setJobStatus(editingJob.status || 'ACTIVE');
    } else {
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
    }
    setSubmitError('');
    setSubmitSuccess('');
  }, [editingJob, isOpen, employers]);

  // Auto pre-fill company name if employer is selected
  useEffect(() => {
    if (jobEmployerId) {
      const matchedEmployer = employers.find((e: any) => String(e.id) === String(jobEmployerId));
      if (matchedEmployer) {
        setJobCompany(matchedEmployer.name || '');
      }
    }
  }, [jobEmployerId, employers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      const result = await onSubmit(action, payload);
      if (result.success) {
        setSubmitSuccess(result.data?.message || 'Operation completed successfully!');
        setTimeout(() => onClose(), 1200);
      } else {
        setSubmitError(result.error || 'Verification error, please check fields.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-90 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl animate-scale-in">
        <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-950">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider">
            <Briefcase className="w-4 h-4 text-[#7145FF]" />
            {editingJob ? `Modify Job Posting #${editingJob.id}` : 'Deploy New Job Posting'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Job Title *</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Assign Employer Tenant *</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Corporate Business Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={jobCompany}
                onChange={(e) => setJobCompany(e.target.value)}
                placeholder="Leave blank to auto-prefill from selected employer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Physical Location *</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="e.g. Johannesburg / Hybrid"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Salary Minimum (ZAR)</label>
              <input 
                type="number" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={jobSalaryMin}
                onChange={(e) => setJobSalaryMin(e.target.value)}
                placeholder="e.g. 60000"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Salary Maximum (ZAR)</label>
              <input 
                type="number" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={jobSalaryMax}
                onChange={(e) => setJobSalaryMax(e.target.value)}
                placeholder="e.g. 110000"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Experience Requirements</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={jobYearsExperience}
                onChange={(e) => setJobYearsExperience(e.target.value)}
                placeholder="e.g. 5+ Years"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Mandatory Skills (Comma separated)</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                value={jobMandatorySkills}
                onChange={(e) => setJobMandatorySkills(e.target.value)}
                placeholder="React, Node.js, SQL"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Other Tech Stack (Comma separated)</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                value={jobTechStack}
                onChange={(e) => setJobTechStack(e.target.value)}
                placeholder="Tailwind, Docker, AWS"
              />
            </div>
          </div>

          <div className="space-y-1 font-sans">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Publish Scope Status</label>
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

          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block font-sans">Full Job Description (HTML / text) *</label>
            <RichTextEditor 
              content={jobDescription}
              onChange={(val) => setJobDescription(val)}
              showAIAssistant={true}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 bg-slate-950/20 font-sans">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition cursor-pointer font-bold disabled:opacity-50"
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? 'Processing...' : (editingJob ? 'Update Posting' : 'Publish to Exchange')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
