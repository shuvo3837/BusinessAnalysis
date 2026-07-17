import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useNavigate } from 'react-router-dom';

export default function NoteScanner() {
  const { setCustomAnalytics } = useBusiness();
  const navigate = useNavigate();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setExtractedData(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!imageSrc) return;
    setLoading(true);
    setError(null);
    
    try {
      const base64Data = imageSrc.split(',')[1];
      const res = await fetch("/api/scan-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data, mimeType: "image/jpeg" })
      });

      if (!res.ok) {
         const d = await res.json().catch(()=>({}));
         throw new Error(d.error || "Failed to process image");
      }
      
      const data = await res.json();
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during scanning.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = () => {
    if (extractedData && extractedData.analytics) {
      setCustomAnalytics(extractedData.analytics);
      navigate('/dashboard');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold font-syne text-white mb-2 flex items-center gap-3">
           <Camera className="w-8 h-8 text-blue-500" /> AI Business Scanner
        </h1>
        <p className="text-slate-400">
          Upload or take a photo of your handwritten notes, invoices, or khata pages. BizMind AI will extract sales, expenses, and inventory data automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Image Preview */}
        <div className="space-y-6">
           {!imageSrc ? (
             <div className="border-2 border-dashed border-[#2A2A3A] bg-[#12121A] rounded-2xl p-12 text-center hover:border-blue-500/50 transition-colors">
               <div className="w-20 h-20 bg-[#1A1A26] rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-Inner text-blue-500">
                  <Camera className="w-8 h-8 mb-1" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Scan Business Note</h3>
               <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                 Take a picture of your physical ledger, receipt, or daily sales note.
               </p>

               <input 
                 type="file" 
                 accept="image/*" 
                 capture="environment" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 className="hidden" 
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 mx-auto"
               >
                 <Upload className="w-5 h-5" /> Choose Image or Take Photo
               </button>
             </div>
           ) : (
             <div className="bg-[#12121A] border border-[#2A2A3A] rounded-2xl p-4 flex flex-col items-center relative">
               <button 
                 onClick={() => { setImageSrc(null); setExtractedData(null); }}
                 className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
               <img src={imageSrc} alt="Scanned Note" className="w-full max-h-96 object-contain rounded-lg border border-[#2A2A3A] mb-6" />
               
               {!extractedData && (
                 <button 
                   onClick={processImage}
                   disabled={loading}
                   className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 text-lg"
                 >
                   {loading ? (
                     <><Loader2 className="w-6 h-6 animate-spin" /> Extracting Data with AI...</>
                   ) : (
                     <><FileText className="w-6 h-6" /> Extract Business Data</>
                   )}
                 </button>
               )}
             </div>
           )}

           {error && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
               <div>
                 <h4 className="text-red-400 font-bold text-sm">Processing Failed</h4>
                 <p className="text-red-300 text-sm mt-1">{error}</p>
               </div>
             </div>
           )}
        </div>

        {/* Right Column: AI Extraction Results */}
        <div>
          {extractedData ? (
            <div className="bg-[#12121A] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)] h-full">
              <div className="flex items-center gap-3 mb-6 border-b border-[#2A2A3A] pb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold font-syne text-white">Data Successfully Extracted</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Extracted Sales</h3>
                  <div className="space-y-2">
                    {extractedData.sales?.length > 0 ? extractedData.sales.map((sale: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-[#1A1A26] p-3 rounded-lg border border-[#2A2A3A]">
                         <span className="text-slate-200 font-medium">{sale.item}</span>
                         <div className="text-right">
                           <span className="text-blue-400 font-bold mr-3">{sale.qty} sold</span>
                           <span className="text-green-400">${sale.amount}</span>
                         </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500">No sales detected.</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Detected Expenses</h3>
                  <div className="space-y-2">
                    {extractedData.expenses?.length > 0 ? extractedData.expenses.map((expense: any, i: number) => (
                       <div key={i} className="flex justify-between items-center bg-[#1A1A26] p-3 rounded-lg border border-[#2A2A3A]">
                         <span className="text-slate-200">{expense.category || expense.item}</span>
                         <span className="text-red-400 font-bold">${expense.amount}</span>
                       </div>
                    )) : (
                      <p className="text-sm text-slate-500">No expenses detected.</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <h3 className="text-blue-400 font-bold mb-2">AI Summary & Action</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {extractedData.summary || "Data mapped correctly."}
                  </p>
                </div>

                <button 
                  onClick={handleSaveData}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-8"
                >
                  Save Records & View Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-[#12121A]/50 border border-[#2A2A3A] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-[#2A2A3A] mb-4" />
              <p className="text-slate-500 max-w-sm">
                Extracted data and AI insights will appear here once the image is processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
