import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, FileText, ChevronRight, CheckCircle2, Sparkles, 
  Settings, HelpCircle, FileCheck2, LayoutGrid, Info, Compass, 
  Terminal, Server, HelpCircle as HelpIcon, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { JOB_TEMPLATES, JobTemplate } from './components/JobTemplates';
import UploadZone from './components/UploadZone';
import ResultDisplay from './components/ResultDisplay';
import { AnalysisData } from './types';

export default function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingSteps = [
    "Reading uploaded PDF resume & extracting document content...",
    "Scanning job description for required skills and credentials...",
    "Synthesizing alignment matching using Gemini Flash API...",
    "Structuring ATS recommendations and score matrices...",
    "Finalizing resume improvement guidelines..."
  ];

  // Increment loading steps during analysis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleSelectTemplate = (template: JobTemplate) => {
    setJobDescription(template.description);
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError("Please select or drag-and-drop a PDF resume file.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a Job Description or select a pre-configured template.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Failed to analyze resume.";
        try {
          const result = await response.json();
          errorMsg = result.details || result.error || errorMsg;
        } catch (e) {
          // If response is HTML or plain text, read it
          try {
            const text = await response.text();
            // Extract body text if it's an HTML page, or show first 200 chars
            const bodyMatch = text.match(/<pre>([\s\S]*?)<\/pre>/) || text.match(/<body>([\s\S]*?)<\/body>/);
            const extractedText = bodyMatch ? bodyMatch[1].trim() : text.substring(0, 300);
            errorMsg = `Server error (${response.status}): ${extractedText || response.statusText}`;
          } catch (textErr) {
            errorMsg = `Server error (${response.status}): ${response.statusText}`;
          }
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setAnalysisResult(result.data);
      } else {
        throw new Error("Invalid response format received from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 gap-6">
      
      {/* Navigation Header (Bento Style) */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
            <FileCheck2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 font-display">
              AI Resume Analyzer <span className="text-indigo-600 font-medium text-xs">v2.1</span>
            </h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              ATS Keywords Match Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Powered by Gemini 3.5
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
            <ShieldCheck size={12} className="text-indigo-600 animate-pulse" />
            Active Core
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto">
        
        {/* Intro Section (Hidden when displaying results) */}
        {!analysisResult && !isAnalyzing && (
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight font-display sm:text-3xl">
              ATS Alignment Workspace
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl font-medium uppercase tracking-wide">
              Optimize compatibility score, identify skill gaps, and get high-potential recommendations
            </p>
          </div>
        )}

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              /* Loading Screen Component */
              <motion.div
                key="loading-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm space-y-8 max-w-xl mx-auto my-12"
              >
                <div className="relative flex justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-bold text-slate-800 uppercase tracking-widest">
                    Running Diagnostics
                  </h3>
                  <p className="text-xs text-slate-500 animate-pulse min-h-[36px] max-w-md mx-auto leading-relaxed">
                    {loadingSteps[loadingStep]}
                  </p>
                </div>

                {/* Simulated Step Progress */}
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-full rounded-full"
                      animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>STEP {loadingStep + 1} OF {loadingSteps.length}</span>
                    <span>{Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}% COMPLETE</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Parsing structures, optimizing keywords, and checking strict ATS matching constraints...
                </p>
              </motion.div>

            ) : analysisResult ? (
              /* Results Dashboard Component (Styled beautifully to fit Bento theme) */
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm"
              >
                <ResultDisplay analysis={analysisResult} onReset={handleReset} />
              </motion.div>

            ) : (
              /* Standard Setup Input Panels (Using modern Bento Spacing) */
              <motion.div
                key="input-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
              >
                
                {/* Form Elements (Left side, col-span-8) */}
                <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                    
                    {/* Step 1: Upload zones */}
                    <UploadZone onFileSelect={setResumeFile} selectedFile={resumeFile} />

                    {/* Step 2: Job description template auto-filler */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">
                          Target Job Description <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start">
                          <Compass size={12} className="shrink-0" /> Fast-track with template
                        </span>
                      </div>

                      {/* Template Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {JOB_TEMPLATES.map((tpl, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectTemplate(tpl)}
                            className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 transition-all font-semibold text-left cursor-pointer"
                          >
                            <Briefcase size={12} className="shrink-0 text-slate-400" />
                            <span>{tpl.title}</span>
                          </button>
                        ))}
                      </div>

                      {/* Job Description Textarea */}
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste requirements, expectations, tech stacks, or full descriptions from your target job opening..."
                        className="w-full h-64 p-4 border border-slate-200 rounded-2xl text-xs text-slate-600 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 focus:outline-none transition-all placeholder:text-slate-400 font-normal leading-relaxed resize-none"
                      />
                    </div>

                    {/* Error Alerts */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-2.5 text-sm text-red-700 font-normal"
                      >
                        <Info size={16} className="mt-0.5 shrink-0 text-red-500" />
                        <div>
                          <p className="font-bold text-red-800 uppercase tracking-wide text-xs">Validation Concern</p>
                          <p className="mt-1 text-xs text-red-700 leading-relaxed font-semibold">{error}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Submit Button Container */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer select-none text-xs uppercase tracking-wider font-display"
                      >
                        <span>Analyze Match Alignment</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>

                  </div>
                </form>

                {/* Right Side Info Box (Right side, col-span-4) */}
                <div className="lg:col-span-4 space-y-5">
                  
                  {/* Informational Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Info size={13} className="text-indigo-600 shrink-0" />
                      How ATS Systems Work
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Most enterprises utilize Applicant Tracking Systems (ATS) to filter resumes before they reach human eyes. Systems match direct technical skills, structural formatting, and experience durations against targeted job description phrases.
                    </p>
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-xs text-slate-600 font-semibold leading-normal">Extracting metadata using a server-side layout textual parser</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-xs text-slate-600 font-semibold leading-normal">Matching required vs. optional credentials and core capabilities</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-xs text-slate-600 font-semibold leading-normal">Scoring alignment and flagging actionable keyword improvements</p>
                      </div>
                    </div>
                  </div>

                  {/* Built-in Features Grid Widget */}
                  <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Terminal size={80} />
                    </div>
                    
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal size={13} /> Full Stack Integration Details
                    </h4>
                    
                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          Server-Side Parsing
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          Runs <code className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-[10px] font-mono">pdf-parse</code> on Express to capture raw PDF layouts reliably without client exposing.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          Gemini 3.5 Structured JSON
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          Requests JSON-Schema outputs from Gemini for parsing details, scoring alignment, strengths, weaknesses, and concrete suggestion checklists.
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          Local Security & Speed
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          Handles file buffers exclusively in-memory on our sandboxed Cloud Run container environment.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Footer Info Banner */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold pt-4 border-t border-slate-200 gap-4 print:hidden">
        <p>Session ID: 8A72-F91X • Analysis Type: Contextual Matching</p>
        <p>© 2026 TalentMatch AI Systems</p>
      </footer>

    </div>
  );
}
