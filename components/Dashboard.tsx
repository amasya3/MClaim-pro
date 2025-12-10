import React from 'react';
import { Patient, PatientStatus, INACBGTemplate } from '../types';

interface DashboardProps {
  patients: Patient[];
  cbgTemplates: INACBGTemplate[];
  onSelectPatient: (patient: Patient) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, cbgTemplates, onSelectPatient }) => {
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
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Ringkasan Rumah Sakit</h2>
           <p className="text-slate-500 mt-1">Laporan harian aktivitas pasien dan klaim.</p>
        </div>
        <div className="text-right">
            <span className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Total Pasien Aktif</p>
                <h3 className="text-3xl font-bold text-slate-800">{totalPatients}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-icons-round">groups</span>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Rawat Inap</p>
                <h3 className="text-3xl font-bold text-slate-800">{admittedPatients}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <span className="material-icons-round">bed</span>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Berkas Belum Lengkap</p>
                <h3 className="text-3xl font-bold text-rose-600">{pendingChecklists}</h3>
                <p className="text-xs text-rose-400 mt-1">Perlu review segera</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <span className="material-icons-round">assignment_late</span>
            </div>
        </div>
      </div>

      {/* Cost Control Summary Section - Compact Version */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-xs font-medium mb-1">Total Tagihan RS</p>
                <h3 className="text-lg font-bold text-slate-800">{formatCurrency(totalBilling)}</h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-xs font-medium mb-1">Total Potensi Klaim (INA-CBG)</p>
                <h3 className="text-lg font-bold text-teal-600">{formatCurrency(totalInaCbg)}</h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-xs font-medium mb-1">Estimasi Profit / Loss</p>
                <h3 className={`text-lg font-bold ${totalVariance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                    {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                </h3>
            </div>
          </div>
       </div>

      {/* Recent Activity / Pending Tasks */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Butuh Tindakan Dokumen</h3>
        <div className="space-y-4">
            {patients.filter(p => p.diagnoses.length > 0 && p.diagnoses[0].checklist.some(c => !c.isChecked)).slice(0, 5).map(patient => (
                <div 
                    key={patient.id} 
                    onClick={() => onSelectPatient(patient)}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
                        {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{patient.name}</h4>
                        <p className="text-xs text-slate-500">{patient.diagnoses[0]?.code} - {patient.diagnoses[0]?.description}</p>
                    </div>
                    <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded">
                        {patient.diagnoses[0]?.checklist.filter(c => !c.isChecked).length} Berkas
                    </span>
                </div>
            ))}
            {patients.filter(p => p.diagnoses.length > 0 && p.diagnoses[0].checklist.some(c => !c.isChecked)).length === 0 && (
                <p className="text-slate-400 text-center py-8">Semua berkas pasien lengkap.</p>
            )}
        </div>
      </div>
    </div>
  );
};
