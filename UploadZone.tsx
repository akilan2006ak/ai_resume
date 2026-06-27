import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Trash2, Check, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are supported.');
      onFileSelect(null);
      return;
    }
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      onFileSelect(null);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="upload-zone-container" className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 tracking-tight">
        Upload PDF Resume <span className="text-red-500">*</span>
      </label>

      <div
        id="drag-drop-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50/10 hover:border-emerald-500'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {selectedFile ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 truncate max-w-[280px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  <Check size={12} /> Ready
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-2 py-0.5 rounded-full transition-colors"
                  title="Remove file"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                <Upload size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">
                  <span className="text-indigo-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  Strictly PDF files up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200"
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
