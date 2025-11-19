import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to convert File to Base64
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeQuestionPapers = async (files: File[]): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare file parts
  const fileParts = await Promise.all(files.map(fileToPart));

  const systemPrompt = `
    You are an expert academic analyst and professor familiar with technical board examinations (like MSBTE). 
    Your task is to analyze the provided previous year question papers (images or PDFs).
    
    1. Identify the Subject Name and Subject Code (e.g., 22412) from the papers.
    2. Find questions that are repeated across different papers.
    3. Predict potential questions for the upcoming exam. 
       - Categorize them by estimated marks: '2 Marks' for short definitions/concepts, '4 Marks' or '6 Marks' for descriptions/derivations/programs.
       - Ensure a good mix of short and long questions to form a model question paper.
    
    Output strict JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { text: systemPrompt },
        ...fileParts
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subjectName: { type: Type.STRING, description: "The name of the subject or course." },
          subjectCode: { type: Type.STRING, description: "The numeric subject code if visible, else 'XXXXX'." },
          repeatedQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                frequency: { type: Type.STRING, description: "e.g., 'Appeared in 2022, 2023'" },
                context: { type: Type.STRING, description: "Brief context or topic category" }
              }
            }
          },
          predictedQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                reasoning: { type: Type.STRING, description: "Why this is likely to appear" },
                probabilityLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                marks: { type: Type.STRING, enum: ["2 Marks", "4 Marks", "6 Marks"], description: "Estimated weightage" }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini.");
  }

  return JSON.parse(text) as AnalysisResult;
};