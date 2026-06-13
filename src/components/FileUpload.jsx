import { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function FileUpload({ onFileLoaded, isLoading = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setErrorMsg(null);
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    // Fallback mime verification via file extension if browser returns empty
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && ext !== 'pdf' && ext !== 'txt' && ext !== 'docx') {
      setErrorMsg('Invalid file format. Please upload a PDF, DOCX, or TXT file.');
      setSelectedFile(null);
      return;
    }

    // Limit at 10MB for premium token speed
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('This file exceeds our 10MB size limit for processing.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    
    if (file.type === 'text/plain' || ext === 'txt') {
      reader.onload = (e) => {
        const text = e.target?.result;
        onFileLoaded({
          filename: file.name,
          fileType: 'text/plain',
          base64Content: btoa(unescape(encodeURIComponent(text))),
          rawText: text
        });
      };
      reader.readAsText(file);
    } else {
      // DOCX & PDF
      reader.onload = (e) => {
        const result = e.target?.result;
        // Strip the data:application/pdf;base64, header prefix if present
        const base64Content = result.split(',')[1] || result;
        onFileLoaded({
          filename: file.name,
          fileType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
          base64Content
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        id="file-uploader-stage"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full relative py-12 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
          ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}
          ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm">Processing Material...</p>
              <p className="text-xs text-slate-400 mt-1">Our AI is extracting parameters, building summaries, and structuring indices.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
              <UploadCloud size={24} />
            </div>
            
            <p className="text-sm font-bold text-slate-800">
              Drag & drop your study document, or <span className="text-indigo-600 hover:text-indigo-700 font-semibold decoration-2 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              Supports PDF, DOCX, or TXT (Up to 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error alert row */}
      {errorMsg && (
        <div className="mt-3 flex items-start space-x-2.5 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl animate-fade-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* File status tracker tag */}
      {!isLoading && selectedFile && !errorMsg && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
          <div className="flex items-center space-x-2 truncate">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <File size={13} className="text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">{selectedFile.name}</span>
            <span className="text-slate-400">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded uppercase leading-none">Ready</span>
        </div>
      )}
    </div>
  );
}
