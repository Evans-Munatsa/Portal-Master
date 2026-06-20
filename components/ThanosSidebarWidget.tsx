'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Building, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from './ToastNotification';

interface ThanosSidebarWidgetProps {
  currentRole: string; // e.g. "SUPERADMIN", "CANDIDATE", "EMPLOYER"
}

export function ThanosSidebarWidget({ currentRole }: ThanosSidebarWidgetProps) {
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRoleSwitch = async (targetRole: 'SUPERADMIN' | 'CANDIDATE' | 'EMPLOYER') => {
    if (switching) return;
    setSwitching(true);
    
    try {
      const res = await fetch('/api/superadmin/thanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });

      if (res.ok) {
        const result = await res.json();
        
        toast(`${result.message || 'Thanos mode updated successfully'} 🛡️`, 'success');
        
        setTimeout(() => {
          if (targetRole === 'CANDIDATE') {
            router.push('/candidate/dashboard');
          } else if (targetRole === 'EMPLOYER') {
            router.push('/employer/dashboard');
          } else {
            router.push('/admin/dashboard');
          }
          // Let router and window reload the page state to get fresh session roles
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }, 800);
      } else {
        const errorData = await res.json();
        toast(errorData.error || 'Failed to trigger Thanos switch.', 'error');
        setSwitching(false);
      }
    } catch (err: any) {
      toast('Error activating Thanos mode: ' + err.message, 'error');
      setSwitching(false);
    }
  };

  const active = String(currentRole || 'SUPERADMIN').toUpperCase();

  return (
    <div className="bg-slate-900/60 border border-[#7145FF]/30 rounded-xl p-3 mb-4 mx-2">
      <div className="flex items-center justify-between mb-2 select-none">
        <span className="text-[9px] uppercase font-bold tracking-wider text-violet-400 font-sans flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
          Thanos Switcher
        </span>
        {switching && (
          <RefreshCw className="w-3 h-3 text-violet-400 animate-spin" />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {/* Admin Button */}
        <button
          onClick={() => handleRoleSwitch('SUPERADMIN')}
          disabled={switching}
          className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            active === 'SUPERADMIN'
              ? 'bg-[#7145FF] text-white shadow-sm shadow-[#7145FF]/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </button>

        {/* Candidate Button */}
        <button
          onClick={() => handleRoleSwitch('CANDIDATE')}
          disabled={switching}
          className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            active === 'CANDIDATE'
              ? 'bg-[#7145FF] text-white shadow-sm shadow-[#7145FF]/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Candidate Space</span>
        </button>

        {/* Employer Button */}
        <button
          onClick={() => handleRoleSwitch('EMPLOYER')}
          disabled={switching}
          className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
            active === 'EMPLOYER'
              ? 'bg-[#7145FF] text-white shadow-sm shadow-[#7145FF]/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Employer Space</span>
        </button>
      </div>
    </div>
  );
}
