
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { InaCbgDatabase } from './components/InaCbgDatabase';
import { UserDatabase } from './components/UserDatabase';
import { ApiClient } from './services/api';
import { Patient, ViewState, INACBGTemplate, User } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hospitalName, setHospitalName] = useState("RSI Mabarrot MWC NU Bungah");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cbgTemplates, setCbgTemplates] = useState<INACBGTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Initialize Data (Full-stack simulation)
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        const [pData, tData, uData] = await Promise.all([
          ApiClient.getPatients(),
          ApiClient.getTemplates(),
          ApiClient.getUsers()
        ]);
        setPatients(pData);
        setCbgTemplates(tData);
        setUsers(uData);
      } catch (error) {
        console.error("Failed to load backend data", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Persistence triggers
  useEffect(() => { if (!isLoading) ApiClient.savePatients(patients); }, [patients, isLoading]);
  useEffect(() => { if (!isLoading) ApiClient.saveTemplates(cbgTemplates); }, [cbgTemplates, isLoading]);
  useEffect(() => { if (!isLoading) ApiClient.saveUsers(users); }, [users, isLoading]);

  const handleLogin = (hospital: string, user: User) => {
    setHospitalName(hospital);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setView('DASHBOARD');
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setView('PATIENT_DETAIL');
  };

  if (!isAuthenticated) return <Auth users={users} onLogin={handleLogin} />;

  const activePatient = patients.find(p => p.id === selectedPatientId);

  return (
    <Layout 
        currentView={view} 
        onChangeView={setView}
        hospitalName={hospitalName}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
    >
      {isLoading && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg">
          <span className="material-icons-round text-sm">sync</span> Syncing...
        </div>
      )}

      {view === 'DASHBOARD' && (
        <Dashboard 
            patients={patients} 
            cbgTemplates={cbgTemplates}
            onSelectPatient={handleSelectPatient}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      
      {view === 'PATIENTS' && (
        <PatientList 
          patients={patients} 
          cbgTemplates={cbgTemplates}
          onSelectPatient={handleSelectPatient}
          onAddPatient={(p) => setPatients([p, ...patients])}
          onUpdatePatientDetails={(up) => setPatients(patients.map(p => p.id === up.id ? up : p))}
          onDeletePatient={(id) => setPatients(patients.filter(p => p.id !== id))}
          isDarkMode={isDarkMode}
        />
      )}

      {view === 'CBG_DATABASE' && (
        <InaCbgDatabase 
            templates={cbgTemplates}
            onAddTemplate={(t) => setCbgTemplates([t, ...cbgTemplates])}
            onUpdateTemplate={(ut) => setCbgTemplates(cbgTemplates.map(t => t.id === ut.id ? ut : t))}
            onDeleteTemplate={(id) => setCbgTemplates(cbgTemplates.filter(t => t.id !== id))}
            isDarkMode={isDarkMode}
        />
      )}

      {view === 'USER_DATABASE' && (
        <UserDatabase 
            users={users}
            onAddUser={(u) => setUsers([u, ...users])}
            onUpdateUser={(uu) => setUsers(users.map(u => u.id === uu.id ? uu : u))}
            onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
            isDarkMode={isDarkMode}
        />
      )}

      {view === 'PATIENT_DETAIL' && activePatient && (
        <PatientDetail 
          patient={activePatient} 
          onBack={() => setView('PATIENTS')}
          onUpdatePatient={(up) => setPatients(patients.map(p => p.id === up.id ? up : p))}
          cbgTemplates={cbgTemplates}
          isDarkMode={isDarkMode}
        />
      )}
    </Layout>
  );
};

export default App;
