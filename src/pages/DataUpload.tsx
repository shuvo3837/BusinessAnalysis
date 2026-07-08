import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useNavigate } from 'react-router-dom';

export default function DataUpload() {
  const { setCustomAnalytics } = useBusiness();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        let fileMimeType = file.type;
        if (file.name.toLowerCase().endsWith(".csv")) {
          fileMimeType = "text/plain"; 
        } else if (!fileMimeType && file.name.toLowerCase().endsWith(".pdf")) {
          fileMimeType = "application/pdf";
        } else if (!fileMimeType) {
          fileMimeType = "application/octet-stream";
        }

        const res = await fetch("/api/analyze-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Data,
            mimeType: fileMimeType
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to analyze file. Please ensure it is a valid CSV or PDF.");
        }

        const data = await res.json();
        setCustomAnalytics(data);
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [setCustomAnalytics, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-syne mb-2">Upload Business Data</h1>
        <p className="text-slate-400">BizMind AI supports CSV, XLSX, and PDF exports from tools like Daraz, Shopify, WooCommerce, or QuickBooks.</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-[#2A2A3A] bg-[#12121A] hover:border-slate-600'}`}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-[#1A1A26] rounded-full flex items-center justify-center mx-auto mb-6 shadow-Inner">
          {loading ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          ) : success ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : (
            <UploadCloud className="w-10 h-10 text-blue-500" />
          )}
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Analyzing Data...</h3>
            <p className="text-slate-400 text-sm">BizMind AI is processing your business metrics, identifying trends, and formulating strategies.</p>
          </div>
        ) : success ? (
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-green-400">Analysis Complete!</h3>
            <p className="text-slate-400 text-sm">Redirecting to your new dashboard...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Drag & drop your file here</h3>
            <p className="text-slate-400 text-sm">Or click to browse from your computer</p>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> CSV / XLSX</span>
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> PDF Reports</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-bold text-sm">Upload Failed</h4>
            <p className="text-red-300 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Manual testing button context */}
      <div className="flex flex-col items-center pt-8 border-t border-[#2A2A3A]">
        <p className="text-slate-500 text-sm mb-4">Don't have a dataset ready?</p>
        <button 
           onClick={() => navigate('/dashboard')}
           className="px-6 py-2 border border-[#2A2A3A] bg-[#12121A] hover:bg-[#1A1A26] rounded-lg text-sm font-bold text-slate-300 transition-colors"
        >
          Load Sample Data Demo
        </button>
      </div>
    </div>
  );
}
