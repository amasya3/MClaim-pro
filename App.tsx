
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { InaCbgDatabase } from './components/InaCbgDatabase';
import { UserDatabase } from './components/UserDatabase';
import { Patient, ViewState, PatientStatus, Gender, INACBGTemplate, User } from './types';

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
    admissionDate: '2023-10-25',
    roomNumber: 'Anggrek 301',
    billingAmount: 4500000,
    inaCbgAmount: 5200000,
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
    admissionDate: '2023-10-24',
    roomNumber: 'Poli Penyakit Dalam',
    billingAmount: 180000,
    inaCbgAmount: 180000,
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
    admissionDate: '2023-10-20',
    roomNumber: 'Melati VIP B',
    billingAmount: 8750000,
    inaCbgAmount: 7500000,
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
  { id: '1', code: 'A01.0', description: 'Typhoid fever', tariff: 2268800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TUBEX', 'JUMLAH ANTIBIOTIK'] },
  { id: '2', code: 'A09.0', description: 'Other and unspecified gastroenteritis and colitis of infectious origin', tariff: 1264200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '3', code: 'A15.0', description: 'Tb lung confirm sputum microscopy with or without culture', tariff: 4119700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TCM', 'GRAM', 'OKSIGEN', 'BACAAN THORAKS'] },
  { id: '4', code: 'A41.9', description: 'Septicaemia, unspecified', tariff: 1915000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'LEMBAR ANTIBIOTIK', 'HASIL KULTUR DARAH'] },
  { id: '5', code: 'A49.9', description: 'Bacterial infection, unspecified', tariff: 2268800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'DEMAM', 'LEUKOSITOSIS', 'UL NEGATIF', 'JUMLAH ANTIBIOTIK'] },
  { id: '6', code: 'A90', description: 'Dengue fever [classical dengue]', tariff: 1677600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TROMBOSIT <100.000', 'NS-1'] },
  { id: '7', code: 'B16.9', description: 'Acute hepatitis b without delta-agent and without hepatatitis coma', tariff: 2953100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HBSAG (+)', 'JUMLAH ANTIVIRAL'] },
  { id: '8', code: 'D21', description: 'Benign neoplasm,', tariff: 3995800, severity: 'I', requiredDocuments: ['SEP', 'PA', 'LAPORAN OPERASI'] },
  { id: '9', code: 'D25.9', description: 'Leiomyoma of uterus, unspecified', tariff: 5804800, severity: 'I', requiredDocuments: ['SEP', 'PA', 'LAPORAN OPERASI'] },
  { id: '10', code: 'D64.9', description: 'Anaemia, unspecified', tariff: 2098100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HB < 8', 'LEMBAR TRANSFUSI', 'TINDAKAN TRANSFUSI'] },
  { id: '11', code: 'E11.0', description: 'Non-insulin-dependent diabetes mellitus with coma', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'GCS < 9', 'TERAPI INSULIN'] },
  { id: '12', code: 'E11.4', description: 'Non-insulin-dependent diabetes mellitus with neurological complications', tariff: 3159100, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'KELUHAN NEURO', 'TERAPI INSULIN'] },
  { id: '13', code: 'E11.5', description: 'Non-insulin-dependent diabetes mellitus with peripheral circulatory complications', tariff: 4389900, severity: 'I', requiredDocuments: ['SEP', 'RIWAYAT DM', 'LAPORAN OPERASI', 'TERAPI INSULIN'] },
  { id: '14', code: 'E11.9', description: 'Non-insulin-dependent diabetes mellitus without complications', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'GDA > 300', 'TERAPI INSULIN'] },
  { id: '15', code: 'E16.2', description: 'Hypoglycaemia, unspecified', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GCS < 9', 'GDA < 60', 'TERAPI D40'] },
  { id: '16', code: 'E87.6', description: 'Hypokalaemia', tariff: 2728300, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'KELUHAN LEMAS', 'KALIUM < 2,5', 'KOREKSI KALIUM'] },
  { id: '17', code: 'G41.9', description: 'Status epilepticus, unspecified', tariff: 2601200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'KEJANG > 30 mnt', 'TIDAK SADAR > 30 mnt.'] },
  { id: '18', code: 'H81.1', description: 'Benign paroxysmal vertigo', tariff: 1240800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '19', code: 'I10', description: 'Essential (primary) hypertension', tariff: 1992500, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TERAPI ANTIHIPERTENSI'] },
  { id: '20', code: 'I11.9', description: 'Hypertensive heart disease without (congestive) heart failure', tariff: 1992500, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL THORAKS HHD', 'TERAPI ANTIDIURETIK', 'TERAPI ANTIHIPERTENSI'] },
  { id: '21', code: 'I20.0', description: 'Unstable angina', tariff: 3149701, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'NYERI DADA', 'HASIL EKG', 'TERAPI ANGINA', 'TINDAKAN KATETER URIN'] },
  { id: '22', code: 'I21.9', description: 'Acute myocardial infarction, unspecified', tariff: 3030000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'NYERI DADA', 'HASIL EKG', 'TERAPI DIVITI/FONDAPARINUX', 'TINDAKAN KATETER URIN'] },
  { id: '23', code: 'I44.0', description: 'Atrioventricular block, first degree', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TINDAKAN KATETER URIN'] },
  { id: '24', code: 'I47.1', description: 'Supraventricular tachycardia', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TERAPI ARITMIA', 'TINDAKAN KATETER URIN'] },
  { id: '25', code: 'I48', description: 'Atrial fibrillation and flutter', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TERAPI ARITMIA', 'TINDAKAN KATETER URIN'] },
  { id: '26', code: 'I50.0', description: 'Congestive heart failure', tariff: 2436300, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL ECHO JANTUNG', 'JUMLAH ANTIDIURETIK', 'TINDAKAN KATETER URIN'] },
  { id: '27', code: 'I63.9', description: 'Cerebral infarction, unspecified', tariff: 3521200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '28', code: 'I84', description: 'haemorrhoids', tariff: 5018700, severity: 'I', requiredDocuments: ['SEP', 'KELUHAN', 'STATUS LOKALIS', 'LAPORAN OPERASI'] },
  { id: '29', code: 'I95.9', description: 'Hypotension, unspecified', tariff: 2116600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TENSI < 90', 'LOADING CAIRAN 1000CC/30 menit lanjut loading 500cc/1jam lanjut loading 500cc/2jam', 'Jumlah Cairan Minimal 4 kolf', 'Jumlah vascon'] },
  { id: '30', code: 'J02.9', description: 'Acute pharyngitis, unspecified', tariff: 1881200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'STATUS LOKALIS', 'MATA COWONG (+)', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '31', code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', tariff: 1881200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'MATA COWONG (+)', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '32', code: 'J18.0', description: 'Bronchopneumonia, unspecified', tariff: 3432600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'SPO2 < 90%', 'RR > 30x/menit', 'JUMLAH O2', 'CURB SCORE', 'BACAAN THORAKS', '5 HARI PERAWATAN', 'JUMLAH AMPICILIN+GENTAMISIN'] },
  { id: '33', code: 'J20.9', description: 'Acute bronchitis, unspecified', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH ANTIBIOTIK'] },
  { id: '34', code: 'J22', description: 'Unspecified acute lower respiratory infection', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH ANTIBIOTIK'] },
  { id: '35', code: 'J40', description: 'Bronchitis, not specified as acute or chronic', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH ANTIBIOTIK'] },
  { id: '36', code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation, unspecified', tariff: 2850100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH NEBUL'] },
  { id: '37', code: 'J46', description: 'Status asthmaticus', tariff: 2114700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH NEBUL'] },
  { id: '38', code: 'J81', description: 'Pulmonary oedema', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'TINDAKAN KATETER', 'JUMLAH ANTIDIURETIK'] },
  { id: '39', code: 'K35.3', description: 'Acute appendicitis with localized peritonitis', tariff: 3167600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'STATUS LOKALIS', 'ALVARADO SCORE', 'LAPORAN OPERASI'] },
  { id: '40', code: 'K40.9', description: 'Unilateral or unspecified inguinal hernia, without obstruction or gangrene', tariff: 4283800, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'LAPORAN OPERASI'] },
  { id: '41', code: 'K42.9', description: 'Umbilical hernia without obstruction or gangrene', tariff: 4009400, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'LAPORAN OPERASI'] },
  { id: '42', code: 'K56.7', description: 'Ileus, unspecified', tariff: 1953900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN BOF LLD', 'TINDAKAN NGT', 'TINDAKAN KATETER URIN'] },
  { id: '43', code: 'K80.8', description: 'Other cholelithiasis', tariff: 2950000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN USG ABDOMEN', 'TERAPI URSODEOXUCHOLIC'] },
  { id: '44', code: 'K92.1', description: 'Melaena', tariff: 1670300, severity: 'I', requiredDocuments: ['SEP', 'BAB HITAM', 'DL', 'LEMBAR TRANSFUSI', 'TINDAKAN TRANSFUSI'] },
  { id: '45', code: 'L05.0', description: 'Pilonidal cyst with abscess', tariff: 1433000, severity: 'I', requiredDocuments: ['SEP', 'LAPORAN OPERASI', 'STATUS LOKALIS'] },
  { id: '46', code: 'N17.9', description: 'Acute renal failure, unspecified', tariff: 2665400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'PRODUKSI URIN', 'TINDAKAN KATETER', 'LAB KREATININ 2x/48 JAM'] },
  { id: '47', code: 'N19', description: 'Unspecified renal failure', tariff: 2665400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'PRODUKSI URIN', 'TINDAKAN KATETER', 'LAB KREATININ 2x/48 JAM'] },
  { id: '48', code: 'N20.0', description: 'Calculus of kidney', tariff: 3379400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN BOF ATAU USG ABDOMEN'] },
  { id: '49', code: 'N23', description: 'Unspecified renal colic', tariff: 3379400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'VAS > 8'] },
  { id: '50', code: 'N39.0', description: 'Urinary tract infection, site not specified', tariff: 2208400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BAKTERI URIN (+)', 'LEUKOSIT URIN > 10/LP', 'JUMLAH ANTIBIOTIK'] },
  { id: '51', code: 'O14.1', description: 'Severe pre-eclampsia', tariff: 4926400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'GEJALA IMPENDING', 'JUMLAH MGSO4', 'LAPORAN OPERASI', 'JUMLAH ANTIHIPERTENSI'] },
  { id: '52', code: 'O21.1', description: 'Hyperemesis gravidarum with metabolic disturbance', tariff: 2067900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '53', code: 'O34.2', description: 'Maternal care due to uterine scar from previous surgery', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'RUJUKAN FKTP', 'UPLOAD BUKU KIA', 'LAPORAN OPERASI'] },
  { id: '54', code: 'O41.0', description: 'Oligohydramnios', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'AFI < 4', 'UPLOAD BUKU KIA', 'LAPORAN OPERASI'] },
  { id: '55', code: 'O42.1', description: 'Premature rupture of membranes, onset of labour after 24 hours', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'PARTOGRAF', 'UPLOAD BUKU KIA', 'LAPORAN OPERASI'] },
  { id: '56', code: 'O44.1', description: 'Placenta praevia with haemorrhage', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'BACAAN USG', 'UPLOAD BUKU KIA', 'LAPORAN OPERASI'] },
  { id: '57', code: 'O61.0', description: 'Failed medical induction of labour', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'PARTOGRAF', 'UPLOAD BUKU KIA', 'LAPORAN OPERASI'] },
  { id: '58', code: 'O68.9', description: 'Labour and delivery complicated by fetal stress, unspecified', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'NST', 'UPLOAD BUKU KIA', 'LAPORAN OPERASI'] },
  { id: '59', code: 'P59.9', description: 'Neonatal jaundice, unspecified', tariff: 2953100, severity: 'I', requiredDocuments: ['SEP', 'SCORE KRAMER', 'BILIRUBIN > 20', 'TINDAKAN FOTOTERAPI'] },
  { id: '60', code: 'R18', description: 'Ascites', tariff: 2953100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TINDAKAN PUNGSI'] },
  { id: '61', code: 'R56.0', description: 'Febrile convulsions', tariff: 2601200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'KEJANG 2x', 'TERAPI DIAZEPAM'] },
  { id: '62', code: 'S42.00', description: 'Fracture of clavicle, closed', tariff: 2322600, severity: 'I', requiredDocuments: ['SEP', 'KRONOLOGI', 'RONTGEN KLAVIKULA'] },
];

const initialUsers: User[] = [
  { id: 'u1', username: 'admin', name: 'Admin', role: 'Admin', email: 'admin@mclaim.id', password: '123456' },
  { id: 'u2', username: 'hartono', name: 'Dr. Hartono', role: 'Verifikator', email: 'hartono@mclaim.id', password: 'password123' },
  { id: 'u3', username: 'sari', name: 'Sari Rahayu', role: 'Verifikator', email: 'sari@mclaim.id', password: 'password123' },
  { id: 'u4', username: 'makhdum', name: 'dr Ahmad Makhdum Basya', role: 'Verifikator', email: 'makhdum@mclaim.id', password: '123' },
];

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [cbgTemplates, setCbgTemplates] = useState<INACBGTemplate[]>(initialTemplates);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleLogin = (hospital: string, user: User) => {
    setHospitalName(hospital);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setView('DASHBOARD');
    setSelectedPatientId(null);
  };

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

  // User Database Handlers
  const handleAddUser = (user: User) => {
    setUsers(prev => [user, ...prev]);
  };

  const handleUpdateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Render Auth screen if not logged in
  if (!isAuthenticated) {
    return <Auth users={users} onLogin={handleLogin} />;
  }

  const activePatient = patients.find(p => p.id === selectedPatientId);

  return (
    <Layout 
        currentView={view} 
        onChangeView={handleNavigate}
        hospitalName={hospitalName}
        currentUser={currentUser}
        onLogout={handleLogout}
    >
      {view === 'DASHBOARD' && (
        <Dashboard 
            patients={patients} 
            cbgTemplates={cbgTemplates}
            onSelectPatient={handleSelectPatient}
        />
      )}
      
      {view === 'PATIENTS' && (
        <PatientList 
          patients={patients} 
          cbgTemplates={cbgTemplates}
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

      {view === 'USER_DATABASE' && (
        <UserDatabase 
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
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
