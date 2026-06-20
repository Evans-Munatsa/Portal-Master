'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  ExternalLink, 
  FileText, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ShieldAlert,
  Award,
  Check,
  Video,
  Save
} from 'lucide-react';

interface SuperadminCandidateInspectorProps {
  inspectCandidate: any;
  setInspectCandidate: (candidate: any) => void;
  inspectTab: string;
  setInspectTab: (tab: string) => void;
  interviews: any[];
  onRefresh?: () => void;
}

export default function SuperadminCandidateInspector({
  inspectCandidate,
  setInspectCandidate,
  inspectTab,
  setInspectTab,
  interviews = [],
  onRefresh
}: SuperadminCandidateInspectorProps) {
  const readiness = inspectCandidate?.video_interviews?.[0];
  const [manualScore, setManualScore] = useState(0);
  const [manualFeedback, setManualFeedback] = useState('');
  const [manualQuestions, setManualQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (readiness) {
      setManualScore(readiness.score || 0);
      setManualFeedback(readiness.feedback || '');
      let parsed: any[] = [];
      try {
        parsed = typeof readiness.questions === 'string'
          ? JSON.parse(readiness.questions)
          : (readiness.questions || []);
      } catch (e) {
        parsed = [];
      }
      setManualQuestions(parsed);
    } else {
      setManualScore(0);
      setManualFeedback('');
      setManualQuestions([]);
    }
    setSubmitSuccess(false);
    setSubmitError('');
  }, [inspectCandidate, readiness]);

  const handleSaveGrades = async () => {
    if (!readiness) return;
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/superadmin/video-interview/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: readiness.id,
          score: manualScore,
          feedback: manualFeedback,
          questions: manualQuestions
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit score grading');
      }

      setSubmitSuccess(true);
      
      const updatedVideoArr = [{
        ...readiness,
        score: manualScore,
        feedback: manualFeedback,
        status: 'COMPLETED',
        questions: typeof readiness.questions === 'string' 
          ? JSON.stringify(manualQuestions) 
          : manualQuestions
      }];
      
      setInspectCandidate({
        ...inspectCandidate,
        video_interviews: updatedVideoArr
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error processing grades.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionTranscriptChange = (qi: number, value: string) => {
    const updated = [...manualQuestions];
    updated[qi] = { ...updated[qi], transcript: value };
    setManualQuestions(updated);
  };

  const handleQuestionScoreChange = (qi: number, value: number) => {
    const updated = [...manualQuestions];
    const scoreVal = Math.max(0, Math.min(100, value));
    updated[qi] = { 
      ...updated[qi], 
      questionScore: scoreVal,
      score: scoreVal,
      question_score: scoreVal 
    };
    setManualQuestions(updated);
  };

  if (!inspectCandidate) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800 rounded-3xl animate-scale-in">
        
        {/* Header block with candidate branding */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7145FF] to-indigo-500 flex items-center justify-center text-lg font-mono font-black text-white border border-[#7145FF]/30 select-none shadow-lg shadow-[#7145FF]/10">
              {inspectCandidate.name?.substring(0, 2).toUpperCase() || 'CD'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {inspectCandidate.name}
                <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 bg-[#7145FF]/10 border border-[#7145FF]/30 rounded text-[#a385ff] font-extrabold shadow-sm animate-pulse">
                  #{inspectCandidate.id}
                </span>
              </h2>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">{inspectCandidate.professional_title || 'Software Candidate'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 w-full">
                <span className="flex items-center gap-1 shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {inspectCandidate.email}
                </span>
                {inspectCandidate.experience_level && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 border border-slate-700/60 rounded text-slate-300 font-mono text-[10.5px]">
                    EXP: {inspectCandidate.experience_level}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* External links and state trackers */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto select-none">
            {inspectCandidate.linkedin_url && (
              <a 
                href={inspectCandidate.linkedin_url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-550/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition font-mono"
              >
                LinkedIn <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {inspectCandidate.github_url && (
              <a 
                href={inspectCandidate.github_url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/25 text-pink-405 border border-pink-550/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition font-mono"
              >
                GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button 
              onClick={() => setInspectCandidate(null)}
              className="p-2 border border-slate-800 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition cursor-pointer font-bold ml-1"
              title="Close Inspect Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation within the candidate inspection portal */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap gap-1.5 select-none">
          <button
            onClick={() => setInspectTab('profile')}
            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
              inspectTab === 'profile'
                ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-400" /> RESUME PAYLOAD
          </button>
          
          <button
            onClick={() => setInspectTab('video')}
            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 relative ${
              inspectTab === 'video'
                ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Activity className="w-4 h-4 text-violet-400" /> 
            VIDEO READINESS 
            {inspectCandidate.video_interviews?.length > 0 && (
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute top-1 right-2" />
            )}
          </button>

          <button
            onClick={() => setInspectTab('matches')}
            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
              inspectTab === 'matches'
                ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-400" /> POSITION MATCHES ({inspectCandidate.job_matches?.length || 0})
          </button>

          <button
            onClick={() => setInspectTab('pipeline')}
            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
              inspectTab === 'pipeline'
                ? 'bg-[#7145FF]/10 text-white border border-[#7145FF]/30 shadow-inner'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" /> HIRING PIPELINE
          </button>
        </div>

        {/* Core Panels Wrapper */}
        <div className="flex-1 overflow-y-auto p-8 min-h-0 bg-slate-900 space-y-6">

          {/* PANEL 1: PROFILE & PARSED RESUME TEXT */}
          {inspectTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic details cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Candidate Designation</span>
                  <p className="text-white font-bold text-sm mt-1">{inspectCandidate.professional_title || 'General Software Architect'}</p>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Email Authentication</span>
                  <p className="text-white font-bold text-sm mt-1">{inspectCandidate.email || 'N/A'}</p>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Resume Processing Tasks</span>
                  <div className="mt-1 flex items-center gap-2">
                    {inspectCandidate.resume_tasks && inspectCandidate.resume_tasks.length > 0 ? (
                      (() => {
                        const task = inspectCandidate.resume_tasks[0];
                        let taskColor = "text-yellow-405";
                        if (task.status === 'COMPLETED') taskColor = "text-emerald-400";
                        else if (task.status === 'FAILED') taskColor = "text-red-400";
                        return (
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${taskColor}`}>
                            {task.status} ({task.progress}%)
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-slate-500 italic font-mono">No tasks queued</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full text parsed from resume PDF uploads */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-950/10 p-1 rounded-lg">
                  <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#7145FF]">System Parsed Resume Text Content</h4>
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.navigator && window.navigator.clipboard) {
                        window.navigator.clipboard.writeText(inspectCandidate.resume_text || '');
                        alert('Resume text copied to clipboard successfully!');
                      }
                    }} 
                    type="button"
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded transition max-w-max cursor-pointer"
                  >
                    COPY TO CLIPBOARD
                  </button>
                </div>
                
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 text-xs text-emerald-400/90 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-slate-800 scrolling-touch select-text">
                  {inspectCandidate.resume_text || 'NO_PHYSICAL_RESUME_PAYLOAD_DEPLOYED_FOR_MATCHING'}
                </div>

                <p className="text-[10.5px] italic text-slate-400 text-center leading-normal">
                  This text document matches standard embeddings extracted upon initial upload. Secure recruitment policies apply under South African POPIA regulations.
                </p>
              </div>
            </div>
          )}

          {/* PANEL 2: VIDEO INTERVIEW & READINESS */}
          {inspectTab === 'video' && (
            <div className="space-y-6 animate-fade-in font-sans">
              {(() => {
                const readiness = inspectCandidate.video_interviews?.[0];
                if (!readiness) {
                  return (
                    <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl p-8 space-y-4">
                      <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-655">
                        <ShieldAlert className="w-8 h-8 text-slate-500" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1.5">
                        <h3 className="font-bold text-white text-base">Video Interview Incomplete</h3>
                        <p className="text-xs text-slate-450 leading-relaxed">
                          This candidate has not recorded their video interview or completed their initial readiness screen yet. Remind them to complete it via their profile settings.
                        </p>
                      </div>
                    </div>
                  );
                }

                // Else, render the video readiness report
                let scoresColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
                if (readiness.score < 55) scoresColor = "text-red-400 border-red-500/20 bg-red-500/5";
                else if (readiness.score < 75) scoresColor = "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";

                let parsedQuestions: any[] = [];
                try {
                  parsedQuestions = typeof readiness.questions === 'string' 
                    ? JSON.parse(readiness.questions) 
                    : (readiness.questions || []);
                } catch (e) {
                  parsedQuestions = [];
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Left Column: Video stream, Score slider and Coaching Summary editable box */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Candidate Stream Presentation Recording</span>
                          {readiness.status === 'PENDING_REVIEW' && (
                            <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono animate-pulse">
                              Awaiting Review & Rating
                            </span>
                          )}
                        </div>
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative shadow-lg">
                          <video 
                            controls 
                            src={readiness.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-man-delivering-presentation-on-a-screen-40331-large.mp4'} 
                            className="w-full h-full object-cover"
                            poster="https://picsum.photos/seed/recruitment-review/800/450"
                          />
                        </div>
                      </div>

                      {/* Manual Overall Score Modification widget */}
                      <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-3">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> Overall Readiness Quotient
                          </span>
                          <span className={`text-sm font-bold px-2.5 py-0.5 rounded border ${scoresColor}`}>
                            {manualScore}% Assigned
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#7145FF] border border-slate-800"
                            value={manualScore}
                            onChange={(e) => setManualScore(Number(e.target.value))}
                          />
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-[#7145FF]"
                            value={manualScore}
                            onChange={(e) => setManualScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                          />
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7145FF] to-indigo-500 transition-all duration-300" 
                            style={{ width: `${manualScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Recruiter Coaching Comment */}
                      <div className="p-5 bg-[#7145FF]/5 rounded-2xl border border-[#7145FF]/15 space-y-3">
                        <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest block">Recruiter Executive Summary & Coaching Feedback</span>
                        <textarea
                          className="w-full h-28 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-xs focus:outline-none focus:border-[#7145FF] text-slate-200 leading-relaxed font-sans placeholder-slate-500"
                          value={manualFeedback}
                          onChange={(e) => setManualFeedback(e.target.value)}
                          placeholder="Type manual review summary, evaluation rationale & candidate coaching notes here..."
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Right Column: Answers, Speech transcripts, and Question scores */}
                    <div className="space-y-4 flex flex-col max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Editable Speech Transcripts & Question Ratings ({manualQuestions.length})</span>
                        <span className="text-[9px] text-slate-400">Click text below to correct speech transcripts</span>
                      </div>
                      
                      <div className="space-y-4 pr-1">
                        {manualQuestions.map((q: any, qi: number) => {
                          const qScore = q.questionScore ?? q.score ?? q.question_score ?? 0;
                          return (
                            <div key={q.id || qi} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3 text-xs animate-fade-in">
                              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 font-semibold text-slate-200 gap-2">
                                <span className="truncate">Q0{q.id || qi + 1}: {q.title}</span>
                                <div className="flex items-center gap-2 shrink-0 animate-fade-in">
                                  <span className="text-[10px] font-mono font-bold text-slate-405">Score:</span>
                                  <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-12 bg-slate-900 border border-slate-850 rounded-lg py-1 px-1.5 text-center text-[10px] font-mono font-bold text-[#a385ff] focus:outline-none focus:border-[#7145FF]"
                                    value={qScore}
                                    onChange={(e) => handleQuestionScoreChange(qi, Number(e.target.value))}
                                  />
                                  <span className="text-[#a385ff] text-[10px] font-mono">%</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-sans">Corrected Speech Transcript:</span>
                                <textarea
                                  className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#7145FF] transition-all leading-relaxed placeholder-slate-505 font-sans"
                                  value={q.transcript || ''}
                                  onChange={(e) => handleQuestionTranscriptChange(qi, e.target.value)}
                                  placeholder="No transcript generated for this response. Add manual transcription or notes here..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Scoring Actions and submit state indications */}
                      <div className="pt-4 border-t border-slate-800 space-y-3 shrink-0">
                        {submitError && (
                          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium font-sans">
                            ⚠️ {submitError}
                          </div>
                        )}
                        {submitSuccess && (
                          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2 font-sans">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 animate-scale-in" /> Evaluation Successfully Approved & Published!
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleSaveGrades}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#7145FF] hover:bg-[#5b32e6] disabled:bg-slate-800 text-white p-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition shadow-lg shadow-[#7145FF]/10 cursor-pointer flex items-center justify-center gap-2 font-mono"
                          >
                            {isSubmitting ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                Publishing Grades...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" /> Save Score & Approve Interview
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()}
            </div>
          )}

          {/* PANEL 3: POSITION MATCHES MATRIX */}
          {inspectTab === 'matches' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex justify-between items-center bg-slate-950/40 p-4 border border-slate-805 rounded-2xl">
                <div>
                  <h4 className="font-bold text-white text-sm">Targeted Compatibility Matrix</h4>
                  <p className="text-xs text-slate-400 mt-1">Cross-referencing candidate qualifications with live system open position mandates.</p>
                </div>
                <span className="px-2.5 py-0.5 font-mono text-[10px] font-extrabold bg-[#7145FF]/10 text-[#a385ff] rounded border border-[#7145FF]/20">
                  Matches found: {inspectCandidate.job_matches?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inspectCandidate.job_matches && inspectCandidate.job_matches.length > 0 ? (
                  inspectCandidate.job_matches.map((m: any, idx: number) => {
                    const score = m.match_score;
                    let progressColor = "bg-[#7145FF]";
                    let badgeStyle = "bg-[#7145FF]/10 text-white border-[#7145FF]/20";
                    if (score >= 85) {
                      progressColor = "bg-emerald-500";
                      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                    } else if (score < 60) {
                      progressColor = "bg-slate-500";
                      badgeStyle = "bg-slate-800 text-slate-400 border-slate-700";
                    }

                    return (
                      <div key={m.id || idx} className="bg-slate-950/50 border border-slate-850 rounded-2xl overflow-hidden p-5 flex flex-col space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Computed compatibility</span>
                            <h4 className="font-bold text-white text-sm mt-0.5">{m.job?.title || 'External Matching Task'}</h4>
                            <p className="text-xs text-[#a385ff] font-semibold">{m.job?.company || 'LaunchPath Network'}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 font-mono font-extrabold rounded-full border text-xs ${badgeStyle}`}>
                            {score}% Fit
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>

                        {/* Skills alignment */}
                        <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                          <div className="space-y-1">
                            <span className="font-bold font-mono tracking-wide text-emerald-400 uppercase text-[9.5px]">Matched Skills</span>
                            <p className="text-slate-355 p-2 bg-slate-900/40 border border-slate-855 rounded-xl min-h-12 leading-relaxed font-mono">
                              {m.matched_skills || 'No skills mapped'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold font-mono tracking-wide text-red-400 uppercase text-[9.5px]">Missing Skills</span>
                            <p className="text-slate-355 p-2 bg-slate-900/40 border border-slate-855 rounded-xl min-h-12 leading-relaxed font-mono">
                              {m.missing_skills || 'None (100% Fit Alignment)'}
                            </p>
                          </div>
                        </div>

                        {/* Analytical summaries */}
                        <div className="space-y-2 pt-2 border-t border-slate-850 text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block">Fit Summary Inference</span>
                            <p className="text-slate-300 leading-relaxed font-medium">{m.fit_summary || 'Fit synthesis pending.'}</p>
                          </div>
                          <div className="space-y-0.5 pt-1.5 border-t border-slate-850/60 font-sans">
                            <span className="font-bold text-[#a385ff] uppercase text-[9px] tracking-wider block">Recruitment Advice</span>
                            <p className="text-slate-300 italic">{m.recommendation || 'Recommendation pipeline pending.'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-12 bg-slate-950/10 border border-dashed border-slate-800 rounded-3xl p-6">
                    <p className="text-xs text-slate-550 italic">No direct position matching embeddings generated inside database yet. Run force-rescore or create manual linkages inside manual Matchmaker panel.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANEL 4: HIRING PIPELINE & APPLICATIONS */}
          {inspectTab === 'pipeline' && (
            <div className="space-y-8 animate-fade-in font-sans">
              
              {/* Active job applications */}
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Active Job Application Profiles
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-slate-505">Registered: {inspectCandidate.applications?.length || 0}</span>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#7145FF]/5 border-b border-slate-855 text-slate-550 leading-normal font-mono">
                      <tr className="uppercase">
                        <th className="px-5 py-3">Applied Position</th>
                        <th className="px-5 py-3">Company Client</th>
                        <th className="px-5 py-3">Submission Date</th>
                        <th className="px-5 py-3 text-center">Pipeline Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-855 bg-slate-950/10">
                      {inspectCandidate.applications && inspectCandidate.applications.length > 0 ? (
                        inspectCandidate.applications.map((app: any, idx: number) => {
                          let statusCls = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                          if (['Interviewing', 'Offered'].includes(app.status)) {
                            statusCls = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                          } else if (app.status === 'Rejected' || app.status === 'Declined') {
                            statusCls = "bg-red-500/10 text-red-400 border-red-500/20";
                          } else if (app.status === 'Reviewed') {
                            statusCls = "bg-blue-500/10 text-blue-400 border-blue-500/15";
                          }

                          return (
                            <tr key={app.id || idx} className="hover:bg-slate-900/30 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-white">{app.job?.title || 'Deleted Position'}</td>
                              <td className="px-5 py-3.5 text-slate-350 font-semibold">{app.job?.company || 'LaunchPath Client'}</td>
                              <td className="px-5 py-3.5 font-mono text-slate-455">
                                {app.applied_at ? new Date(app.applied_at).toLocaleString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9.5px] uppercase font-mono font-bold tracking-wider ${statusCls}`}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-6 text-center text-slate-500 italic">This candidate has not submitted applications directly yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Physical scheduled interviews */}
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" /> Physical & Proposed Scheduled Interviews
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const matchIv = (interviews || []).filter((iv: any) => iv.candidate_id === inspectCandidate.id);
                    if (matchIv.length === 0) {
                      return (
                        <p className="col-span-2 text-xs text-slate-500 italic p-6 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl text-center">
                          No physical or zoom interviews scheduled for this candidate yet.
                        </p>
                      );
                    }

                    return matchIv.map((iv: any) => {
                      let statusBadge = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                      if (iv.status === 'Confirmed') statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                      else if (iv.status === 'Cancelled') statusBadge = "bg-red-500/10 text-red-400 border-red-500/20";

                      return (
                        <div key={iv.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3 font-sans animate-fade-in">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-mono text-slate-505 font-bold uppercase">INTERVIEW_ID: #{iv.id}</p>
                              <h5 className="font-bold text-white text-xs mt-0.5">{iv.application?.job?.title || 'Open Position'}</h5>
                              <p className="text-slate-450 text-[11.5px] mt-0.5">{iv.application?.job?.company || 'Employer Tenant'}</p>
                            </div>
                            <span className={`text-[9px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border ${statusBadge}`}>
                              {iv.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs font-mono text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-[#a385ff]" />
                            <span>{new Date(iv.proposed_time).toLocaleString()}</span>
                          </div>
                          {iv.notes && (
                            <p className="text-xs text-slate-400 italic p-2 bg-slate-900/30 border border-slate-800 rounded-xl font-sans leading-relaxed">
                              Notes: {iv.notes}
                            </p>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer controls */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950 flex justify-between items-center select-none">
          <span className="text-[10px] font-mono text-slate-550 leading-relaxed max-w-sm">
            Superadmin Candidate Dossier inspection view. Actions logged dynamically to platform logs.
          </span>
          <button 
            onClick={() => setInspectCandidate(null)} 
            className="px-6 py-2.5 bg-[#7145FF] hover:bg-[#5b32e6] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#7145FF]/10 cursor-pointer font-sans uppercase tracking-wider"
          >
            Completed Inspection
          </button>
        </div>

      </div>
    </div>
  );
}
