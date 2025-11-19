import React, { useRef } from 'react';
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import { FileWithPreview } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadSectionProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ files, setFiles, onAnalyze, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles: FileWithPreview[] = Array.from(event.target.files).map((item) => {
        const file = item as File;
        return {
          file,
          id: Math.random().toString(36).substring(7),
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };
      });
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
      >
        <div 
          onClick={triggerFileInput}
          className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-indigo-100 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">Click to upload Question Papers</p>
              <p className="text-sm text-slate-500 mt-1">Supports PDF and Images (Max 3-4 files recommended)</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
            accept="application/pdf,image/*"
          />
        </div>

        {/* File List */}
        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {files.map((fileObj) => (
              <motion.div 
                key={fileObj.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-md shadow-sm">
                    {fileObj.file.type.startsWith('image/') ? (
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[200px] sm:max-w-[300px]">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                  className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-center"
          >
            <button 
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`
                px-8 py-3 rounded-full font-semibold text-white shadow-lg shadow-indigo-200
                flex items-center space-x-2 transition-all duration-300
                ${isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing Papers...</span>
                </>
              ) : (
                <>
                  <span>Generate Predictions</span>
                  <span className="text-xl">✨</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadSection;