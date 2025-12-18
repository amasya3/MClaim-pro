
import React, { useState, useRef, useEffect } from 'react';
import { Patient, PatientStatus, Gender, INACBGTemplate } from '../types';

interface PatientListProps {
  patients: Patient[];
  cbgTemplates: INACBGTemplate[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatientDetails: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  isDarkMode?: boolean;
}

type SortKey = 'name' | 'los' | 'room' | 'diagnosis' | 'tariff' | 'billing' | 'variance';

export const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  cbgTemplates,
  onSelectPatient, 
  onAddPatient,
  onUpdatePatientDetails,
  onDeletePatient,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'krs'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File Menu State
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [notePatient, setNotePatient] = useState<Patient | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | 'bulk' | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [status, setStatus] = useState<PatientStatus>(PatientStatus.ADMITTED);
  const [admissionDate, setAdmissionDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [billingAmount, setBillingAmount] = useState('');
  const [inaCbgAmount, setInaCbgAmount] = useState('');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const calculateLOSNumeric = (p: Patient) => {
    if (!p.admissionDate) return 0;
    const start = new Date(p.admissionDate);
    const end = p.status === PatientStatus.DISCHARGED && p.lastVisit ? new Date(p.lastVisit) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };

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

  // Sorting Logic
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let valA: any = '';
    let valB: any = '';

    switch (key) {
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'los':
        valA = calculateLOSNumeric(a);
        valB = calculateLOSNumeric(b);
        break;
      case 'room':
        valA = (a.roomNumber || '').toLowerCase();
        valB = (b.roomNumber || '').toLowerCase();
        break;
      case 'diagnosis':
        valA = (a.diagnoses[0]?.code || '').toLowerCase();
        valB = (b.diagnoses[0]?.code || '').toLowerCase();
        break;
      case 'tariff':
        valA = getEffectiveTariff(a).amount;
        valB = getEffectiveTariff(b).amount;
        break;
      case 'billing':
        valA = a.billingAmount || 0;
        valB = b.billingAmount || 0;
        break;
      case 'variance':
        valA = getEffectiveTariff(a).amount - (a.billingAmount || 0);
        valB = getEffectiveTariff(b).amount - (b.billingAmount || 0);
        break;
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="material-icons-round text-xs opacity-20 ml-1">sort</span>;
    }
    return (
      <span className="material-icons-round text-xs ml-1 text-teal-500">
        {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const newSelected = new Set(selectedIds);
        filteredPatients.forEach(p => newSelected.add(p.id));
        setSelectedIds(newSelected);
    } else {
        const newSelected = new Set(selectedIds);
        filteredPatients.forEach(p => newSelected.delete(p.id));
        setSelectedIds(newSelected);
    }
  };

  const isAllSelected = filteredPatients.length > 0 && filteredPatients.every(p => selectedIds.has(p.id));

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setPatientToDelete('bulk');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete === 'bulk') {
        selectedIds.forEach(id => onDeletePatient(id));
        setSelectedIds(new Set());
    } else if (patientToDelete) {
        onDeletePatient(patientToDelete.id);
        if (selectedIds.has(patientToDelete.id)) {
            const newSelected = new Set(selectedIds);
            newSelected.delete(patientToDelete.id);
            setSelectedIds(newSelected);
        }
    }
    setIsDeleteModalOpen(false);
    setPatientToDelete(null);
  };

  const handleBulkExport = () => {
    const patientsToExport = patients.filter(p => selectedIds.has(p.id));
    exportPatients(patientsToExport, `mclaim_selected_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleExportAll = () => {
    exportPatients(filteredPatients, `mclaim_all_${new Date().toISOString().slice(0,10)}.csv`);
    setIsFileMenuOpen(false);
  };

  const exportPatients = (data: Patient[], filename: string) => {
    // Headers matching the table columns
    const headers = [
      "Pasien", "Lama Rawat", "Kamar", "Diagnosis", 
      "Tarif INA-CBG", "Tagihan RS", "Selisih", "Note Usulan"
    ];

    const safe = (val: string | number | undefined | null) => {
        if (val === undefined || val === null) return '""';
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = data.map(p => {
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
        ].join(";");
    });

    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
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
        const originalPatient = patients.find(p => p.id === editingId);
        if (originalPatient) {
            const updatedPatient: Patient = {
                ...originalPatient,
                name,
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
        const autoMrn = `RM-${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`;
        const newPatient: Patient = {
            id: crypto.randomUUID(),
            name,
            mrn: autoMrn,
            bpjsNumber: '-',
            gender,
            dob: '1980-01-01',
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
    const end = isDischarged && endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = Math.max(1, diffDays + 1);
    return `${totalDays} Hari`;
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsFileMenuOpen(false);
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

      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const lineLower = lines[i].toLowerCase();
        if (lineLower.includes('no.rawat') || lineLower.includes('no.r.m.')) {
            startIndex = i + 1;
            isSimrsFormat = true;
            break;
        }
      }
      
      if (!isSimrsFormat) {
         const headerLine = lines[0].toLowerCase();
         if (headerLine.includes('nama pasien') && !headerLine.includes('no. rm')) {
             startIndex = 1;
             isShortFormat = true;
         } else {
             startIndex = headerLine.includes('no. rm') ? 1 : 0;
         }
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        let separator = ',';
        if (line.includes('\t')) separator = '\t';
        else if (line.split(';').length > line.split(',').length) separator = ';';

        let parts: string[] = [];
        if (separator === ',') {
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
            const mrn = parts[2] || `RM-${Math.floor(Math.random() * 99999)}`;
            const name = parts[3];
            if (!name) continue;
            const roomNumber = parts[6] || '';
            const diagCode = parts[7] || '';
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
            if (parts.length < 1) continue;
            const name = parts[0];
            if (!name) continue;
            const mrn = `RM-${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 999)}`;
            const bpjsNumber = '-';
            const gender = Gender.MALE;
            const status = PatientStatus.ADMITTED;
            const admissionDate = (parts[1] && parts[1] !== '-' && parts[1] !== '""') ? parts[1] : new Date().toISOString().split('T')[0];
            const roomNumber = (parts[2] && parts[2] !== '-' && parts[2] !== '""') ? parts[2] : '';
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
    const headers = [
      "Nama Pasien", "Tgl Masuk", "Kamar", 
      "Kode Diagnosis", "Deskripsi Diagnosis", "Tagihan RS", "Tarif INA-CBG", "Selisih"
    ];
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
    setIsFileMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Manajemen Pasien</h2>
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
        <div className={`p-1 rounded-xl border flex shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'active' 
                    ? (isDarkMode ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-700 shadow-sm') 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Pasien Aktif
            </button>
            <button 
                onClick={() => setActiveTab('krs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'krs' 
                    ? (isDarkMode ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-700 shadow-sm') 
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
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                      isDarkMode 
                      ? 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                      : 'bg-white border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="relative" ref={fileMenuRef}>
                <button 
                    onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
                    className={`border px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center group h-[42px] ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                    title="Menu File (Import/Export)"
                >
                    <span className="material-icons-round text-teal-600 group-hover:text-teal-700">upload_file</span>
                </button>
                
                {isFileMenuOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border py-2 z-20 animate-fade-in ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                    }`}>
                        <button 
                            onClick={handleImportClick}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                              isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-icons-round text-teal-600 text-lg">upload_file</span>
                            Import Excel (CSV)
                        </button>
                        <button 
                            onClick={handleDownloadTemplate}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                              isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-icons-round text-blue-600 text-lg">description</span>
                            Download Template CSV
                        </button>
                        <div className={`my-1 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
                        <button 
                            onClick={handleExportAll}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                              isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-icons-round text-indigo-600 text-lg">download</span>
                            Export Semua Data
                        </button>
                    </div>
                )}
            </div>

            <button 
                onClick={() => window.print()}
                className={`border px-3 rounded-xl shadow-sm transition-colors flex items-center justify-center group h-[42px] ${
                   isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
                title="Print Data"
            >
                <span className={`material-icons-round group-hover:text-slate-800 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>print</span>
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

      {selectedIds.size > 0 && (
        <div className={`border rounded-xl p-3 flex items-center justify-between animate-fade-in print:hidden ${
          isDarkMode ? 'bg-teal-950/20 border-teal-900' : 'bg-teal-50 border-teal-200'
        }`}>
            <div className="flex items-center gap-3">
                <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-lg">{selectedIds.size} Dipilih</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-teal-800'}`}>Pasien terpilih dari daftar saat ini</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleBulkExport}
                    className={`flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-teal-900 text-teal-400 hover:bg-teal-900/40' : 'bg-white border-teal-200 text-teal-700 hover:bg-teal-100'
                    }`}
                >
                    <span className="material-icons-round text-sm">download</span>
                    Export
                </button>
                <button 
                    onClick={handleBulkDelete}
                    className={`flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-rose-900 text-rose-400 hover:bg-rose-950/40' : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'
                    }`}
                >
                    <span className="material-icons-round text-sm">delete</span>
                    Hapus
                </button>
            </div>
        </div>
      )}

      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className={`border-b text-[10px] uppercase font-semibold tracking-wider transition-colors ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                        <th className="px-4 py-4 w-10 print:hidden">
                             <input 
                                type="checkbox" 
                                className={`w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer transition-opacity duration-200 ${selectedIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                             />
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('name')}>
                          <div className="flex items-center">
                            Pasien {renderSortIndicator('name')}
                          </div>
                        </th>
                        <th className="px-4 py-4 w-32 cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('los')}>
                          <div className="flex items-center">
                            Lama Rawat {renderSortIndicator('los')}
                          </div>
                        </th>
                        <th className="px-4 py-4 cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('room')}>
                          <div className="flex items-center">
                            Kamar {renderSortIndicator('room')}
                          </div>
                        </th>
                        <th className="px-4 py-4 cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('diagnosis')}>
                          <div className="flex items-center">
                            Diagnosis {renderSortIndicator('diagnosis')}
                          </div>
                        </th>
                        <th className="px-4 py-4 text-right cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('tariff')}>
                          <div className="flex items-center justify-end">
                            Tarif INA-CBG {renderSortIndicator('tariff')}
                          </div>
                        </th>
                        <th className="px-4 py-4 text-right cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('billing')}>
                          <div className="flex items-center justify-end">
                            Tagihan RS {renderSortIndicator('billing')}
                          </div>
                        </th>
                        <th className="px-4 py-4 text-right cursor-pointer hover:bg-teal-500/5 transition-colors" onClick={() => requestSort('variance')}>
                          <div className="flex items-center justify-end">
                            Selisih {renderSortIndicator('variance')}
                          </div>
                        </th>
                        <th className="px-4 py-4 w-32">Note Usulan</th>
                        <th className="px-6 py-4 text-right print:hidden">Aksi</th>
                    </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`} style={{ fontFamily: 'Arial, sans-serif' }}>
                    {sortedPatients.map((patient) => {
                        const bill = patient.billingAmount || 0;
                        const effectiveTariff = getEffectiveTariff(patient);
                        const cbg = effectiveTariff.amount;
                        const variance = cbg - bill;
                        
                        const hasDiagnosis = patient.diagnoses.length > 0;
                        const activeDiagnosis = patient.diagnoses[0];
                        const lengthOfStayStr = calculateLengthOfStay(patient.admissionDate, patient.lastVisit, patient.status === PatientStatus.DISCHARGED);
                        const isSelected = selectedIds.has(patient.id);

                        return (
                            <tr key={patient.id} className={`transition-colors group ${
                              isSelected 
                              ? (isDarkMode ? 'bg-teal-900/10' : 'bg-teal-50/30') 
                              : (isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                            }`}>
                                <td className="px-4 py-4 print:hidden">
                                     <input 
                                        type="checkbox" 
                                        className={`w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer transition-opacity duration-200 ${isSelected || selectedIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        checked={isSelected}
                                        onChange={() => handleToggleSelect(patient.id)}
                                        onClick={(e) => e.stopPropagation()}
                                     />
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectPatient(patient)}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0 ${
                                            patient.gender === Gender.MALE 
                                            ? (isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600') 
                                            : (isDarkMode ? 'bg-pink-900/40 text-pink-400' : 'bg-pink-100 text-pink-600')
                                        }`}>
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{patient.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                     <span className={`text-sm font-bold block ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>{lengthOfStayStr}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{patient.roomNumber || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {hasDiagnosis ? (
                                        <span className={`font-mono text-sm px-2 py-1 rounded border font-bold ${
                                          isDarkMode 
                                          ? 'bg-teal-900/30 text-teal-400 border-teal-800' 
                                          : 'bg-teal-50 text-teal-700 border-teal-100'
                                        }`}>
                                            {activeDiagnosis.code}
                                        </span>
                                    ) : <span className="text-xs text-slate-400 italic">Belum ada</span>}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-mono text-sm font-medium ${
                                          effectiveTariff.isEstimated 
                                          ? 'text-slate-500' 
                                          : (isDarkMode ? 'text-teal-400' : 'text-teal-700')
                                        }`}>
                                            {formatCurrency(cbg)}
                                        </span>
                                    </div>
                                </td>
                                <td className={`px-4 py-4 text-right font-mono text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {formatCurrency(bill)}
                                </td>
                                <td className={`px-4 py-4 text-right font-mono text-sm font-bold ${variance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                    {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                                </td>
                                <td className="px-4 py-4">
                                    <button 
                                        onClick={(e) => handleOpenNote(patient, e)}
                                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg border transition-colors truncate max-w-[120px] ${
                                          isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600'
                                        }`}
                                    >
                                        {patient.verifierNote ? patient.verifierNote : <span className="text-slate-500 italic">Isi note...</span>}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right print:hidden">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleOpenEdit(patient, e)}
                                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-blue-400 hover:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                            title="Edit"
                                        >
                                            <span className="material-icons-round text-sm">edit</span>
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(patient, e)}
                                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                                            title="Hapus"
                                        >
                                            <span className="material-icons-round text-sm">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {sortedPatients.length === 0 && (
                        <tr>
                            <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
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
            <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Edit Pasien' : 'Tambah Pasien Baru'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Nama Pasien</label>
                        <input 
                            type="text" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                              isDarkMode 
                              ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                              : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                            }`}
                            placeholder="Nama Lengkap"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Jenis Kelamin</label>
                            <select 
                                value={gender}
                                onChange={(e) => setGender(e.target.value as Gender)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                                  isDarkMode 
                                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                                  : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                                }`}
                            >
                                <option value={Gender.MALE}>Laki-laki</option>
                                <option value={Gender.FEMALE}>Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Status</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                                  isDarkMode 
                                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                                  : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                                }`}
                            >
                                <option value={PatientStatus.ADMITTED}>Rawat Inap</option>
                                <option value={PatientStatus.OUTPATIENT}>Rawat Jalan</option>
                                <option value={PatientStatus.DISCHARGED}>Pulang</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Tanggal Masuk</label>
                            <input 
                                type="date" 
                                required 
                                value={admissionDate}
                                onChange={(e) => setAdmissionDate(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                                  isDarkMode 
                                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                                  : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                                }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Nomor Kamar/Poli</label>
                            <input 
                                type="text" 
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                                  isDarkMode 
                                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                                  : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                                }`}
                                placeholder="Cth: Anggrek 1"
                            />
                        </div>
                    </div>

                    <div className={`border-t pt-4 mt-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Estimasi Biaya</h4>
                        <div className="space-y-3">
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Tagihan RS (Real Cost)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        value={billingAmount}
                                        onChange={(e) => setBillingAmount(e.target.value)}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                                          isDarkMode 
                                          ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                                          : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                                        }`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Tarif INA-CBG (Klaim)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rp</span>
                                    <input 
                                        type="number" 
                                        value={inaCbgAmount}
                                        onChange={(e) => setInaCbgAmount(e.target.value)}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                                          isDarkMode 
                                          ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                                          : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                                        }`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`flex gap-3 pt-4 border-t mt-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}>Batal</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
            <div className={`rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Catatan Usulan</h3>
                <div className="mb-4">
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pasien: <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{notePatient?.name}</span></p>
                    <textarea 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none resize-none text-sm transition-all ${
                          isDarkMode 
                          ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
                          : 'bg-white border-slate-300 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800'
                        }`}
                        placeholder="Tulis catatan usulan verifikasi..."
                        autoFocus
                    />
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsNoteModalOpen(false)}
                        className={`flex-1 px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
            <div className={`rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-rose-900/30' : 'bg-rose-50'}`}>
                    <span className="material-icons-round text-rose-600 text-4xl">warning_amber</span>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Konfirmasi Hapus</h3>
                <p className={`text-sm leading-relaxed mb-8 px-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {patientToDelete === 'bulk' 
                        ? `Apakah Anda yakin ingin menghapus ${selectedIds.size} data pasien yang dipilih? Tindakan ini tidak dapat dibatalkan.`
                        : `Apakah Anda yakin ingin menghapus data pasien ${patientToDelete?.name}? Data rekam medis dan klaim terkait akan terhapus permanen.`
                    }
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setIsDeleteModalOpen(false);
                            setPatientToDelete(null);
                        }}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${
                          isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        Batal
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200 active:scale-95"
                    >
                        Hapus Permanen
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
