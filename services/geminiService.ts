import { GoogleGenAI, Type, Schema } from "@google/genai";
import { INACBGResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const inaCbgSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    code: {
      type: Type.STRING,
      description: "The estimated INA-CBG or ICD-10 code based on the diagnosis.",
    },
    description: {
      type: Type.STRING,
      description: "Official description of the diagnosis code.",
    },
    severity: {
      type: Type.STRING,
      enum: ["I", "II", "III"],
      description: "Estimated severity level (I=Ringan, II=Sedang, III=Berat).",
    },
    requiredDocuments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific mandatory documents required for INA-CBGs claim verification for this specific diagnosis (e.g., 'Hasil Lab HbA1c', 'Foto Rontgen Thorax', 'SEP', 'Resume Medis').",
    },
  },
  required: ["code", "description", "severity", "requiredDocuments"],
};

export const suggestDiagnosisAndDocs = async (clinicalNotes: string): Promise<INACBGResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following clinical notes/diagnosis and provide the most likely INA-CBG/ICD-10 code and a checklist of mandatory documents required for the claim in the Indonesian National Health Insurance (JKN/BPJS) system.
      
      Clinical Notes: "${clinicalNotes}"
      
      Be precise with document names.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: inaCbgSchema,
        temperature: 0.3, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as INACBGResponse;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error fetching INA-CBGs suggestion:", error);
    throw error;
  }
};