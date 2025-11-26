import React, { useState } from 'react';
import { Patient, PatientStatus, Gender } from '../types';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onAddPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newMrn, setNewMrn] = useState('');
  const [newBpjs, setNewBpjs] = useState('');
  const [newGender, setNewGender] = useState<Gender>(Gender.MALE);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.includes(searchTerm) ||
    p.bpjsNumber.includes(searchTerm)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
        id: crypto.randomUUID(),
        name: newName,
        mrn: newMrn,
        bpjsNumber: newBpjs,
        gender: newGender,
        dob: '1980-01-01', // Mock default
        status: PatientStatus.ADMITTED,
        diagnoses: [],
        lastVisit: new Date().toISOString(),
    };
    onAddPatient(newPatient);
    setIsModalOpen(false);
    // Reset form
    setNewName('');
    setNewMrn('');
    setNewBpjs('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Pasien</h2>
          <p className="text-slate-500">Kelola data pasien dan riwayat INA-CBGs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="material-icons-round text-sm">add</span>
          Pasien Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
            type="text" 
            placeholder="Cari nama, No. RM, atau No. BPJS..." 
            className="w-full md:w-96 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
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
                        <th className="px-6 py-4">No. RM / BPJS</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Diagnosis Terakhir</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{patient.name}</div>
                                        <div className="text-xs text-slate-500">{patient.gender}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-slate-800 font-medium">{patient.mrn}</div>
                                <div className="text-xs text-slate-500">{patient.bpjsNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${patient.status === PatientStatus.ADMITTED ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                      patient.status === PatientStatus.OUTPATIENT ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                      'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {patient.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {patient.diagnoses.length > 0 ? (
                                    <div className="max-w-xs">
                                        <div className="text-sm text-slate-800 truncate" title={patient.diagnoses[0].description}>
                                            {patient.diagnoses[0].description}
                                        </div>
                                        <div className="text-xs text-teal-600 font-mono mt-0.5">
                                            {patient.diagnoses[0].code}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-slate-400 italic">Belum ada diagnosis</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => onSelectPatient(patient)}
                                    className="text-slate-400 hover:text-teal-600 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                                >
                                    Detail <span className="material-icons-round text-sm">arrow_forward</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredPatients.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                Tidak ditemukan data pasien.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Pasien Baru</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder="Contoh: Budi Santoso" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">No. RM</label>
                            <input required type="text" value={newMrn} onChange={e => setNewMrn(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder="00-00-00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">No. BPJS</label>
                            <input required type="text" value={newBpjs} onChange={e => setNewBpjs(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder="000123..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                        <select value={newGender} onChange={e => setNewGender(e.target.value as Gender)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none">
                            <option value={Gender.MALE}>Laki-laki</option>
                            <option value={Gender.FEMALE}>Perempuan</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};