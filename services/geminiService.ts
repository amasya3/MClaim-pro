import { GoogleGenAI, Type, Schema } from "@google/genai";
import { INACBGResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const inaCbgSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    code: {
      type: Type.STRING,
      description: "The verified INA-CBG or ICD-10 code.",
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

export const analyzeDiagnosisCode = async (code: string, descriptionHint?: string): Promise<INACBGResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide the official description and a checklist of mandatory documents for the following INA-CBG/ICD-10 code in the Indonesian National Health Insurance (JKN/BPJS) system.
      
      Code: "${code}"
      Additional Context: "${descriptionHint || ''}"
      
      If the code is valid, provide the official description. If specific context is provided, tailor the document list (e.g. specific lab results).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: inaCbgSchema,
        temperature: 0.1, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as INACBGResponse;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error fetching INA-CBGs details:", error);
    throw error;
  }
};