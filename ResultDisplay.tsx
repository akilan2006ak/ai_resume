import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, Code, CheckCircle, AlertTriangle, 
  Lightbulb, ChevronRight, CheckSquare, Square, ThumbsUp, 
  AlertCircle, Sparkles, RefreshCw, Printer, Copy, Check 
} from 'lucide-react';
import { AnalysisData } from '../types';
import CircularScore from './CircularScore';

interface ResultDisplayProps {
  analysis: AnalysisData;
  onReset: () => void;
}

export default function ResultDisplay({ analysis, onReset }: ResultDisplayProps) {
  const { atsScore, summary, matchingSkills, missingSkills, strengths, weaknesses, suggestions, parsedDetails } = analysis;
  
  // Custom checklist state for suggestions
  const [completedSuggestions, setCompletedSuggestions] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleSuggestion = (index: number) => {
    setCompletedSuggestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyReport = () => {
    const reportText = `
=== AI RESUME ANALYZER REPORT ===
Candidate: ${parsedDetails.name || 'Not Detected'}
Email: ${parsedDetails.email || 'Not Detected'}
Phone: ${parsedDetails.phone || 'Not Detected'}

ATS Score: ${atsScore}/100

SUMMARY:
${summary}

MATCHING SKILLS:
${matchingSkills.length > 0 ? matchingSkills.map(s => `- ${s}`).join('\n') : 'None detected'}

MISSING SKILLS:
${missingSkills.length > 0 ? missingSkills.map(s => `- ${s}`).join('\n') : 'None detected'}

STRENGTHS:
${strengths.map(s => `- ${s}`).join('\n')}

WEAKNESSES:
${weaknesses.map(w => `- ${w}`).join('\n')}

RECOMMENDED IMPROVEMENTS:
${suggestions.map((s, idx) => `[${completedSuggestions[idx] ? 'X' : ' '}] ${s}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="analysis-results-view" className="space-y-6 animate-fade-in print:bg-white print:p-0">
      
      {/* Header Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="text-indigo-600 shrink-0" size={20} />
            Analysis Complete
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Optimized recommendations compiled by Gemini API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-colors cursor-pointer select-none"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600 shrink-0" />
                Copied Report
              </>
            ) : (
              <>
                <Copy size={14} className="shrink-0" />
                Copy Text Report
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-colors cursor-pointer select-none"
          >
            <Printer size={14} className="shrink-0" />
            Print / PDF
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors cursor-pointer select-none"
          >
            <RefreshCw size={14} className="shrink-0 animate-spin-slow" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Main Content Grid (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Box 1: Score Block (Col span 4) */}
        <section className="md:col-span-4 bg-indigo-600 rounded-3xl p-6 text-white flex flex-col items-center justify-center relative overflow-hidden shadow-sm min-h-[180px]">
          <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl"></div>
          
          <p className="text-xs font-bold uppercase tracking-widest opacity-85 mb-2 relative z-10">
            ATS Match Score
          </p>
          <div className="text-7xl font-black font-display tracking-tight relative z-10 drop-shadow-sm">
            {atsScore}
          </div>
          <p className="text-xs mt-3 font-semibold bg-white/20 px-3 py-1 rounded-xl backdrop-blur-sm relative z-10">
            {atsScore >= 80 ? 'Excellent Match' : atsScore >= 60 ? 'Good Potential' : 'Review Needed'}
          </p>
        </section>

        {/* Box 2: Profile Details / Applicant Info (Col span 8) */}
        <section className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <User size={13} /> Candidate Profile
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
                <p className="text-sm font-bold text-slate-700 truncate mt-0.5">
                  {parsedDetails.name || <span className="text-slate-400 italic font-normal">Not Detected</span>}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-bold text-indigo-600 truncate mt-0.5">
                  {parsedDetails.email ? (
                    <a href={`mailto:${parsedDetails.email}`} className="hover:underline">
                      {parsedDetails.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic font-normal">Not Detected</span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-bold text-slate-700 truncate mt-0.5">
                  {parsedDetails.phone || <span className="text-slate-400 italic font-normal">Not Detected</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {parsedDetails.skills?.slice(0, 10).map((skill, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200/50">
                {skill}
              </span>
            ))}
            {(parsedDetails.skills?.length || 0) > 10 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-extrabold">
                +{(parsedDetails.skills?.length || 0) - 10} more
              </span>
            )}
          </div>
        </section>

        {/* Box 3: Resume Summary (Col span 12) */}
        <section className="md:col-span-12 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Resume Summary
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed font-normal">
            {summary}
          </p>
        </section>

        {/* Box 4: Matching Skills (Col span 6) */}
        <section className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Matching Skills</span>
              <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Found
              </span>
            </h2>
            {matchingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matchingSkills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic py-4">
                No matching primary job description skills detected.
              </div>
            )}
          </div>
        </section>

        {/* Box 5: Missing Skills (Col span 6) */}
        <section className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Missing Skills</span>
              <span className="text-[10px] text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Gap Identified
              </span>
            </h2>
            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-100/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic py-4">
                Superb! No skill gaps found against this job description.
              </div>
            )}
          </div>
          {missingSkills.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-100 pt-2 font-medium">
              💡 Tip: Candidates with these skills are 3x more likely to secure an interview.
            </p>
          )}
        </section>

        {/* Box 6: Strengths (Col span 6) */}
        <section className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Strengths
          </h2>
          <ul className="space-y-2.5">
            {strengths.map((strength, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span className="font-medium leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Box 7: Weaknesses (Col span 6) */}
        <section className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Areas of Concern
          </h2>
          <ul className="space-y-2.5">
            {weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600">
                <span className="text-rose-500 font-bold shrink-0">⚠</span>
                <span className="font-medium leading-relaxed">{weakness}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Box 8: AI Suggestions (Col span 12) */}
        <section className="md:col-span-12 bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 relative z-10">
            AI Suggestions for Improvement
          </h2>
          <p className="text-[11px] text-slate-400 mb-4 max-w-2xl leading-normal relative z-10">
            Optimized copywriting revisions and layout updates for your resume. Click items as you make the edits to keep track of your progress.
          </p>

          <div className="space-y-2 relative z-10">
            {suggestions.map((suggestion, idx) => {
              const isCompleted = !!completedSuggestions[idx];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleSuggestion(idx)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                    isCompleted 
                      ? 'bg-slate-800/40 border-slate-800 text-slate-500 line-through' 
                      : 'bg-slate-800/70 border-slate-800 hover:border-indigo-500/50 text-slate-200 hover:bg-slate-800/90'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckSquare size={16} className="text-indigo-400" />
                    ) : (
                      <Square size={16} className="text-slate-500 hover:text-indigo-400" />
                    )}
                  </div>
                  <div className="text-xs leading-relaxed font-medium">
                    {suggestion}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

    </div>
  );
}
