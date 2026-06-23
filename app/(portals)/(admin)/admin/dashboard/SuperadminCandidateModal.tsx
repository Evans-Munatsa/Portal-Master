'use client';

import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';

interface SuperadminCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCand: any;
  onSubmit: (action: string, payload: any) => Promise<any>;
}

export default function SuperadminCandidateModal({
  isOpen,
  onClose,
  editingCand,
  onSubmit
}: SuperadminCandidateModalProps) {
  const [candEmail, setCandEmail] = useState('');
  const [candPassword, setCandPassword] = useState('');
  const [candName, setCandName] = useState('');
  const [candProfessionalTitle, setCandProfessionalTitle] = useState('');
  const [candExperienceLevel, setCandExperienceLevel] = useState('INTERMEDIATE');
  const [candResumeText, setCandResumeText] = useState('');
  const [candLinkedinUrl, setCandLinkedinUrl] = useState('');
  const [candGithubUrl, setCandGithubUrl] = useState('');
  const [candPhone, setCandPhone] = useState('');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCand) {
      setCandEmail(editingCand.email || '');
      setCandPassword(''); // Leave blank to skip password change
      setCandName(editingCand.name || '');
      setCandProfessionalTitle(editingCand.professional_title || '');
      setCandExperienceLevel(editingCand.experience_level || 'INTERMEDIATE');
      setCandResumeText(editingCand.resume_text || '');
      setCandLinkedinUrl(editingCand.linkedin_url || '');
      setCandGithubUrl(editingCand.github_url || '');
      setCandPhone(editingCand.phone || '');
    } else {
      setCandEmail('');
      setCandPassword('');
      setCandName('');
      setCandProfessionalTitle('');
      setCandExperienceLevel('INTERMEDIATE');
      setCandResumeText('');
      setCandLinkedinUrl('');
      setCandGithubUrl('');
      setCandPhone('');
    }
    setSubmitError('');
    setSubmitSuccess('');
  }, [editingCand, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      github_url: candGithubUrl,
      phone: candPhone
    };

    const action = editingCand ? 'UPDATE_CANDIDATE' : 'CREATE_CANDIDATE';
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
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider font-sans">
            <Users className="w-4 h-4 text-[#7145FF]" />
            {editingCand ? `Edit Candidate: ${editingCand.name}` : 'Onload New Talent Candidate'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
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
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Email Address *</label>
              <input 
                type="email" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={candEmail}
                onChange={(e) => setCandEmail(e.target.value)}
                placeholder="candidate@workplace.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">
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
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Candidate Human Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={candName}
                onChange={(e) => setCandName(e.target.value)}
                placeholder="e.g. Jane Foster"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Professional Designation</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                value={candProfessionalTitle}
                onChange={(e) => setCandProfessionalTitle(e.target.value)}
                placeholder="e.g. Lead React Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a385ff] font-mono block">Experience Group Level</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                value={candExperienceLevel}
                onChange={(e) => setCandExperienceLevel(e.target.value)}
              >
                <option value="ENTRY">ENTRY (0-2 Years)</option>
                <option value="INTERMEDIATE">INTERMEDIATE (2-5 Years)</option>
                <option value="SENIOR">SENIOR (5-8 Years)</option>
                <option value="LEAD">LEAD / PRINCIPAL (8+ Years)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a385ff] font-mono block">Phone Number</label>
              <input 
                type="tel" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                value={candPhone}
                onChange={(e) => setCandPhone(e.target.value)}
                placeholder="e.g. +1 (555) 012-3456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">LinkedIn Profile URL</label>
              <input 
                type="text" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                value={candLinkedinUrl}
                onChange={(e) => setCandLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/jane-foster"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">GitHub Profile URL</label>
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
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">System Parsed Resume Raw Text Document</label>
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
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-slate-405 transition cursor-pointer font-bold disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : (editingCand ? 'Save Profile' : 'Onload Candidate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
