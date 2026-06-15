'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import LaunchPathLogo from './LaunchPathLogo';
import { 
  Sparkles, 
  Briefcase, 
  Settings, 
  LogOut, 
  Search, 
  Bookmark, 
  PlusCircle, 
  ShieldAlert,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export interface CandidateNavbarProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
    professional_title?: string;
  };
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  applicationsCount?: number;
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
}

export default function CandidateNavbar({
  user,
  activeTab,
  setActiveTab,
  applicationsCount = 0,
  onLogout,
  onTabChange
}: CandidateNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboard = pathname?.includes('/candidate/dashboard') || pathname === '/candidate';

  const handleTabClick = (tab: string) => {
    setMobileMenuOpen(false);
    if (isDashboard && setActiveTab) {
      setActiveTab(tab);
      if (onTabChange) {
        onTabChange(tab);
      }
    } else {
      // If we are on another page (e.g. /candidate/new), we redirect to dashboard with query state
      router.push(`/candidate/dashboard?tab=${tab}`);
    }
  };

  const getLinkClasses = (isActive: boolean) => {
    return isActive
      ? 'border-b-2 border-[#7145FF] text-[#7145FF] dark:text-violet-400 font-semibold px-1 py-4 text-sm flex items-center gap-2 transition-colors'
      : 'text-slate-600 dark:text-slate-305 hover:text-[#7145FF] dark:hover:text-violet-400 px-1 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 border-transparent';
  };

  const getMobileLinkClasses = (isActive: boolean) => {
    return isActive
      ? 'w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-[#7145FF] dark:text-violet-400 font-semibold text-left transition-colors'
      : 'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium text-left transition-colors';
  };

  return (
    <header className="relative w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 shadow-sm z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left section: Logo & Navigation */}
          <div className="flex items-center gap-8 flex-1">
            {/* Logo */}
            <Link href="/candidate/dashboard" className="flex items-center gap-3 flex-shrink-0">
              <LaunchPathLogo variant="full" />
              <span className="px-2 py-0.5 bg-[#7145FF]/10 dark:bg-[#7145FF]/20 text-[#7145FF] dark:text-violet-305 text-[10px] font-bold rounded-md uppercase border border-[#7145FF]/20 select-none">
                Candidate
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-6 h-full items-center">
              {/* AI Job Feed */}
              <button
                onClick={() => handleTabClick('Jobs')}
                className={getLinkClasses(isDashboard ? activeTab === 'Jobs' : false)}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Feed</span>
              </button>

              {/* All Jobs */}
              <button
                onClick={() => handleTabClick('AllJobs')}
                className={getLinkClasses(isDashboard ? activeTab === 'AllJobs' : false)}
              >
                <Search className="w-4 h-4" />
                <span>Find Work</span>
              </button>

              {/* Saved Jobs */}
              <button
                onClick={() => handleTabClick('Saved')}
                className={getLinkClasses(isDashboard ? activeTab === 'Saved' : false)}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Jobs</span>
              </button>

              {/* Applications */}
              <button
                onClick={() => handleTabClick('Applications')}
                className={getLinkClasses(isDashboard ? activeTab === 'Applications' : false)}
              >
                <Briefcase className="w-4 h-4" />
                <span>My Applications</span>
                {applicationsCount > 0 && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {applicationsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right section: Profile & Menu Controls */}
          <div className="flex items-center gap-4"> 
            
            {/* Desktop Settings & Profile actions */}
            <div className="hidden md:flex items-center gap-4 relative">
              {/* User Dropdown Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-200 dark:border-blue-800/80">
                    {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user?.name || 'My Profile'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-lg py-2 z-50 text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-150 dark:border-slate-800">
                      <p className="text-sm font-semibold truncate text-slate-950 dark:text-white">{user?.name || 'Candidate'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.professional_title || 'Professional Partner'}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleTabClick('Profile')}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-705 dark:text-slate-300 font-medium cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#7145FF]" />
                      <span>My Profile</span>
                    </button>

                    <Link 
                      href="/candidate/new" 
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-705 dark:text-slate-300 font-medium"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                      <span>Upload Resume</span>
                    </Link>

                    <Link 
                      href="/candidate/update" 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings & Preferences</span>
                    </Link>

                    <Link 
                      href="/candidate/delete" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Close Account</span>
                    </Link>

                    <div className="border-t border-slate-150 dark:border-slate-800 my-1"></div>

                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner py-4 px-4 space-y-3">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900">
            <p className="text-sm font-semibold truncate text-slate-950 dark:text-white">{user?.name || 'Talent'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.professional_title || 'Professional Partner'}</p>
          </div>

          <button
            onClick={() => handleTabClick('Jobs')}
            className={getMobileLinkClasses(isDashboard ? activeTab === 'Jobs' : false)}
          >
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>AI Job Feed</span>
          </button>

          <button
            onClick={() => handleTabClick('AllJobs')}
            className={getMobileLinkClasses(isDashboard ? activeTab === 'AllJobs' : false)}
          >
            <Search className="w-5 h-5 text-indigo-500" />
            <span>All Active Jobs</span>
          </button>

          <button
            onClick={() => handleTabClick('Saved')}
            className={getMobileLinkClasses(isDashboard ? activeTab === 'Saved' : false)}
          >
            <Bookmark className="w-5 h-5 text-amber-500" />
            <span>Saved Jobs</span>
          </button>

          <button
            onClick={() => handleTabClick('Applications')}
            className={getMobileLinkClasses(isDashboard ? activeTab === 'Applications' : false)}
          >
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <span className="flex-1 text-left">My Applications</span>
            {applicationsCount > 0 && (
              <span className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                {applicationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('Profile')}
            className={getMobileLinkClasses(isDashboard ? activeTab === 'Profile' : false)}
          >
            <User className="w-5 h-5 text-blue-500" />
            <span>My Profile</span>
          </button>

          <Link
            href="/candidate/new"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClasses(pathname === '/candidate/new')}
          >
            <PlusCircle className="w-5 h-5 text-pink-500" />
            <span>Upload New Resume</span>
          </Link>

          <Link
            href="/candidate/update"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClasses(pathname === '/candidate/update')}
          >
            <Settings className="w-5 h-5 text-slate-500" />
            <span>Settings & Preferences</span>
          </Link>

          <Link
            href="/candidate/delete"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileLinkClasses(pathname === '/candidate/delete')}
          >
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Close Account</span>
          </Link>

          <div className="border-t border-slate-100 dark:border-slate-900 my-2"></div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-650 hover:bg-slate-50 dark:hover:bg-slate-900 text-left font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
