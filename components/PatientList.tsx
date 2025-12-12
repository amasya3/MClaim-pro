
import React, { useState, useRef } from 'react';
import { Patient, PatientStatus, Gender, INACBGTemplate } from '../types';

interface PatientListProps {
  patients: Patient[];
  cbgTemplates: INACBGTemplate[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatientDetails: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  cbgTemplates,
  onSelectPatient, 
  onAddPatient,
  onUpdatePatientDetails,
  onDeletePatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'krs'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [notePatient, setNotePatient] = useState<Patient | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [status, setStatus] = useState<PatientStatus>(PatientStatus.ADMITTED);
  const [admissionDate, setAdmissionDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [billingAmount, setBillingAmount] = useState('');
  const [inaCbgAmount, setInaCbgAmount] = useState('');

  // Filter logic based on Tab + Search
  const filteredPatients = patients.filter(p => {
    // 1. Tab Filter
    const isDischarged = p.status === PatientStatus.DISCHARGED;
    if (activeTab === 'active' && isDischarged) return false;
    if (activeTab === 'krs' && !isDischarged) return false;

    // 2. Search Filter
    return (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.mrn.includes(searchTerm) ||
        p.bpjsNumber.includes(searchTerm) ||
        (p.roomNumber && p.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const resetForm = () => {
    setName('');
    setGender(Gender.MALE);
    setStatus(PatientStatus.ADMITTED);
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setRoomNumber('');
    setBillingAmount('');
    setInaCbgAmount('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setName(patient.name);
    setGender(patient.gender);
    setStatus(patient.status);
    setAdmissionDate(patient.admissionDate || new Date().toISOString().split('T')[0]);
    setRoomNumber(patient.roomNumber || '');
    setBillingAmount(patient.billingAmount ? patient.billingAmount.toString() : '');
    setInaCbgAmount(patient.inaCbgAmount ? patient.inaCbgAmount.toString() : '');
    setEditingId(patient.id);
    setIsModalOpen(true);
  };

  const handleDelete = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Apakah anda yakin ingin menghapus data pasien ${patient.name}?`)) {
        onDeletePatient(patient.id);
    }
  };

  const handleOpenNote = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotePatient(patient);
    setNoteContent(patient.verifierNote || '');
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (notePatient) {
        const updatedPatient = { ...notePatient, verifierNote: noteContent };
        onUpdatePatientDetails(updatedPatient);
    }
    setIsNoteModalOpen(false);
    setNotePatient(null);
    setNoteContent('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalBilling = billingAmount ? parseFloat(billingAmount) : 0;
    const finalInaCbg = inaCbgAmount ? parseFloat(inaCbgAmount) : 0;

    if (editingId) {
        // Update existing
        const originalPatient = patients.find(p => p.id === editingId);
        if (originalPatient) {
            const updatedPatient: Patient = {
                ...originalPatient,
                name,
                // Preserve original MRN and BPJS since they are removed from form
                mrn: originalPatient.mrn, 
                bpjsNumber: originalPatient.bpjsNumber,
                gender,
                status,
                admissionDate,
                roomNumber,
                billingAmount: finalBilling,
                inaCbgAmount: finalInaCbg
            };
            onUpdatePatientDetails(updatedPatient);
        }
    } else {
        // Create new
        const autoMrn = `RM-${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`;
        
        const newPatient: Patient = {
            id: crypto.randomUUID(),
            name,
            mrn: autoMrn,
            bpjsNumber: '-',
            gender,
            dob: '1980-01-01', // Mock default
            status,
            diagnoses: [],
            lastVisit: new Date().toISOString(),
            admissionDate,
            roomNumber,
            billingAmount: finalBilling,
            inaCbgAmount: finalInaCbg
        };
        onAddPatient(newPatient);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const calculateLengthOfStay = (startDate?: string, endDate?: string, isDischarged: boolean = false) => {
    if (!startDate) return '-';
    
    const start = new Date(startDate);
    // If discharged, use lastVisit/discharge date, otherwise use Today
    const end = isDischarged && endDate ? new Date(endDate) : new Date();
    
    // Normalize to midnight to calculate pure days
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Count the admission day as day 1
    const totalDays = Math.max(1, diffDays + 1);
    
    return `${totalDays} Hari`;
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const getEffectiveTariff = (patient: Patient): { amount: number, isEstimated: boolean } => {
    if (patient.inaCbgAmount && patient.inaCbgAmount > 0) {
        return { amount: patient.inaCbgAmount, isEstimated: false };
    }
    
    if (patient.diagnoses.length > 0) {
        const code = patient.diagnoses[0].code;
        const template = cbgTemplates.find(t => t.code === code);
        if (template && template.tariff) {
            return { amount: template.tariff, isEstimated: true };
        }
    }

    return { amount: 0, isEstimated: false };
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r\n|\n/);
      
      let importedCount = 0;
      let startIndex = 0;
      let isSimrsFormat = false;
      let isShortFormat = false;

      // 1. Detect Format & Start Index
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const lineLower = lines[i].toLowerCase();
        if (lineLower.includes('no.rawat') || lineLower.includes('no.r.m.')) {
            startIndex = i + 1;
            isSimrsFormat = true;
            break;
        }
      }
      
      // Fallback detection
      if (!isSimrsFormat) {
         const headerLine = lines[0].toLowerCase();
         if (headerLine.includes('nama pasien') && !headerLine.includes('no. rm')) {
             // Short template format (No MRN/Status/etc)
             startIndex = 1;
             isShortFormat = true;
         } else {
             // Full export format
             startIndex = headerLine.includes('no. rm') ? 1 : 0;
         }
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect separator
        let separator = ','; // Default for CSV
        if (line.includes('\t')) separator = '\t';
        else if (line.split(';').length > line.split(',').length) separator = ';';

        // Split and clean quotes
        let parts: string[] = [];
        if (separator === ',') {
             // Regex to split by comma ONLY if not inside quotes
             const regexMatch = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
             if (regexMatch) {
                 parts = regexMatch.map(p => p.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
             } else {
                 parts = line.split(',').map(p => p.trim());
             }
             if (parts.length < 5) parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
        } else {
             parts = line.split(separator).map(p => p.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        }

        let newPatient: Patient;

        if (isSimrsFormat) {
            // ... (Existing SIMRS Logic) ...
            const mrn = parts[2] || `RM-${Math.floor(Math.random() * 99999)}`;
            const name = parts[3];
            if (!name) continue;

            const roomNumber = parts[6] || '';
            const diagCode = parts[7] || '';
            
            // Date Parsing: dd/mm/yyyy -> yyyy-mm-dd
            let admissionDate = new Date().toISOString().split('T')[0];
            if (parts[9]) {
                const dateParts = parts[9].split('/');
                if (dateParts.length === 3) {
                    admissionDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                }
            }

            let billingAmount = 0;
            if (parts.length > 10) {
                const moneyPart = parts[parts.length - 1] || '0'; 
                const cleanMoney = moneyPart.replace(/[Rp\s.]/g, '').replace(',', '.');
                billingAmount = parseFloat(cleanMoney) || 0;
            }

            const diagnoses: any[] = [];
            if (diagCode && diagCode !== '-') {
                const template = cbgTemplates.find(t => t.code === diagCode.toUpperCase());
                let checklist: any[] = [];
                let severity: 'I'|'II'|'III' = 'I';

                if (template) {
                    checklist = template.requiredDocuments.map((doc, idx) => ({
                        id: `doc-${Date.now()}-${idx}`,
                        name: doc,
                        isChecked: false,
                        required: true
                    }));
                    severity = template.severity;
                }

                diagnoses.push({
                    id: crypto.randomUUID(),
                    code: diagCode.toUpperCase(),
                    description: template ? template.description : 'Imported Diagnosis',
                    severity: severity,
                    timestamp: new Date().toISOString(),
                    checklist: checklist,
                    notes: 'Imported from SIMRS'
                });
            }

            newPatient = {
                id: crypto.randomUUID(),
                mrn,
                name,
                bpjsNumber: '-', 
                gender: Gender.MALE,
                dob: '1980-01-01',
                status: PatientStatus.ADMITTED,
                diagnoses,
                lastVisit: new Date().toISOString(),
                admissionDate,
                roomNumber,
                billingAmount,
                inaCbgAmount: 0
            };

        } else if (isShortFormat) {
            // SHORT FORMAT LOGIC (Matching new Template)
            // 0: Name, 1: Admission, 2: Room, 3: Code, 4: Desc, 5: Bill, 6: Tariff, 7: Variance
            
            if (parts.length < 1) continue;
            
            const name = parts[0];
            if (!name) continue;

            // Auto-generate missing fields
            const mrn = `RM-${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`;
            const bpjsNumber = '-';
            const gender = Gender.MALE; // Default
            const status = PatientStatus.ADMITTED; // Default

            const admissionDate = (parts[1] && parts[1] !== '-' && parts[1] !== '""') ? parts[1] : new Date().toISOString().split('T')[0];
            const roomNumber = (parts[2] && parts[2] !== '-' && parts[2] !== '""') ? parts[2] : '';

            // Diagnosis
            const diagCode = (parts[3] && parts[3] !== '-' && parts[3] !== '""') ? parts[3] : '';
            const diagDesc = (parts[4] && parts[4] !== '-' && parts[4] !== '""') ? parts[4] : '';
            
            const diagnoses: any[] = [];
            if (diagCode) {
                const template = cbgTemplates.find(t => t.code === diagCode);
                let checklist: any[] = [];
                let severity: 'I'|'II'|'III' = 'I';

                if (template) {
                    checklist = template.requiredDocuments.map((doc, idx) => ({
                        id: `doc-${Date.now()}-${idx}`,
                        name: doc,
                        isChecked: false,
                        required: true
                    }));
                    severity = template.severity;
                }

                diagnoses.push({
                    id: crypto.randomUUID(),
                    code: diagCode,
                    description: diagDesc || (template ? template.description : 'Imported Diagnosis'),
                    severity: severity,
                    timestamp: new Date().toISOString(),
                    checklist: checklist,
                    notes: 'Imported from CSV'
                });
            }

            const billingAmount = parts[5] ? parseFloat(parts[5]) : 0;
            const inaCbgAmount = parts[6] ? parseFloat(parts[6]) : 0;

            newPatient = {
                id: crypto.randomUUID(),
                mrn,
                name,
                bpjsNumber,
                gender,
                dob: '1980-01-01',
                status,
                diagnoses,
                lastVisit: new Date().toISOString(),
                admissionDate,
                roomNumber,
                billingAmount,
                inaCbgAmount
            };

        } else {
            // FULL / EXPORT FORMAT LOGIC
            if (parts.length < 2) continue;

            const mrn = parts[0] || `RM-${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`;
            const name = parts[1];
            if (!name) continue;

            const bpjsNumber = parts[2] || '-';
            
            let gender = Gender.MALE;
            if (parts[3]?.toLowerCase().includes('perempuan') || parts[3]?.toLowerCase() === 'female') gender = Gender.FEMALE;

            let status = PatientStatus.ADMITTED;
            const statusRaw = parts[4]?.toLowerCase() || '';
            if (statusRaw.includes('jalan') || statusRaw.includes('outpatient')) status = PatientStatus.OUTPATIENT;
            else if (statusRaw.includes('pulang') || statusRaw.includes('discharged')) status = PatientStatus.DISCHARGED;

            const admissionDate = (parts[5] && parts[5] !== '-' && parts[5] !== '""') ? parts[5] : new Date().toISOString().split('T')[0];
            const roomNumber = (parts[6] && parts[6] !== '-' && parts[6] !== '""') ? parts[6] : '';

            // Diagnosis
            const diagCode = (parts[7] && parts[7] !== '-' && parts[7] !== '""') ? parts[7] : '';
            const diagDesc = (parts[8] && parts[8] !== '-' && parts[8] !== '""') ? parts[8] : '';
            
            const diagnoses: any[] = [];
            if (diagCode) {
                const template = cbgTemplates.find(t => t.code === diagCode);
                let checklist: any[] = [];
                let severity: 'I'|'II'|'III' = 'I';

                if (template) {
                    checklist = template.requiredDocuments.map((doc, idx) => ({
                        id: `doc-${Date.now()}-${idx}`,
                        name: doc,
                        isChecked: false,
                        required: true
                    }));
                    severity = template.severity;
                }

                diagnoses.push({
                    id: crypto.randomUUID(),
                    code: diagCode,
                    description: diagDesc || (template ? template.description : 'Imported Diagnosis'),
                    severity: severity,
                    timestamp: new Date().toISOString(),
                    checklist: checklist,
                    notes: 'Imported from CSV'
                });
            }

            const billingAmount = parts[10] ? parseFloat(parts[10]) : 0;
            const inaCbgAmount = parts[11] ? parseFloat(parts[11]) : 0;

            newPatient = {
                id: crypto.randomUUID(),
                mrn,
                name,
                bpjsNumber,
                gender,
                dob: '1980-01-01',
                status,
                diagnoses,
                lastVisit: new Date().toISOString(),
                admissionDate,
                roomNumber,
                billingAmount,
                inaCbgAmount
            };
        }

        onAddPatient(newPatient);
        importedCount++;
      }
      
      if (importedCount > 0) {
        alert(`Berhasil mengimpor ${importedCount} data pasien.`);
      } else {
        alert('Gagal mengimpor data atau file kosong.');
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    // Headers matching the simplified requested format
    // Removed: No. RM, BPJS, Gender, Status, Lama Rawat
    const headers = [
      "Nama Pasien", "Tgl Masuk", "Kamar", 
      "Kode Diagnosis", "Deskripsi Diagnosis", "Tagihan RS", "Tarif INA-CBG", "Selisih"
    ];
    
    // Example row
    const example = [
        "Contoh Pasien", 
        new Date().toISOString().split('T')[0], "Anggrek 1", "J45.9", "Asma Bronkial", "1500000", "2000000", "500000"
    ];

    const csvContent = "\uFEFF" + headers.join(";") + "\n" + example.map(item => `"${item}"`).join(";");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_pasien.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToExcel = () => {
    // Headers matching the table columns
    const headers = [
      "Pasien", "Lama Rawat", "Kamar", "Diagnosis", 
      "Tarif INA-CBG", "Tagihan RS", "Selisih", "Note Usulan"
    ];

    // Helper for safe CSV fields (handles quotes)
    const safe = (val: string | number | undefined | null) => {
        if (val === undefined || val === null) return '""';
        const str = String(val);
        // Escape quotes by doubling them
        return `"${str.replace(/"/g, '""')}"`;
    };

    // Data rows
    const rows = filteredPatients.map(p => {
        const diagnosis = p.diagnoses[0];
        const diagnosisCode = diagnosis ? diagnosis.code : '-';
        
        const lengthOfStay = calculateLengthOfStay(p.admissionDate, p.lastVisit, p.status === PatientStatus.DISCHARGED);
        const bill = p.billingAmount || 0;
        const effectiveTariff = getEffectiveTariff(p).amount;
        const variance = effectiveTariff - bill;

        return [
            safe(p.name),
            safe(lengthOfStay),
            safe(p.roomNumber || '-'),
            safe(diagnosisCode),
            effectiveTariff,
            bill,
            variance,
            safe(p.verifierNote || '')
        ].join(";"); // Use semicolon for better Excel compatibility in ID region
    });

    // Add BOM (\uFEFF) so Excel recognizes UTF-8 encoding
    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mclaim_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Pasien</h2>
          <p className="text-slate-500">Kelola data pasien, edit informasi, dan pantau status INA-CBGs.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 print:hidden"
        >
          <span className="material-icons-round text-sm">add</span>
          Pasien Baru
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'active' 
                    ? 'bg-teal-50 text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Pasien Aktif
            </button>
            <button 
                onClick={() => setActiveTab('krs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'krs' 
                    ? 'bg-teal-50 text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Riwayat Pulang (KRS)
            </button>
        </div>
        
        <div className="flex-1 w-full flex gap-2">
            <div className="relative flex-1">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="Cari nama, No. RM, BPJS, atau Kamar." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <button 
                onClick={handleImportClick}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center group"
                title="Import Excel (CSV)"
            >
                <span className="material-icons-round text-teal-600 group-hover:text-teal-700">upload_file</span>
            </button>
            <button 
                onClick={handleDownloadTemplate}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center group"
                title="Download Template CSV"
            >
                <span className="material-icons-round text-blue-600 group-hover:text-blue-700">description</span>
            </button>
            <button 
                onClick={() => window.print()}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center group"
                title="Print Data"
            >
                <span className="material-icons-round text-slate-600 group-hover:text-slate-800">print</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv,.txt" 
                className="hidden" 
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <th className="px-6 py-4">Pasien</th>
                        <th className="px-4 py-4 w-32">Lama Rawat</th>
                        <th className="px-4 py-4">Kamar</th>
                        <th className="px-4 py-4">Diagnosis</th>
                        <th className="px-4 py-4 text-right">Tarif INA-CBG</th>
                        <th className="px-4 py-4 text-right">Tagihan RS</th>
                        <th className="px-4 py-4 text-right">Selisih</th>
                        <th className="px-4 py-4 w-32">Note Usulan</th>
                        <th className="px-6 py-4 text-right print:hidden">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {filteredPatients.map((patient) => {
                        const bill = patient.billingAmount || 0;
                        const effectiveTariff = getEffectiveTariff(patient);
                        const cbg = effectiveTariff.amount;
                        const variance = cbg - bill;
                        
                        const hasDiagnosis = patient.diagnoses.length > 0;
                        const activeDiagnosis = patient.diagnoses[0];
                        const lengthOfStay = calculateLengthOfStay(patient.admissionDate, patient.lastVisit, patient.status === PatientStatus.DISCHARGED);

                        return (
                            <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectPatient(patient)}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                            patient.gender === Gender.MALE ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                        }`}>
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{patient.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                     <span className="text-sm font-bold text-teal-700 block">{lengthOfStay}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-600 font-medium">{patient.roomNumber || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {hasDiagnosis ? (
                                        <span className="bg-teal-50 text-teal-700 font-mono text-sm px-2 py-1 rounded border border-teal-100 font-bold">
                                            {activeDiagnosis.code}
                                        </span>
                                    ) : <span className="text-xs text-slate-400 italic">Belum ada</span>}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-mono text-sm font-medium ${effectiveTariff.isEstimated ? 'text-slate-600' : 'text-teal-700'}`}>
                                            {formatCurrency(cbg)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-sm text-slate-700">
                                    {formatCurrency(bill)}
                                </td>
                                <td className={`px-4 py-4 text-right font-mono text-sm font-bold ${variance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                    {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                                </td>
                                <td className="px-4 py-4">
                                    <button 
                                        onClick={(e) => handleOpenNote(patient, e)}
                                        className="w-full text-left px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors text-slate-600 truncate max-w-[120px]"
                                    >
                                        {patient.verifierNote ? patient.verifierNote : <span className="text-slate-400 italic">Isi note...</span>}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right print:hidden">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleOpenEdit(patient, e)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-icons-round text-sm">edit</span>
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(patient, e)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <span className="material-icons-round text-sm">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredPatients.length === 0 && (
                        <tr>
                            <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                Data tidak ditemukan.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Pasien' : 'Tambah Pasien Baru'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pasien</label>
                        <input 
                            type="text" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                            placeholder="Nama Lengkap"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                            <select 
                                value={gender}
                                onChange={(e) => setGender(e.target.value as Gender)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                            >
                                <option value={Gender.MALE}>Laki-laki</option>
                                <option value={Gender.FEMALE}>Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                            >
                                <option value={PatientStatus.ADMITTED}>Rawat Inap</option>
                                <option value={PatientStatus.OUTPATIENT}>Rawat Jalan</option>
                                <option value={PatientStatus.DISCHARGED}>Pulang</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Masuk</label>
                            <input 
                                type="date" 
                                required 
                                value={admissionDate}
                                onChange={(e) => setAdmissionDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Kamar/Poli</label>
                            <input 
                                type="text" 
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                placeholder="Cth: Anggrek 1"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-2">
                        <h4 className="text-sm font-bold text-slate-800 mb-3">Estimasi Biaya</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Tagihan RS (Real Cost)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        value={billingAmount}
                                        onChange={(e) => setBillingAmount(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Tarif INA-CBG (Klaim)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        value={inaCbgAmount}
                                        onChange={(e) => setInaCbgAmount(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Catatan Usulan</h3>
                <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">Pasien: <span className="font-semibold">{notePatient?.name}</span></p>
                    <textarea 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none text-sm"
                        placeholder="Tulis catatan usulan verifikasi..."
                        autoFocus
                    />
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsNoteModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSaveNote}
                        className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
                    >
                        Simpan Note
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
