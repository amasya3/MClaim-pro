
import { GoogleGenAI, Type } from "@google/genai";
import { INACBGResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const inaCbgSchema = {
  type: Type.OBJECT,
  properties: {
    code: { type: Type.STRING, description: "Official code" },
    description: { type: Type.STRING, description: "Detailed medical description" },
    severity: { type: Type.STRING, enum: ["I", "II", "III"] },
    requiredDocuments: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Mandatory documents list"
    },
  },
  required: ["code", "description", "severity", "requiredDocuments"],
};

export const analyzeDiagnosisCode = async (code: string): Promise<INACBGResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Determine requirements for INA-CBG code: "${code}". Response must follow schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: inaCbgSchema,
        temperature: 0.1,
      },
    });

    if (response.text) return JSON.parse(response.text) as INACBGResponse;
    throw new Error("No response content");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};
