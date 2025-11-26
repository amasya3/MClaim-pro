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
  // Form State
  const [inputCode, setInputCode] = useState('');
  const [inputSeverity, setInputSeverity] = useState<'I' | 'II' | 'III'>('I');
  const [inputDescription, setInputDescription] = useState('');
  
  const [editingDiagnosisId, setEditingDiagnosisId] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const resetForm = () => {
    setInputCode('');
    setInputSeverity('I');
    setInputDescription('');
    setEditingDiagnosisId(null);
    setAiError(null);
  };

  const handleEditClick = (diagnosis: Diagnosis) => {
    setInputCode(diagnosis.code);
    setInputSeverity(diagnosis.severity);
    setInputDescription(diagnosis.description);
    setEditingDiagnosisId(diagnosis.id);
    setAiError(null);
  };

  const handleDeleteDiagnosis = (diagnosisId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus diagnosis ini?")) {
        const updatedDiagnoses = patient.diagnoses.filter(d => d.id !== diagnosisId);
        onUpdatePatient({ ...patient, diagnoses: updatedDiagnoses });
        
        // If we were editing the deleted one, reset form
        if (editingDiagnosisId === diagnosisId) {
            resetForm();
        }
    }
  };

  // Helper to fetch data without saving
  const fetchCodeData = async (code: string) => {
    const normalizedInput = code.trim().toUpperCase();
    
    // 1. Check Local Database First
    const localTemplate = cbgTemplates.find(t => t.code === normalizedInput);
    if (localTemplate) {
        return {
            code: localTemplate.code,
            description: localTemplate.description,
            severity: localTemplate.severity,
            requiredDocuments: localTemplate.requiredDocuments,
            source: 'Verifikasi Database Internal'
        };
    }

    // 2. Fallback to AI Service
    const aiResult = await analyzeDiagnosisCode(normalizedInput, ''); 
    return {
        ...aiResult,
        source: 'Generated via AI Assistant'
    };
  };

  const handleCheckCode = async () => {
    if (!inputCode.trim()) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
        const data = await fetchCodeData(inputCode);
        setInputDescription(data.description);
        setInputSeverity(data.severity);
    } catch (err) {
        setAiError("Gagal mengambil data kode. Silakan isi manual.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleProcessDiagnosis = async () => {
    if (!inputCode.trim()) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
        let finalChecklist: DocumentItem[] = [];
        let sourceNote = '';
        
        // Determine if we need to regenerate checklist (New Item OR Code Changed)
        const currentDiagnosis = editingDiagnosisId 
            ? patient.diagnoses.find(d => d.id === editingDiagnosisId)
            : null;
        
        const isCodeChanged = !currentDiagnosis || currentDiagnosis.code !== inputCode.toUpperCase();

        if (isCodeChanged) {
            // Fetch fresh data for checklist
            const codeResult = await fetchCodeData(inputCode);
            sourceNote = codeResult.source;
            
            // Use fetched data if inputs are empty, otherwise trust user inputs
            if (!inputDescription) setInputDescription(codeResult.description);
            
            finalChecklist = codeResult.requiredDocuments.map((doc, idx) => ({
                id: `doc-${Date.now()}-${idx}`,
                name: doc,
                isChecked: false,
                required: true
            }));
        } else {
            // Keep existing checklist and note
            if (currentDiagnosis) {
                finalChecklist = currentDiagnosis.checklist;
                sourceNote = currentDiagnosis.notes || '';
            }
        }

        // Final values to save (Trust form state first)
        const finalDescription = inputDescription || "Diagnosis Tanpa Deskripsi";
        const finalSeverity = inputSeverity;

        if (editingDiagnosisId) {
            // UPDATE EXISTING
            const updatedDiagnoses = patient.diagnoses.map(d => {
                if (d.id === editingDiagnosisId) {
                    return {
                        ...d,
                        code: inputCode.toUpperCase(),
                        description: finalDescription,
                        severity: finalSeverity,
                        checklist: finalChecklist, 
                        notes: sourceNote,
                        timestamp: new Date().toISOString()
                    };
                }
                return d;
            });
            onUpdatePatient({ ...patient, diagnoses: updatedDiagnoses });
        } else {
            // CREATE NEW
            const newDiagnosis: Diagnosis = {
                id: crypto.randomUUID(),
                description: finalDescription,
                code: inputCode.toUpperCase(),
                severity: finalSeverity,
                timestamp: new Date().toISOString(),
                checklist: finalChecklist,
                notes: sourceNote
            };
            const updatedPatient = {
                ...patient,
                diagnoses: [newDiagnosis, ...patient.diagnoses]
            };
            onUpdatePatient(updatedPatient);
        }
        
        resetForm();
    } catch (err) {
        setAiError("Gagal memproses data. Coba lagi.");
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
        {/* Left Column: Input Form */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
            {/* Input Section */}
            <div className={`p-5 rounded-2xl shadow-sm border transition-all sticky top-0 ${editingDiagnosisId ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`material-icons-round ${editingDiagnosisId ? 'text-orange-600' : 'text-teal-600'}`}>
                            {editingDiagnosisId ? 'edit_note' : 'post_add'}
                        </span>
                        <h3 className={`font-bold ${editingDiagnosisId ? 'text-orange-800' : 'text-slate-800'}`}>
                            {editingDiagnosisId ? 'Edit Diagnosis' : 'Tambah Diagnosis'}
                        </h3>
                    </div>
                    {editingDiagnosisId && (
                        <button onClick={resetForm} className="text-xs text-orange-600 font-medium hover:underline">
                            Batal
                        </button>
                    )}
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                    {editingDiagnosisId 
                        ? 'Ubah detail diagnosis. Checklist akan di-reset HANYA jika kode berubah.' 
                        : 'Masukkan kode INA-CBG/ICD-10 untuk memulai.'}
                </p>
                
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Kode <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                    placeholder="J45.9"
                                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-mono uppercase"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheckCode()}
                                />
                                {inputCode && !isAnalyzing && (
                                    <button 
                                        onClick={handleCheckCode}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600"
                                        title="Cek Database / AI"
                                    >
                                        <span className="material-icons-round text-lg">search</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Severity</label>
                            <select 
                                value={inputSeverity} 
                                onChange={(e) => setInputSeverity(e.target.value as any)}
                                className="w-full px-2 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                            >
                                <option value="I">I - Ringan</option>
                                <option value="II">II - Sedang</option>
                                <option value="III">III - Berat</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Penyakit</label>
                        <textarea 
                            value={inputDescription}
                            onChange={(e) => setInputDescription(e.target.value)}
                            rows={3}
                            placeholder="Deskripsi otomatis atau ketik manual..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
                        />
                    </div>
                </div>

                {aiError && <p className="text-xs text-rose-500 mt-3">{aiError}</p>}
                
                <div className="flex gap-2 mt-4">
                    <button 
                        onClick={handleProcessDiagnosis}
                        disabled={isAnalyzing || !inputCode}
                        className={`flex-1 text-white py-2.5 rounded-xl font-medium text-sm transition-all flex justify-center items-center gap-2 shadow-sm disabled:shadow-none ${
                            editingDiagnosisId 
                            ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200 disabled:bg-slate-300' 
                            : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200 disabled:bg-slate-300'
                        }`}
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="animate-spin material-icons-round text-sm">refresh</span> Memproses...
                            </>
                        ) : (
                            editingDiagnosisId ? "Update Data" : "Simpan Diagnosis"
                        )}
                    </button>
                </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 leading-relaxed">
                    <span className="font-bold">Tips:</span> Gunakan tombol pencarian (ikon kaca pembesar) di kolom Kode untuk mengisi otomatis Deskripsi dan Severity sebelum menyimpan.
                </p>
            </div>
        </div>

        {/* Right Column: List of Diagnoses */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
            {patient.diagnoses.length > 0 ? (
                patient.diagnoses.map((diagnosis, index) => (
                    <div key={diagnosis.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${editingDiagnosisId === diagnosis.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200'}`}>
                        {/* Card Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col gap-4">
                                 <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded w-fit ${index === 0 ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {index === 0 ? 'Diagnosis Utama' : 'Diagnosis Sekunder'}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800 leading-tight">{diagnosis.description}</h3>
                                    </div>
                                    <div className="flex gap-2 shrink-0 ml-4 items-center">
                                        <button 
                                            type="button"
                                            onClick={() => handleEditClick(diagnosis)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Edit Diagnosis"
                                        >
                                            <span className="material-icons-round text-sm">edit</span>
                                            Edit
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteDiagnosis(diagnosis.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Hapus Diagnosis"
                                        >
                                            <span className="material-icons-round">close</span>
                                        </button>
                                    </div>
                                 </div>
                                 
                                 <div className="flex justify-between items-end">
                                    <div className="flex gap-3">
                                        <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                                            <span className="text-xs text-slate-500 block">Kode INA-CBG</span>
                                            <span className="font-mono text-lg font-bold text-teal-600">{diagnosis.code}</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                                            <span className="text-xs text-slate-500 block">Severity</span>
                                            <span className="font-bold text-slate-700">Level {diagnosis.severity}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sumber Data</span>
                                        <p className="text-xs text-slate-600 italic mt-0.5">{diagnosis.notes}</p>
                                    </div>
                                 </div>
                            </div>
                        </div>

                        {/* Checklist Section */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    Kelengkapan Berkas
                                </h4>
                                <div className="text-xs text-slate-500 font-medium">
                                    {Math.round((diagnosis.checklist.filter(c=>c.isChecked).length / diagnosis.checklist.length) * 100)}% Lengkap
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5">
                                <div 
                                    className="bg-teal-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${(diagnosis.checklist.filter(c=>c.isChecked).length / diagnosis.checklist.length) * 100}%` }}
                                ></div>
                            </div>

                            <div className="space-y-2">
                                {diagnosis.checklist.map((doc) => (
                                    <label key={doc.id} className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                                        doc.isChecked 
                                            ? 'bg-teal-50 border-teal-200' 
                                            : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                                            doc.isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300'
                                        }`}>
                                            {doc.isChecked && <span className="material-icons-round text-xs">check</span>}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={doc.isChecked} 
                                            onChange={() => toggleChecklist(diagnosis.id, doc.id)} 
                                            className="hidden" 
                                        />
                                        <div className="flex-1 flex justify-between items-center">
                                            <span className={`text-sm font-medium ${doc.isChecked ? 'text-teal-900' : 'text-slate-700'}`}>
                                                {doc.name}
                                            </span>
                                            {doc.required && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded ml-2">Wajib</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons-round text-slate-300 text-3xl">post_add</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Belum Ada Diagnosis</h3>
                    <p className="text-slate-500 max-w-sm mt-2 text-sm">
                        Silakan input kode INA-CBG di form sebelah kiri untuk memulai. Anda bisa menambahkan lebih dari satu kode.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};