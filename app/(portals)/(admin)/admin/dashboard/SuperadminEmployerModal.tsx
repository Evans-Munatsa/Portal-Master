'use client';

import { useState, useEffect } from 'react';
import { Building, X } from 'lucide-react';

interface SuperadminEmployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmp: any;
  onSubmit: (action: string, payload: any) => Promise<any>;
}

export default function SuperadminEmployerModal({
  isOpen,
  onClose,
  editingEmp,
  onSubmit
}: SuperadminEmployerModalProps) {
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empName, setEmpName] = useState('');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEmp) {
      setEmpEmail(editingEmp.email || '');
      setEmpPassword('');
      setEmpName(editingEmp.name || '');
    } else {
      setEmpEmail('');
      setEmpPassword('');
      setEmpName('');
    }
    setSubmitError('');
    setSubmitSuccess('');
  }, [editingEmp, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      <div className="bg-slate-90 w-full max-w-md overflow-hidden flex flex-col shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl animate-scale-in">
        <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-950">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider font-sans">
            <Building className="w-4 h-4 text-[#7145FF]" />
            {editingEmp ? `Edit Employer: ${editingEmp.name}` : 'Onload Corporate Employer'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
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
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Tenant Organization / Corporate Name *</label>
            <input 
              type="text" 
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              placeholder="e.g. Standard Bank Group"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">Tenant Root Corporate Email *</label>
            <input 
              type="email" 
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
              placeholder="recruitment@corporate.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-404 font-mono block">
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
              {isSubmitting ? 'Processing...' : (editingEmp ? 'Save Profile' : 'Onload Employer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
