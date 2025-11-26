import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { InaCbgDatabase } from './components/InaCbgDatabase';
import { Patient, ViewState, PatientStatus, Gender, INACBGTemplate } from './types';

// Mock Data Initialization
const initialPatients: Patient[] = [
  {
    id: '1',
    mrn: '00-12-45',
    bpjsNumber: '0001234567891',
    name: 'Budi Santoso',
    gender: Gender.MALE,
    dob: '1975-05-20',
    status: PatientStatus.ADMITTED,
    lastVisit: '2023-10-25',
    diagnoses: [
        {
            id: 'd1',
            code: 'J45.9',
            description: 'Asma bronkial, tidak spesifik (Bronchial Asthma)',
            severity: 'I',
            timestamp: '2023-10-25',
            notes: 'Pasien sesak napas sejak semalam, riwayat asma kambuh karena cuaca dingin.',
            checklist: [
                { id: 'doc1', name: 'Surat Elegibilitas Peserta (SEP)', isChecked: true, required: true },
                { id: 'doc2', name: 'Resume Medis', isChecked: false, required: true },
                { id: 'doc3', name: 'Hasil Spirometri', isChecked: false, required: true },
                { id: 'doc4', name: 'Resep Obat Kronis', isChecked: true, required: false },
            ]
        }
    ]
  },
  {
    id: '2',
    mrn: '00-15-88',
    bpjsNumber: '0009876543210',
    name: 'Siti Aminah',
    gender: Gender.FEMALE,
    dob: '1982-11-12',
    status: PatientStatus.OUTPATIENT,
    lastVisit: '2023-10-24',
    diagnoses: []
  },
  {
    id: '3',
    mrn: '01-02-33',
    bpjsNumber: '0005554443332',
    name: 'Joko Widodo',
    gender: Gender.MALE,
    dob: '1960-01-01',
    status: PatientStatus.ADMITTED,
    lastVisit: '2023-10-20',
    diagnoses: [
       {
            id: 'd2',
            code: 'E11.9',
            description: 'Diabetes melitus tipe 2 tanpa komplikasi',
            severity: 'II',
            timestamp: '2023-10-20',
            checklist: [
                { id: 'doc5', name: 'SEP', isChecked: true, required: true },
                { id: 'doc6', name: 'Hasil Lab Gula Darah', isChecked: true, required: true },
                { id: 'doc7', name: 'Resume Medis', isChecked: true, required: true },
            ]
       }
    ]
  }
];

const initialTemplates: INACBGTemplate[] = [
    {
        id: 't1',
        code: 'J45.9',
        description: 'Asma bronkial, tidak spesifik (Bronchial Asthma)',
        severity: 'I',
        requiredDocuments: [
            'Surat Elegibilitas Peserta (SEP)',
            'Resume Medis',
            'Hasil Spirometri',
            'Catatan Pemberian Nebulizer'
        ]
    },
    {
        id: 't2',
        code: 'E11.9',
        description: 'Diabetes melitus tipe 2 tanpa komplikasi',
        severity: 'II',
        requiredDocuments: [
            'Surat Elegibilitas Peserta (SEP)',
            'Resume Medis',
            'Hasil Lab Gula Darah Puasa & 2 Jam PP',
            'Hasil Lab HbA1c'
        ]
    }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [cbgTemplates, setCbgTemplates] = useState<INACBGTemplate[]>(initialTemplates);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
    if (newView !== 'PATIENT_DETAIL') {
        setSelectedPatientId(null);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setView('PATIENT_DETAIL');
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  // Updates full patient object (used in Detail view for diagnosis updates)
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };
  
  // Updates patient demographics (used in List view for editing)
  const handleUpdatePatientDetails = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  // CBG Database Handlers
  const handleAddTemplate = (template: INACBGTemplate) => {
    setCbgTemplates(prev => [template, ...prev]);
  };

  const handleUpdateTemplate = (template: INACBGTemplate) => {
    setCbgTemplates(prev => prev.map(t => t.id === template.id ? template : t));
  };

  const handleDeleteTemplate = (id: string) => {
    setCbgTemplates(prev => prev.filter(t => t.id !== id));
  };

  const activePatient = patients.find(p => p.id === selectedPatientId);

  return (
    <Layout currentView={view} onChangeView={handleNavigate}>
      {view === 'DASHBOARD' && <Dashboard patients={patients} />}
      
      {view === 'PATIENTS' && (
        <PatientList 
          patients={patients} 
          onSelectPatient={handleSelectPatient}
          onAddPatient={handleAddPatient}
          onUpdatePatientDetails={handleUpdatePatientDetails}
          onDeletePatient={handleDeletePatient}
        />
      )}

      {view === 'CBG_DATABASE' && (
        <InaCbgDatabase 
            templates={cbgTemplates}
            onAddTemplate={handleAddTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
        />
      )}

      {view === 'PATIENT_DETAIL' && activePatient && (
        <PatientDetail 
          patient={activePatient} 
          onBack={() => handleNavigate('PATIENTS')}
          onUpdatePatient={handleUpdatePatient}
          cbgTemplates={cbgTemplates}
        />
      )}
    </Layout>
  );
};

export default App;