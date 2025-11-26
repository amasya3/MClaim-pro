import React, { useState } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  const [verifierName, setVerifierName] = useState("Dr. Hartono");
  const [isEditingVerifier, setIsEditingVerifier] = useState(false);
  const [tempVerifierName, setTempVerifierName] = useState("");

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: 'dashboard' },
    { id: 'PATIENTS', label: 'Manajemen Pasien', icon: 'people' },
    { id: 'CBG_DATABASE', label: 'Database INA-CBGs', icon: 'library_books' },
  ];

  const handleStartEdit = () => {
    setTempVerifierName(verifierName);
    setIsEditingVerifier(true);
  };

  const handleSaveVerifier = () => {
    if (tempVerifierName.trim()) {
        setVerifierName(tempVerifierName);
    }
    setIsEditingVerifier(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="material-icons-round text-teal-600 text-3xl mr-2">local_hospital</span>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">MClaim <span className="text-teal-600">Manajer</span></h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-teal-50 text-teal-700 font-medium shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className={`material-icons-round mr-3 ${currentView === item.id ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {isEditingVerifier ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 transition-all">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nama Verifikator</label>
                <input 
                    type="text" 
                    value={tempVerifierName}
                    onChange={(e) => setTempVerifierName(e.target.value)}
                    className="w-full text-sm px-2 py-1.5 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveVerifier()}
                />
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => setIsEditingVerifier(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSaveVerifier}
                        className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        Simpan
                    </button>
                </div>
            </div>
          ) : (
            <div 
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition-all"
                onClick={handleStartEdit}
                title="Klik untuk ubah nama verifikator"
            >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                <span className="material-icons-round text-sm">person</span>
                </div>
                <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{verifierName}</p>
                <p className="text-xs text-slate-400">Verifikator Internal</p>
                </div>
                <span className="material-icons-round text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden shrink-0">
           <div className="flex items-center">
             <span className="material-icons-round text-teal-600 text-2xl mr-2">local_hospital</span>
             <span className="font-bold text-lg">MClaim Manajer</span>
           </div>
           <button className="p-2 text-slate-500">
             <span className="material-icons-round">menu</span>
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};