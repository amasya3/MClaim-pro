
import React from 'react';
import { Patient, PatientStatus, INACBGTemplate } from '../types';

interface DashboardProps {
  patients: Patient[];
  cbgTemplates: INACBGTemplate[];
  onSelectPatient: (patient: Patient) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  patients, 
  cbgTemplates, 
  onSelectPatient,
  isDarkMode,
  onToggleDarkMode
}) => {
  const totalPatients = patients.length;
  const admittedPatients = patients.filter(p => p.status === PatientStatus.ADMITTED).length;
  const pendingChecklists = patients.reduce((acc, p) => {
    const activeDiagnosis = p.diagnoses[0];
    if (activeDiagnosis) {
        const incompleteDocs = activeDiagnosis.checklist.filter(c => !c.isChecked && c.required).length;
        return acc + (incompleteDocs > 0 ? 1 : 0);
    }
    return acc;
  }, 0);

  // Cost Control Logic
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const getEffectiveTariffAmount = (patient: Patient): number => {
    if (patient.inaCbgAmount && patient.inaCbgAmount > 0) {
        return patient.inaCbgAmount;
    }
    // Try to find in database
    if (patient.diagnoses.length > 0) {
        const code = patient.diagnoses[0].code;
        const template = cbgTemplates.find(t => t.code === code);
        if (template && template.tariff) {
            return template.tariff;
        }
    }
    return 0;
  };

  const totalBilling = patients.reduce((acc, p) => acc + (p.billingAmount || 0), 0);
  const totalInaCbg = patients.reduce((acc, p) => acc + getEffectiveTariffAmount(p), 0);
  const totalVariance = totalInaCbg - totalBilling;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-4">
        <div>
           <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Ringkasan Rumah Sakit</h2>
           <p className="text-slate-500 mt-1">Laporan harian aktivitas pasien dan klaim.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={onToggleDarkMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Toggle Night Mode"
            >
                <span className="material-icons-round text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                <span className="hidden sm:inline">Night Mode</span>
            </button>
            <div className={`flex items-center px-4 py-1.5 rounded-full border text-sm font-medium shadow-sm transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'
            }`}>
                {/* Fixed date format to match screenshot: Kamis, 18 Desember 2025 (or current equivalent) */}
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl shadow-sm border transition-colors flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Total Pasien Aktif</p>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{totalPatients}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <span className="material-icons-round">groups</span>
            </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border transition-colors flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Rawat Inap</p>
                <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{admittedPatients}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <span className="material-icons-round">bed</span>
            </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border transition-colors flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Berkas Belum Lengkap</p>
                <h3 className="text-3xl font-bold text-rose-600">{pendingChecklists}</h3>
                <p className="text-xs text-rose-500 mt-1">Perlu review segera</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                <span className="material-icons-round">assignment_late</span>
            </div>
        </div>
      </div>

      {/* Cost Control Summary Section - Compact Version */}
      <div className={`p-4 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Total Tagihan RS</p>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{formatCurrency(totalBilling)}</h3>
            </div>
            <div className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Total Potensi Klaim (INA-CBG)</p>
                <h3 className="text-xl font-bold text-teal-500">{formatCurrency(totalInaCbg)}</h3>
            </div>
            <div className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Estimasi Profit / Loss</p>
                <h3 className={`text-xl font-bold ${totalVariance >= 0 ? 'text-green-500' : 'text-rose-500'}`}>
                    {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                </h3>
            </div>
          </div>
       </div>

      {/* Recent Activity / Pending Tasks */}
      <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Butuh Tindakan Dokumen</h3>
        <div className="space-y-4">
            {patients.filter(p => p.diagnoses.length > 0 && p.diagnoses[0].checklist.some(c => !c.isChecked)).slice(0, 5).map(patient => (
                <div 
                    key={patient.id} 
                    onClick={() => onSelectPatient(patient)}
                    className={`flex items-start gap-4 p-3 rounded-xl transition-all border border-transparent cursor-pointer group ${
                        isDarkMode ? 'hover:bg-slate-800 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-colors ${
                        isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold truncate transition-colors ${
                            isDarkMode ? 'text-slate-200 group-hover:text-teal-400' : 'text-slate-800 group-hover:text-teal-700'
                        }`}>{patient.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{patient.diagnoses[0]?.code} - {patient.diagnoses[0]?.description}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded transition-colors whitespace-nowrap ${
                        isDarkMode ? 'bg-rose-950/40 text-rose-400' : 'bg-rose-50 text-rose-600'
                    }`}>
                        {patient.diagnoses[0]?.checklist.filter(c => !c.isChecked).length} Berkas
                    </span>
                </div>
            ))}
            {patients.filter(p => p.diagnoses.length > 0 && p.diagnoses[0].checklist.some(c => !c.isChecked)).length === 0 && (
                <p className="text-slate-500 text-center py-8">Semua berkas pasien lengkap.</p>
            )}
        </div>
      </div>
    </div>
  );
};
