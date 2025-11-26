import React from 'react';
import { Patient, PatientStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  patients: Patient[];
}

export const Dashboard: React.FC<DashboardProps> = ({ patients }) => {
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

  // Mock data for chart - Distribution of severities
  const severityData = [
    { name: 'Ringan (I)', count: 12, color: '#2dd4bf' },
    { name: 'Sedang (II)', count: 8, color: '#0d9488' },
    { name: 'Berat (III)', count: 3, color: '#0f766e' },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Tingkat Keparahan (Severity)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={severityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                 <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                    {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Activity / Pending Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Butuh Tindakan Dokumen</h3>
            <div className="space-y-4">
                {patients.filter(p => p.diagnoses.length > 0 && p.diagnoses[0].checklist.some(c => !c.isChecked)).slice(0, 4).map(patient => (
                    <div key={patient.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">
                            {patient.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-800">{patient.name}</h4>
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
    </div>
  );
};