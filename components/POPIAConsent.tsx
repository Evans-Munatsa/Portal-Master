'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export function POPIAConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('popia_consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('popia_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-5 duration-500 fade-in">
      <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6 border border-slate-700">
        <div className="flex-shrink-0 bg-blue-600/20 p-3 rounded-full hidden md:block">
          <ShieldAlert className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1 text-sm md:text-base leading-relaxed">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-400 md:hidden" />
            Data Privacy & POPIA Compliance
          </h3>
          <p className="text-slate-300">
            We use cookies and collect personal data to provide our AI-driven job matching services. By continuing to use our platform, you consent to our data processing practices in accordance with the Protection of Personal Information Act (POPIA). You can manage your data preferences in your account settings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <button 
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}
