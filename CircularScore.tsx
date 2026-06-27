import React from 'react';
import { motion } from 'motion/react';

interface CircularScoreProps {
  score: number;
}

export default function CircularScore({ score }: CircularScoreProps) {
  // SVG Calculations
  const radius = 55;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color matching ranges
  let colorClass = 'stroke-red-500';
  let bgClass = 'bg-red-50 text-red-700 border-red-100';
  let statusText = 'Low Alignment';

  if (score > 75) {
    colorClass = 'stroke-emerald-500';
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    statusText = 'Excellent Match';
  } else if (score > 50) {
    colorClass = 'stroke-amber-500';
    bgClass = 'bg-amber-50 text-amber-700 border-amber-100';
    statusText = 'Good Match';
  }

  return (
    <div id="circular-score-gauge" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background Track Circle */}
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Animated Highlight Track */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            className={`fill-none ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Core Center Label */}
        <div className="text-center z-10">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-extrabold text-slate-900 font-display tracking-tight"
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 font-semibold block mt-0.5">ATS SCORE</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${bgClass}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
