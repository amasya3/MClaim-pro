
import React, { useState } from 'react';
import { INACBGTemplate } from '../types';

interface InaCbgDatabaseProps {
  templates: INACBGTemplate[];
  onAddTemplate: (template: INACBGTemplate) => void;
  onUpdateTemplate: (template: INACBGTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const InaCbgDatabase: React.FC<InaCbgDatabaseProps> = ({ 
  templates, 
  onAddTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'I' | 'II' | 'III'>('I');
  const [tariff, setTariff] = useState<string>('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [newDocInput, setNewDocInput] = useState('');

  const filteredTemplates = templates.filter(t => 
    t.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setSeverity('I');
    setTariff('');
    setDocuments(['Surat Elegibilitas Peserta (SEP)', 'Resume Medis']); // Default minimal
    setNewDocInput('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: INACBGTemplate) => {
    setCode(template.code);
    setDescription(template.description);
    setSeverity(template.severity);
    setTariff(template.tariff ? template.tariff.toString() : '');
    setDocuments([...template.requiredDocuments]);
    setNewDocInput('');
    setEditingId(template.id);
    setIsModalOpen(true);
  };

  const handleDelete = (template: INACBGTemplate) => {
    if (window.confirm(`Hapus template kode ${template.code}?`)) {
      onDeleteTemplate(template.id);
    }
  };

  const handleAddDocument = () => {
    if (newDocInput.trim()) {
        setDocuments([...documents, newDocInput.trim()]);
        setNewDocInput('');
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    setDocuments(newDocs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDocs = newDocInput.trim() ? [...documents, newDocInput.trim()] : documents;
    const finalTariff = tariff ? parseFloat(tariff) : undefined;

    if (editingId) {
        onUpdateTemplate({
            id: editingId,
            code,
            description,
            severity,
            tariff: finalTariff,
            requiredDocuments: finalDocs
        });
    } else {
        onAddTemplate({
            id: crypto.randomUUID(),
            code,
            description,
            severity,
            tariff: finalTariff,
            requiredDocuments: finalDocs
        });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Database INA-CBGs & Tarif</h2>
          <p className="text-slate-500">Master data kode, checklist berkas, dan standar tarif RS.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="material-icons-round text-sm">add</span>
          Tambah Kode
        </button>
      </div>

      <div className="relative">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
            type="text" 
            placeholder="Cari kode atau deskripsi..." 
            className="w-full md:w-96 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <span className="bg-teal-50 text-teal-700 font-mono font-bold px-2 py-1 rounded text-sm border border-teal-100">
                        {template.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Severity {template.severity}
                    </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">{template.description}</h3>
                
                {/* Cost Section */}
                <div className="mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tarif RS Kelas D</p>
                   <p className="text-lg font-bold text-slate-700 font-mono">
                      {formatCurrency(template.tariff)}
                   </p>
                </div>

                <div className="flex-1 mb-4">
                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Kelengkapan Wajib:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                        {template.requiredDocuments.slice(0, 3).map((doc, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                                <span className="truncate">{doc}</span>
                            </li>
                        ))}
                        {template.requiredDocuments.length > 3 && (
                            <li className="text-xs text-slate-400 pl-3.5">+ {template.requiredDocuments.length - 3} berkas lainnya</li>
                        )}
                    </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <button 
                        onClick={() => handleOpenEdit(template)}
                        className="text-xs font-medium text-slate-500 hover:text-teal-600 px-3 py-1.5 rounded hover:bg-teal-50 transition-colors"
                    >
                        Edit Data
                    </button>
                    <button 
                        onClick={() => handleDelete(template)}
                        className="text-xs font-medium text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded hover:bg-rose-50 transition-colors"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        ))}
        {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                Tidak ada data kode ditemukan.
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex-shrink-0">{editingId ? 'Edit Template Kode' : 'Tambah Template Kode'}</h3>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
                                <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-mono" placeholder="J45.9" />
                            </div>
                            <div className="w-2/3">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                                <select value={severity} onChange={e => setSeverity(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none">
                                    <option value="I">I (Ringan)</option>
                                    <option value="II">II (Sedang)</option>
                                    <option value="III">III (Berat)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                            <textarea required rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none" placeholder="Deskripsi lengkap penyakit..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Standar Tarif (RS Kelas D)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                                <input 
                                    type="number" 
                                    value={tariff} 
                                    onChange={e => setTariff(e.target.value)} 
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                    placeholder="0" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Checklist Berkas Wajib</label>
                            <div className="space-y-2 mb-3">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <span className="material-icons-round text-teal-500 text-sm">check_circle</span>
                                        <span className="text-sm text-slate-700 flex-1">{doc}</span>
                                        <button type="button" onClick={() => handleRemoveDocument(idx)} className="text-slate-400 hover:text-rose-500 p-1">
                                            <span className="material-icons-round text-sm">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newDocInput} 
                                    onChange={e => setNewDocInput(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddDocument())}
                                    placeholder="Tambah dokumen baru..." 
                                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                                />
                                <button type="button" onClick={handleAddDocument} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors">
                                    <span className="material-icons-round">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100 flex-shrink-0">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Batal</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Simpan</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
