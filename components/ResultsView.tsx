import React from 'react';
import { AnalysisResult, PredictedQuestion } from '../types';
import { motion } from 'framer-motion';
import { Repeat, Sparkles, TrendingUp, AlertCircle, CheckCircle2, FileDown } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ResultsViewProps {
  data: AnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const generateMSBTEPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Helper for text wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, x, y);
      return splitText.length * lineHeight;
    };

    // --- HEADER (MSBTE Style) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MAHARASHTRA STATE BOARD OF TECHNICAL EDUCATION", centerX, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("(Autonomous)", centerX, 20, { align: "center" });
    doc.text("(ISO/IEC - 27001 - 2013 Certified)", centerX, 25, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("SUMMER / WINTER EXAMINATION MODEL QUESTION PAPER", centerX, 32, { align: "center" });

    // Header Details Box
    doc.setLineWidth(0.5);
    doc.rect(10, 36, pageWidth - 20, 18);
    
    doc.setFontSize(10);
    doc.text(`Subject Name: ${data.subjectName}`, 15, 42);
    doc.text(`Subject Code: ${data.subjectCode || '-----'}`, 140, 42);
    
    doc.text("Course: Diploma in Engineering", 15, 49);
    doc.text("Time: 3 Hours", 140, 49);
    doc.text("Max Marks: 70", 170, 49);

    // Instructions
    doc.setFont("helvetica", "bold");
    doc.text("Instructions:", 10, 62);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let yPos = 67;
    doc.text("1. All questions are compulsory.", 15, yPos); yPos += 5;
    doc.text("2. Illustrate your answers with neat sketches wherever necessary.", 15, yPos); yPos += 5;
    doc.text("3. Figures to the right indicate full marks.", 15, yPos); yPos += 5;
    doc.text("4. Assume suitable data if necessary.", 15, yPos); yPos += 5;
    doc.text("5. Preferably, write the answers in sequential order.", 15, yPos); yPos += 10;

    doc.setLineWidth(0.5);
    doc.line(10, yPos - 5, pageWidth - 10, yPos - 5);

    // --- QUESTIONS GENERATION ---
    
    // Group questions by marks
    const shortQuestions = data.predictedQuestions.filter(q => q.marks === '2 Marks' || q.marks === '2 Marks').slice(0, 7);
    const longQuestions = data.predictedQuestions.filter(q => q.marks !== '2 Marks');
    
    // Q1: Attempt any FIVE (2 Marks each)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Q.1 Attempt any FIVE of the following:", 15, yPos);
    doc.text("(10 Marks)", pageWidth - 35, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    if (shortQuestions.length > 0) {
      shortQuestions.forEach((q, idx) => {
        const prefix = `${String.fromCharCode(97 + idx)}) `;
        doc.text(prefix, 20, yPos);
        const height = addWrappedText(q.questionText, 28, yPos, pageWidth - 50, 5);
        yPos += height + 4;
        
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else {
      doc.text("   [AI generated mostly long questions, refer to Q.2 for important topics]", 20, yPos);
      yPos += 10;
    }

    yPos += 5;

    // Q2 - Q6: Group remaining into blocks of 3 (Attempt any 3 of 4)
    let questionNum = 2;
    let qIdx = 0;
    
    while (qIdx < longQuestions.length) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const chunk = longQuestions.slice(qIdx, qIdx + 4); // Take 4 questions
      qIdx += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Q.${questionNum} Attempt any THREE of the following:`, 15, yPos);
      doc.text("(12 Marks)", pageWidth - 35, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      chunk.forEach((q, idx) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const prefix = `${String.fromCharCode(97 + idx)}) `;
        doc.text(prefix, 20, yPos);
        
        // Add question text
        let height = addWrappedText(q.questionText, 28, yPos, pageWidth - 50, 5);
        
        // Add a small note about probability/reasoning (optional, helps studying)
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`[${q.probabilityLevel} Prob: ${q.reasoning}]`, 28, yPos + height + 1);
        doc.setTextColor(0);
        doc.setFontSize(10);

        yPos += height + 8;
      });
      
      questionNum++;
      yPos += 5;
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount} - Generated by Exam Oracle AI`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`${data.subjectName.replace(/\s+/g, '_')}_Model_Paper.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative"
      >
         <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateMSBTEPDF}
            className="md:absolute md:right-0 md:top-0 mb-4 md:mb-0 bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:bg-slate-700 transition-colors mx-auto"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </motion.button>

        <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-full mb-4 px-4 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Analysis Complete
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Analysis for {data.subjectName}</h2>
        <p className="text-slate-500 mt-2">Subject Code: {data.subjectCode || 'N/A'}</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Repeated Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Repeated Questions</h3>
          </div>

          {data.repeatedQuestions.map((q, idx) => (
            <motion.div 
              key={`rep-${idx}`}
              variants={item}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber-400"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold tracking-wide text-amber-600 uppercase">{q.context}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{q.frequency}</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">
                "{q.questionText}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Predicted Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Future Predictions</h3>
            </div>
          </div>

          {data.predictedQuestions.map((q, idx) => (
            <motion.div 
              key={`pred-${idx}`}
              variants={item}
              className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 relative overflow-hidden
                ${q.probabilityLevel === 'High' ? 'border-indigo-500' : 
                  q.probabilityLevel === 'Medium' ? 'border-blue-400' : 'border-sky-300'}
              `}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <TrendingUp className="w-16 h-16" />
              </div>
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                 <div className="flex space-x-2">
                   <span className={`
                      text-xs font-bold px-2 py-1 rounded-full
                      ${q.probabilityLevel === 'High' ? 'bg-indigo-100 text-indigo-700' : 
                        q.probabilityLevel === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-sky-100 text-sky-700'}
                   `}>
                      {q.probabilityLevel}
                   </span>
                   <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                     {q.marks}
                   </span>
                 </div>
              </div>
              <p className="text-slate-800 font-semibold text-lg mb-3 relative z-10">
                {q.questionText}
              </p>
              <div className="flex items-start space-x-2 text-slate-500 text-sm relative z-10 bg-slate-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <p>{q.reasoning}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-center"
      >
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center mx-auto space-x-2"
        >
          <Repeat className="w-4 h-4" />
          <span>Analyze Another Subject</span>
        </button>
      </motion.div>
    </div>
  );
};

export default ResultsView;