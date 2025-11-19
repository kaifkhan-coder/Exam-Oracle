import React, { useState } from 'react';
import { BrainCircuit, GraduationCap } from 'lucide-react';
import UploadSection from './components/UploadSection';
import ResultsView from './components/ResultsView';
import { analyzeQuestionPapers } from './services/geminiService';
import { AnalysisResult, FileWithPreview } from './types';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await analyzeQuestionPapers(files.map(f => f.file));
      setResult(analysis);
    } catch (err: any) {
      console.error("Analysis failed", err);
      setError(err.message || "Failed to analyze papers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent -z-10"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10"></div>

      {/* Header */}
      <header className="pt-12 pb-6 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3 mb-4"
        >
          <div className="bg-white p-3 rounded-2xl shadow-md shadow-indigo-100">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Exam<span className="text-indigo-600">Oracle</span>
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 max-w-xl mx-auto text-lg"
        >
          Upload your previous question papers. We'll find the patterns and predict your next exam questions.
        </motion.p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="max-w-xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}

        {!result ? (
          <div className="mt-4">
            <UploadSection 
              files={files} 
              setFiles={setFiles} 
              onAnalyze={handleAnalyze}
              isAnalyzing={loading}
            />
            
            {/* Feature Grid for Empty State */}
            {!loading && files.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Pattern Recognition</h3>
                  <p className="text-sm text-slate-500">Identifies frequently asked concepts across years.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">AI Prediction</h3>
                  <p className="text-sm text-slate-500">Uses advanced models to forecast future questions.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Exam Ready</h3>
                  <p className="text-sm text-slate-500">Prepare smarter by focusing on high-probability topics.</p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <ResultsView data={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;
