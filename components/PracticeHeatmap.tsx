'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flame, TrendingUp, Clock, BarChart3, ChevronRight, HelpCircle } from 'lucide-react';

interface PracticeDay {
  date: Date;
  dateString: string;
  sessions: number;
  intensity: 'None' | 'Light' | 'Moderate' | 'Intense';
  minutes: number;
  topics: string[];
}

export default function PracticeHeatmap() {
  // Generate last 30 days dynamically
  const heatmapData: PracticeDay[] = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (29 - i));
      
      // Seed interesting and realistic patterns
      const seedVal = (i * 3 + (i % 2) * 5 + (i % 7) * 2) % 11;
      
      let sessions = 0;
      let intensity: 'None' | 'Light' | 'Moderate' | 'Intense' = 'None';
      let minutes = 0;
      let topics: string[] = [];

      if (seedVal === 0 || seedVal === 4) {
        sessions = 0;
        intensity = 'None';
        minutes = 0;
      } else if (seedVal === 1 || seedVal === 5 || seedVal === 9) {
        sessions = 1;
        intensity = 'Light';
        minutes = Math.round(12 + (seedVal * 1.5));
        topics = ['Behavioral Pitch', 'Resume Walkthrough'];
      } else if (seedVal === 2 || seedVal === 6 || seedVal === 8) {
        sessions = 2;
        intensity = 'Moderate';
        minutes = Math.round(25 + (seedVal * 2));
        topics = ['Speech Clarity', 'Technical Architecture', 'System Design Basics'];
      } else {
        sessions = 3;
        intensity = 'Intense';
        minutes = Math.round(45 + (seedVal * 2.5));
        topics = ['Mock Live Q&A', 'AI Feedback Review', 'Extreme Pacing Challenge'];
      }

      return {
        date: d,
        dateString: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        sessions,
        intensity,
        minutes,
        topics
      };
    });
  }, []);

  const [activeHoverId, setActiveHoverId] = useState<number | null>(null);

  // Compute metrics
  const stats = React.useMemo(() => {
    let totalSessions = 0;
    let totalMinutes = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let highestStreak = 0;

    heatmapData.forEach((day, index) => {
      totalSessions += day.sessions;
      totalMinutes += day.minutes;
      if (day.sessions > 0) {
        activeDays++;
        currentStreak++;
        if (currentStreak > highestStreak) {
          highestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    });

    return {
      totalSessions,
      totalMinutes,
      activeDays,
      streak: currentStreak > 0 ? currentStreak : highestStreak || 4,
      avgDuration: activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0
    };
  }, [heatmapData]);

  const getIntensityClass = (intensity: 'None' | 'Light' | 'Moderate' | 'Intense') => {
    switch (intensity) {
      case 'None':
        return 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-800';
      case 'Light':
        return 'bg-violet-100 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/10 hover:bg-violet-150 dark:hover:bg-violet-950/40';
      case 'Moderate':
        return 'bg-violet-300 dark:bg-violet-800/60 text-violet-900 dark:text-violet-200 border-violet-400/40 dark:border-violet-700/30 hover:bg-violet-400/80 dark:hover:bg-violet-800';
      case 'Intense':
        return 'bg-[#7145FF] text-white border-violet-600 dark:border-[#7145FF] hover:bg-[#5b32e6] shadow-sm shadow-[#7145FF]/10';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Header section */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Calendar className="w-4 h-4 text-[#7145FF]" /> 30-Day Practice Intensity Heatmap
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing the frequency, active length, and intensity of your AI speech coaching sessions.
          </p>
        </div>
        {/* Real-time streak badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider leading-none">Practice Streak</span>
            <span className="text-xs font-extrabold text-amber-800 dark:text-amber-350 leading-none">{stats.streak} Days Active</span>
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="p-6 space-y-6">
        
        {/* Blocks heatmap track */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            <span>30 days ago</span>
            <span>Today</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-15 gap-2 pb-2">
            {heatmapData.map((day, idx) => (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() => setActiveHoverId(idx)}
                onMouseLeave={() => setActiveHoverId(null)}
              >
                <div
                  className={`aspect-square w-full rounded-lg border flex items-center justify-center cursor-help transition-all duration-200 ${getIntensityClass(
                    day.intensity
                  )} ${activeHoverId === idx ? 'scale-105 ring-2 ring-[#7145FF]/40 shadow-sm' : ''}`}
                >
                  <span className="text-[10px] font-semibold font-mono opacity-80 select-none">
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Animated Tooltip */}
                <AnimatePresence>
                  {activeHoverId === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900 dark:bg-slate-950 text-white rounded-lg p-3 shadow-xl text-left text-xs pointer-events-none border border-slate-800 font-sans"
                    >
                      {/* Triangle pointer */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-slate-900 dark:border-t-slate-950" />
                      
                      <p className="font-extrabold text-[#7145FF] text-[10px] uppercase tracking-wider font-mono">
                        {day.dateString}
                      </p>
                      <div className="mt-1.5 flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                        <span className="font-medium text-slate-300">Sessions</span>
                        <span className="font-black text-white">{day.sessions} ({day.intensity})</span>
                      </div>
                      {day.sessions > 0 && (
                        <>
                          <div className="mt-1 flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                            <span className="font-medium text-slate-300">Duration</span>
                            <span className="font-black text-emerald-400">{day.minutes} mins</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Trained Topics:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {day.topics.map((t, tIdx) => (
                                <span key={tIdx} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white font-medium max-w-[190px] truncate block">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Color Key Guide */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Hover blocks to review coach feedback log</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Less</span>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" title="None" />
                <div className="w-5 h-5 rounded bg-violet-100 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-900/10" title="Light Practice" />
                <div className="w-5 h-5 rounded bg-violet-300 dark:bg-violet-800/60 border border-violet-400/40 dark:border-violet-700/30" title="Moderate Practice" />
                <div className="w-5 h-5 rounded bg-[#7145FF] border border-violet-600 dark:border-[#7145FF]" title="Intense Practice" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">More</span>
            </div>
          </div>
        </div>

        {/* Breakdown Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-805 text-left transition-colors">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">Active Days</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">{stats.activeDays}</span>
              <span className="text-xs text-slate-500">/ 30 Days</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-805 text-left transition-colors">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">Completed Runs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">{stats.totalSessions}</span>
              <span className="text-xs text-slate-500">Sessions</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-805 text-left transition-colors">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">Total Duration</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">{stats.totalMinutes}</span>
              <span className="text-xs text-slate-500">Mins</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-805 text-left transition-colors">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">Avg Session</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-pink-600 dark:text-pink-400">{stats.avgDuration}</span>
              <span className="text-xs text-slate-500 font-semibold">Mins / Day</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
