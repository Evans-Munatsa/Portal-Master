'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LaunchPathLogo from './LaunchPathLogo';
import { ThanosSidebarWidget } from './ThanosSidebarWidget';
import { 
  Sparkles, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bookmark, 
  PlusCircle, 
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

export interface PortalSidebarProps {
  role: 'CANDIDATE' | 'EMPLOYER' | string;
  user: {
    name?: string;
    email?: string;
    role?: string;
    realRole?: string;
    professional_title?: string;
  };
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  jobsCount?: number;
  applicationsCount?: number;
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
}

export default function PortalSidebar({
  role,
  user,
  activeTab,
  setActiveTab,
  jobsCount = 0,
  applicationsCount = 0,
  onLogout,
  onTabChange
}: PortalSidebarProps) {
  const pathname = usePathname();
  const normalizedRole = String(role || user?.role || '').toUpperCase();
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    if (onTabChange) {
      onTabChange(tab);
    }
    setIsOpen(false);
  };

  const getActiveClasses = (isActive: boolean) => {
    return isActive
      ? 'bg-gradient-to-r from-[#7145FF]/15 to-[#7145FF]/2 text-white border-l-4 border-[#7145FF] pl-3'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 pl-4';
  };

  const renderEmployerItems = () => {
    const isDashboard = pathname?.includes('/employer/dashboard') || pathname === '/employer';
    
    return (
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2 px-4 font-mono">
            Hiring Pipeline
          </span>
          <nav className="space-y-1">
            {/* Job Posts Tab/Link */}
            {isDashboard && setActiveTab ? (
              <button
                onClick={() => handleTabClick('Overview')}
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${getActiveClasses(activeTab === 'Overview')}`}
              >
                <Briefcase className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">Job Posts</span>
                <span className="bg-[#7145FF]/20 text-[#a385ff] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#7145FF]/30 mr-2">{jobsCount}</span>
              </button>
            ) : (
              <Link
                href="/employer/dashboard"
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/employer/dashboard')}`}
              >
                <Briefcase className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">Job Posts Dashboard</span>
              </Link>
            )}

            {/* Applicants Tab/Link */}
            {isDashboard && setActiveTab ? (
              <button
                onClick={() => handleTabClick('Applicants')}
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${getActiveClasses(activeTab === 'Applicants')}`}
              >
                <Users className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">Applicants</span>
                <span className="bg-[#7145FF]/20 text-[#a385ff] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#7145FF]/30 mr-2">{applicationsCount}</span>
              </button>
            ) : (
              <Link
                href="/employer/dashboard"
                className="w-full flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all font-semibold text-sm pl-4"
              >
                <Users className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">Applicants List</span>
              </Link>
            )}
          </nav>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2 px-4 font-mono">
            Hiring Controls
          </span>
          <nav className="space-y-1">
            {/* Create New Post Link */}
            <Link
              href="/employer/new"
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/employer/new')}`}
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">New Job (Post Role)</span>
            </Link>

            {/* Update Link */}
            <Link
              href="/employer/update"
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/employer/update')}`}
            >
              <Settings className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">Update & Schedule</span>
            </Link>

            {/* Delete Link */}
            <Link
              href="/employer/delete"
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/employer/delete')}`}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">Delete / Close Postings</span>
            </Link>
          </nav>
        </div>
      </div>
    );
  };

  const renderCandidateItems = () => {
    const isDashboard = pathname?.includes('/candidate/dashboard') || pathname === '/candidate';

    return (
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2 px-4 font-mono">
            Job Seeking
          </span>
          <nav className="space-y-1">
            {/* AI Job Feed Tab/Link */}
            {isDashboard && setActiveTab ? (
              <button
                onClick={() => handleTabClick('Jobs')}
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${getActiveClasses(activeTab === 'Jobs')}`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">AI Job Feed</span>
              </button>
            ) : (
              <Link
                href="/candidate/dashboard"
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/candidate/dashboard')}`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">AI Job Feed</span>
              </Link>
            )}

            {/* All Jobs Tab/Link */}
            {isDashboard && setActiveTab ? (
              <button
                onClick={() => handleTabClick('AllJobs')}
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${getActiveClasses(activeTab === 'AllJobs')}`}
              >
                <Search className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">All Jobs</span>
              </button>
            ) : (
              <Link
                href="/candidate/dashboard"
                className="w-full flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all font-semibold text-sm pl-4"
              >
                <Search className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">All Active Jobs</span>
              </Link>
            )}

            {/* Saved Jobs Tab/Link */}
            {isDashboard && setActiveTab ? (
              <button
                onClick={() => handleTabClick('Saved')}
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${getActiveClasses(activeTab === 'Saved')}`}
              >
                <Bookmark className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">Saved Jobs</span>
              </button>
            ) : (
              <Link
                href="/candidate/dashboard"
                className="w-full flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all font-semibold text-sm pl-4"
              >
                <Bookmark className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">Saved Postings</span>
              </Link>
            )}

            {/* Applications Tab/Link */}
            {isDashboard && setActiveTab ? (
              <button
                onClick={() => handleTabClick('Applications')}
                className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${getActiveClasses(activeTab === 'Applications')}`}
              >
                <Briefcase className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">My Applications</span>
                <span className="bg-[#7145FF]/20 text-[#a385ff] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#7145FF]/30 mr-2">{applicationsCount}</span>
              </button>
            ) : (
              <Link
                href="/candidate/dashboard"
                className="w-full flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all font-semibold text-sm pl-4"
              >
                <Briefcase className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="flex-1 truncate">My Applications</span>
              </Link>
            )}
          </nav>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2 px-4 font-mono">
            Candidate Hub
          </span>
          <nav className="space-y-1">
            {/* Create Profile Link */}
            <Link
              href="/candidate/new"
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/candidate/new')}`}
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">New Profile (Resume)</span>
            </Link>

            {/* Update Link */}
            <Link
              href="/candidate/update"
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/candidate/update')}`}
            >
              <Settings className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">Update Settings</span>
            </Link>

            {/* Withdraw Link */}
            <Link
              href="/candidate/delete"
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${getActiveClasses(pathname === '/candidate/delete')}`}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">Delete / Withdraw</span>
            </Link>
          </nav>
        </div>
      </div>
    );
  };

  const getRoleBadgeLabel = () => {
    if (normalizedRole === 'EMPLOYER' || normalizedRole === 'CLIENT') return 'Employer';
    if (normalizedRole === 'CANDIDATE') return 'Candidate';
    return String(normalizedRole);
  };

  const getUserSubtitle = () => {
    if (normalizedRole === 'EMPLOYER' || normalizedRole === 'CLIENT') return 'Hiring Manager';
    return user?.professional_title || 'Professional';
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 left-3 z-50 md:hidden h-10 w-10 bg-[#0a0f1d] hover:bg-slate-900 border border-slate-800 text-slate-350 rounded-xl flex items-center justify-center cursor-pointer transition focus:outline-none shadow-md shadow-[#0a0f1d]/20"
        aria-label="Toggle navigation menu"
        id="mobile-sidebar-toggle-btn"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Backdrop (Dark mask overlay when drawer is open) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          id="mobile-sidebar-backdrop"
        />
      )}

      {/* Desktop Persistent Sidebar (hidden on mobile, shown on desktop) */}
      <aside className="w-64 bg-[#0a0f1d] dark:bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex transition-all duration-300" id="desktop-sidebar">
        <div className="p-6 border-b border-slate-900">
          <div className="flex flex-col items-start gap-3" id="desktop-sidebar-logo-container">
            <LaunchPathLogo variant="full" textColor="text-white bg-[#0a0f1d]" />
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#7145FF]/20 to-violet-500/10 text-violet-300 text-[10px] font-extrabold rounded-md uppercase border border-[#7145FF]/25 select-none tracking-wider">
              {getRoleBadgeLabel()}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 py-6 scrollbar-thin scrollbar-thumb-slate-800">
          {normalizedRole === 'EMPLOYER' || normalizedRole === 'CLIENT'
            ? renderEmployerItems()
            : renderCandidateItems()}
        </div>

        {user?.realRole === 'SUPERADMIN' && (
          <ThanosSidebarWidget currentRole={role} />
        )}

        <div className="p-4 border-t border-slate-900 bg-[#070b14]/65">
          <div className="flex items-center justify-between gap-3 group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/40 p-3 rounded-xl transition-all duration-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7145FF] to-pink-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm shadow-[#7145FF]/15 select-none">
                {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-violet-300 transition-colors">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{getUserSubtitle()}</p>
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all p-1.5 rounded-lg border-none cursor-pointer"
              title="Logout"
              id="desktop-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sliding Collapsible Sidebar Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0a0f1d] dark:bg-slate-950 border-r border-slate-800 z-45 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        id="mobile-sidebar-drawer"
      >
        <div className="p-6 border-b border-slate-900 pt-16">
          <div className="flex flex-col items-start gap-3" id="mobile-sidebar-logo-container">
            <LaunchPathLogo variant="full" textColor="text-white bg-[#0a0f1d]" />
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#7145FF]/20 to-violet-500/10 text-violet-300 text-[10px] font-extrabold rounded-md uppercase border border-[#7145FF]/25 select-none tracking-wider">
              {getRoleBadgeLabel()}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 py-6 scrollbar-thin scrollbar-thumb-slate-800" onClick={() => setIsOpen(false)}>
          {normalizedRole === 'EMPLOYER' || normalizedRole === 'CLIENT'
            ? renderEmployerItems()
            : renderCandidateItems()}
        </div>

        {user?.realRole === 'SUPERADMIN' && (
          <ThanosSidebarWidget currentRole={role} />
        )}

        <div className="p-4 border-t border-slate-900 bg-[#070b14]/65">
          <div className="flex items-center justify-between gap-3 group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/40 p-3 rounded-xl transition-all duration-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7145FF] to-pink-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm shadow-[#7145FF]/15 select-none">
                {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-violet-300 transition-colors">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{getUserSubtitle()}</p>
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all p-1.5 rounded-lg border-none cursor-pointer"
              title="Logout"
              id="mobile-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
