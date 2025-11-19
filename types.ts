export interface RepeatedQuestion {
  questionText: string;
  frequency: string;
  context: string;
}

export interface PredictedQuestion {
  questionText: string;
  reasoning: string;
  probabilityLevel: 'High' | 'Medium' | 'Low';
  marks: '2 Marks' | '4 Marks' | '6 Marks';
}

export interface AnalysisResult {
  subjectName: string;
  subjectCode?: string;
  repeatedQuestions: RepeatedQuestion[];
  predictedQuestions: PredictedQuestion[];
}

export interface FileWithPreview {
  file: File;
  id: string;
  previewUrl?: string; // For images
}