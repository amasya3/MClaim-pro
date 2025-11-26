import React, { useState } from 'react';
import { Patient, Diagnosis, DocumentItem, INACBGTemplate } from '../types';
import { analyzeDiagnosisCode } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  cbgTemplates: INACBGTemplate[];
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUpdatePatient, cbgTemplates }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnosis'>('diagnosis');
  
  // Form State
  const [inputCode, setInputCode] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleProcessDiagnosis = async () => {
    if (!inputCode.trim()) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
        let codeResult: { code: string; description: string; severity: 'I'|'II'|'III'; requiredDocuments: string[] };
        let sourceNote = '';

        // 1. Check Local Database First
        const normalizedInput = inputCode.trim().toUpperCase();
        const localTemplate = cbgTemplates.find(t => t.code === normalizedInput);

        if (localTemplate) {
            // Use Local DB
            codeResult = {
                code: localTemplate.code,
                description: localTemplate.description,
                severity: localTemplate.severity,
                requiredDocuments: localTemplate.requiredDocuments
            };
            sourceNote = 'Verifikasi Database Internal';
        } else {
            // 2. Fallback to AI Service
            const aiResult = await analyzeDiagnosisCode(normalizedInput, inputDescription);
            codeResult = aiResult;
            sourceNote = 'Generated via AI Assistant';
        }
        
        const newChecklist: DocumentItem[] = codeResult.requiredDocuments.map((doc, idx) => ({
            id: `doc-${Date.now()}-${idx}`,
            name: doc,
            isChecked: false,
            required: true
        }));

        const newDiagnosis: Diagnosis = {
            id: crypto.randomUUID(),
            description: inputDescription || codeResult.description, // Use user input if provided, else Result
            code: codeResult.code,
            severity: codeResult.severity,
            timestamp: new Date().toISOString(),
            checklist: newChecklist,
            notes: sourceNote
        };

        const updatedPatient = {
            ...patient,
            diagnoses: [newDiagnosis, ...patient.diagnoses]
        };
        onUpdatePatient(updatedPatient);
        
        // Reset form
        setInputCode('');
        setInputDescription('');
    } catch (err) {
        setAiError("Gagal memproses kode. Pastikan koneksi internet lancar dan kode valid.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const toggleChecklist = (diagnosisId: string, docId: string) => {
    const updatedDiagnoses = patient.diagnoses.map(d => {
        if (d.id === diagnosisId) {
            return {
                ...d,
                checklist: d.checklist.map(c => c.id === docId ? { ...c, isChecked: !c.isChecked } : c)
            };
        }
        return d;
    });
    onUpdatePatient({ ...patient, diagnoses: updatedDiagnoses });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <span className="material-icons-round">arrow_back</span>
        </button>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
            <div className="flex gap-4 text-sm text-slate-500">
                <span>RM: {patient.mrn}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full self-center"></span>
                <span>BPJS: {patient.bpjsNumber}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full self-center"></span>
                <span className="text-teal-600 font-medium">{patient.status}</span>
            </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Column: Input & History */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Input Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-icons-round text-teal-600">post_add</span>
                    <h3 className="font-bold text-slate-800">Input Diagnosis</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Masukkan kode INA-CBG/ICD-10. Sistem akan memprioritaskan Database Internal sebelum menggunakan AI.
                </p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Diagnosis <span className="text-rose-500">*</span></label>
                        <input 
                            type="text"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            placeholder="Contoh: J45.9"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-mono uppercase"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Deskripsi (Opsional)</label>
                        <textarea 
                            value={inputDescription}
                            onChange={(e) => setInputDescription(e.target.value)}
                            placeholder="Tambahkan detail diagnosis..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none h-20"
                        />
                    </div>
                </div>

                {aiError && <p className="text-xs text-rose-500 mt-3">{aiError}</p>}
                
                <button 
                    onClick={handleProcessDiagnosis}
                    disabled={isAnalyzing || !inputCode}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-2.5 rounded-xl font-medium text-sm transition-all flex justify-center items-center gap-2 shadow-sm shadow-teal-200 disabled:shadow-none"
                >
                    {isAnalyzing ? (
                        <>
                            <span className="animate-spin material-icons-round text-sm">refresh</span> Memproses...
                        </>
                    ) : (
                        "Simpan & Buat Checklist"
                    )}
                </button>
            </div>

            {/* History List */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Riwayat Diagnosis</h4>
                {patient.diagnoses.map(diagnosis => (
                    <div 
                        key={diagnosis.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-400 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded border border-teal-100">
                                {diagnosis.code}
                            </span>
                            <span className="text-xs text-slate-400">
                                {new Date(diagnosis.timestamp).toLocaleDateString('id-ID')}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{diagnosis.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Severity: {diagnosis.severity}</span>
                            <span className={`text-xs font-medium ${diagnosis.checklist.every(c => c.isChecked) ? 'text-green-600' : 'text-orange-500'}`}>
                                {diagnosis.checklist.filter(c => c.isChecked).length}/{diagnosis.checklist.length} Berkas
                            </span>
                        </div>
                    </div>
                ))}
                {patient.diagnoses.length === 0 && (
                    <div className="text-center p-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        Belum ada riwayat.
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Active Diagnosis Details & Checklist */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {patient.diagnoses.length > 0 ? (
                <>
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-slate-800">{patient.diagnoses[0].description}</h3>
                                <div className="flex gap-3 mt-2">
                                    <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                                        <span className="text-xs text-slate-500 block">Kode INA-CBG</span>
                                        <span className="font-mono text-lg font-bold text-teal-600">{patient.diagnoses[0].code}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                                        <span className="text-xs text-slate-500 block">Severity</span>
                                        <span className="font-bold text-slate-700">Level {patient.diagnoses[0].severity}</span>
                                    </div>
                                </div>
                             </div>
                             <div className="text-right max-w-xs">
                                <span className="text-xs font-bold text-slate-400 uppercase">Catatan / Sumber</span>
                                <p className="text-sm text-slate-600 italic mt-1 line-clamp-3">"{patient.diagnoses[0].notes}"</p>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-icons-round text-teal-600">assignment_turned_in</span>
                                Kelengkapan Berkas Klaim
                            </h4>
                            <div className="text-sm text-slate-500">
                                {Math.round((patient.diagnoses[0].checklist.filter(c=>c.isChecked).length / patient.diagnoses[0].checklist.length) * 100)}% Lengkap
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
                            <div 
                                className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${(patient.diagnoses[0].checklist.filter(c=>c.isChecked).length / patient.diagnoses[0].checklist.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="space-y-3">
                            {patient.diagnoses[0].checklist.map((doc) => (
                                <label key={doc.id} className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                                    doc.isChecked 
                                        ? 'bg-teal-50 border-teal-200' 
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                }`}>
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center mr-4 transition-colors ${
                                        doc.isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300'
                                    }`}>
                                        {doc.isChecked && <span className="material-icons-round text-sm">check</span>}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={doc.isChecked} 
                                        onChange={() => toggleChecklist(patient.diagnoses[0].id, doc.id)} 
                                        className="hidden" 
                                    />
                                    <div className="flex-1">
                                        <span className={`font-medium ${doc.isChecked ? 'text-teal-900' : 'text-slate-700'}`}>
                                            {doc.name}
                                        </span>
                                        {doc.required && (
                                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Wajib</span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons-round text-slate-300 text-4xl">post_add</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">Belum Ada Diagnosis</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        Silakan input kode INA-CBG di panel kiri untuk memulai proses klaim dan melihat daftar berkas yang dibutuhkan.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};