import React, { useState } from 'react';
import { Patient, INACBGTemplate } from '../types';

interface CostControlProps {
  patients: Patient[];
  cbgTemplates: INACBGTemplate[];
  onUpdateCost: (patient: Patient) => void;
}

export const CostControl: React.FC<CostControlProps> = ({ patients, cbgTemplates, onUpdateCost }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  // Form State
  const [billingInput, setBillingInput] = useState<string>('');
  const [inaCbgInput, setInaCbgInput] = useState<string>('');
  const [isUsingDatabaseVal, setIsUsingDatabaseVal] = useState(false);

  // Helper to determine the effective tariff
  // 1. Manual Override (if set)
  // 2. Database Standard (if available)
  // 3. 0
  const getEffectiveTariff = (patient: Patient): { amount: number, isEstimated: boolean } => {
    if (patient.inaCbgAmount && patient.inaCbgAmount > 0) {
        return { amount: patient.inaCbgAmount, isEstimated: false };
    }
    
    // Try to find in database
    if (patient.diagnoses.length > 0) {
        const code = patient.diagnoses[0].code;
        const template = cbgTemplates.find(t => t.code === code);
        if (template && template.tariff) {
            return { amount: template.tariff, isEstimated: true };
        }
    }

    return { amount: 0, isEstimated: false };
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.includes(searchTerm) ||
    p.diagnoses.some(d => d.code.includes(searchTerm.toUpperCase()))
  );

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);
    setBillingInput(patient.billingAmount?.toString() || '');
    
    // Pre-fill logic for INA-CBG
    const effective = getEffectiveTariff(patient);
    setInaCbgInput(effective.amount > 0 ? effective.amount.toString() : '');
    setIsUsingDatabaseVal(effective.isEstimated && effective.amount > 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
        const updatedPatient = {
            ...editingPatient,
            billingAmount: billingInput ? parseFloat(billingInput) : 0,
            inaCbgAmount: inaCbgInput ? parseFloat(inaCbgInput) : 0,
        };
        onUpdateCost(updatedPatient);
        setEditingPatient(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cost Control</h2>
          <p className="text-slate-500">Analisis selisih antara Tagihan RS (Real Cost) dan Tarif INA-CBG.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
            type="text" 
            placeholder="Cari pasien atau kode diagnosis..." 
            className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <th className="px-6 py-4">Pasien</th>
                        <th className="px-4 py-4">Diagnosis Utama</th>
                        <th className="px-4 py-4 text-right">Tagihan RS</th>
                        <th className="px-4 py-4 text-right">Tarif INA-CBG</th>
                        <th className="px-4 py-4 text-right">Selisih</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((patient) => {
                        const bill = patient.billingAmount || 0;
                        
                        // Use calculated effective tariff
                        const effectiveTariff = getEffectiveTariff(patient);
                        const cbg = effectiveTariff.amount;
                        
                        const variance = cbg - bill;
                        const hasDiagnosis = patient.diagnoses.length > 0;

                        return (
                            <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{patient.name}</div>
                                </td>
                                <td className="px-4 py-4">
                                    {hasDiagnosis ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-700 font-medium">{patient.diagnoses[0].code}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{patient.diagnoses[0].description}</span>
                                        </div>
                                    ) : <span className="text-xs text-slate-400">-</span>}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-sm text-slate-700">
                                    {formatCurrency(bill)}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-mono text-sm font-medium ${effectiveTariff.isEstimated ? 'text-slate-600' : 'text-teal-700'}`}>
                                            {formatCurrency(cbg)}
                                        </span>
                                        {effectiveTariff.isEstimated && (
                                            <span className="text-[10px] text-teal-600 bg-teal-50 px-1 rounded">
                                                Database
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className={`px-4 py-4 text-right font-mono text-sm font-bold ${variance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                    {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleEditClick(patient)}
                                        className="text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                    >
                                        Update Biaya
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredPatients.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                Tidak ada data pasien ditemukan.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Update Biaya</h3>
                <p className="text-sm text-slate-500 mb-4">Pasien: <span className="font-semibold text-slate-700">{editingPatient.name}</span></p>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Tagihan RS (Real Cost)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                            <input 
                                type="number" 
                                value={billingInput} 
                                onChange={e => setBillingInput(e.target.value)} 
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Tarif INA-CBG (Klaim)</label>
                            {isUsingDatabaseVal && (
                                <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100">
                                    Sesuai Database
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                            <input 
                                type="number" 
                                value={inaCbgInput} 
                                onChange={e => {
                                    setInaCbgInput(e.target.value);
                                    setIsUsingDatabaseVal(false); // User manually edited it
                                }} 
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {isUsingDatabaseVal 
                                ? "Nominal otomatis terisi berdasarkan kode diagnosis dari database."
                                : "Nominal diinput secara manual."
                            }
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={() => setEditingPatient(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};