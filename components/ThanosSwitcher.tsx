'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Building, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from './ToastNotification';

export function ThanosSwitcher() {
  const [user, setUser] = useState<any>(null);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch (e) {
      console.error('Thanos session check failed:', e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]); // Re-verify on page transitions to ensure roles sync nicely

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
        
        // Show our beautiful custom toast
        toast(`${result.message || 'Thanos mode updated successfully'} 🛡️`, 'success');
        
        // Redirect to appropriate dashboard portal
        setTimeout(() => {
          if (targetRole === 'CANDIDATE') {
            router.push('/candidate/dashboard');
          } else if (targetRole === 'EMPLOYER') {
            router.push('/employer/dashboard');
          } else {
            router.push('/admin/dashboard');
          }
          // Reset switching state and refresh view to let server-side session reload
          setSwitching(false);
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

  // Only render if logged in user is a real SUPERADMIN
  if (!user || user.realRole !== 'SUPERADMIN') {
    return null;
  }

  const activeRole = user.role || 'SUPERADMIN';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9990] w-full max-w-lg px-4 pointer-events-none"
      >
        <div className="pointer-events-auto bg-slate-950/95 dark:bg-slate-950/95 border border-[#7145FF]/40 rounded-full px-5 py-3 shadow-2xl shadow-[#7145FF]/20 flex items-center justify-between gap-4 backdrop-blur-lg">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-2 select-none flex-shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#7145FF]/20 border border-[#7145FF]/40">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-violet-500/15 animate-ping" style={{ animationDuration: '3s' }}></div>
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-100 uppercase tracking-widest font-sans flex items-center gap-1">
                Thanos <span className="text-[9px] font-bold text-violet-400 font-mono tracking-normal">Mode</span>
              </h4>
              <p className="text-[9px] font-bold text-slate-400 tracking-wide leading-none">Super Admin Switcher</p>
            </div>
          </div>

          {/* Action Segments */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 gap-1 flex-1 max-w-xs">
            {/* Super admin option */}
            <button
              onClick={() => handleRoleSwitch('SUPERADMIN')}
              disabled={switching}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-full text-[10px] font-bold transition cursor-pointer ${
                activeRole === 'SUPERADMIN'
                  ? 'bg-[#7145FF] text-white shadow-md shadow-[#7145FF]/30'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
              title="Switch to Super Admin workspace"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Candidate option */}
            <button
              onClick={() => handleRoleSwitch('CANDIDATE')}
              disabled={switching}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-full text-[10px] font-bold transition cursor-pointer ${
                activeRole === 'CANDIDATE'
                  ? 'bg-[#7145FF] text-white shadow-md shadow-[#7145FF]/30'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
              title="Simulate Candidate experience"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Candidate</span>
            </button>

            {/* Employer option */}
            <button
              onClick={() => handleRoleSwitch('EMPLOYER')}
              disabled={switching}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-full text-[10px] font-bold transition cursor-pointer ${
                activeRole === 'EMPLOYER'
                  ? 'bg-[#7145FF] text-white shadow-md shadow-[#7145FF]/30'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
              title="Simulate Employer experience"
            >
              <Building className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Employer</span>
            </button>
          </div>

          {/* Status/Spinner info */}
          {switching && (
            <div className="flex-shrink-0 animate-spin text-violet-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
