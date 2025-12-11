
import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportClick = () => {
    // Headers matching the requested Excel format
    const headers = ["No", "Kode", "ICD 10", "Tarif", "Kelengkapan Wajib"];
    
    // Helper for safe CSV fields (handles quotes)
    const safe = (val: string | number | undefined | null) => {
        if (val === undefined || val === null) return '';
        const str = String(val);
        // Escape quotes by doubling them
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
             return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = filteredTemplates.map((t, i) => {
        // Format Tariff to match "Rp 2.268.800" style or just number
        // Using formatted string as per user image expectation
        const tariffStr = t.tariff 
            ? `Rp ${new Intl.NumberFormat('id-ID').format(t.tariff)}` 
            : 'Rp 0';
        
        return [
            i + 1,
            safe(t.code),
            safe(t.description),
            safe(tariffStr),
            safe(t.requiredDocuments.join(', '))
        ].join(";");
    });

    // Add BOM (\uFEFF) so Excel recognizes UTF-8 encoding
    const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `database_inacbg_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r\n|\n/);
      let importedCount = 0;

      // Start loop. Auto-detect header row? 
      // Usually Row 1 is header. We'll skip if it looks like a header.
      const firstLine = lines[0].toLowerCase();
      const startIndex = (firstLine.includes('no') && firstLine.includes('kode')) || firstLine.includes('icd') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect separator: Tab (Excel copy-paste), Semicolon (ID CSV), or Comma (US CSV)
        let separator = ',';
        if (line.includes('\t')) separator = '\t';
        else if (line.includes(';')) separator = ';';
        
        // Simple split. For complex CSV with quoted commas, a regex splitter would be needed.
        // Assuming file is Semicolon separated or Tab separated to allow commas in document list.
        const parts = line.split(separator).map(p => p.trim().replace(/^"|"$/g, ''));

        // Expected Columns based on Image:
        // 0: No.
        // 1: Kode
        // 2: ICD 10 (Description)
        // 3: Tarif
        // 4: Kelengkapan Wajib (Docs)

        // Robustness: Identify where 'Code' starts. Codes usually match Pattern like A01.0
        let codeIndex = 1; // Default assumes "No" column exists
        
        // If col 0 looks like a code (A01, B20), assume No column is missing
        if (parts[0] && /^[A-Z][0-9]/.test(parts[0])) {
            codeIndex = 0;
        }

        // Check bounds
        if (parts.length < codeIndex + 2) continue;

        const code = parts[codeIndex].toUpperCase();
        const description = parts[codeIndex + 1];
        
        // Tariff Parsing (Remove "Rp", ".", " ", etc)
        // Image: "Rp 2.268.800" -> 2268800
        const tariffRaw = parts[codeIndex + 2] || '0';
        const tariffClean = tariffRaw.replace(/[^0-9]/g, ''); 
        const tariff = tariffClean ? parseFloat(tariffClean) : undefined;

        // Docs Parsing (Comma separated in image: "SEP, TRIAGE, TUBEX")
        const docsRaw = parts[codeIndex + 3] || '';
        const requiredDocuments = docsRaw
            ? docsRaw.split(',').map(d => d.trim()).filter(d => d && d !== '-')
            : ['Surat Elegibilitas Peserta (SEP)', 'Resume Medis'];

        // Severity: Default to I as it is not in the Excel
        const severity = 'I'; 

        if (code && description) {
            onAddTemplate({
                id: crypto.randomUUID(),
                code,
                description,
                severity,
                tariff,
                requiredDocuments
            });
            importedCount++;
        }
      }

      if (importedCount > 0) {
        alert(`Berhasil mengimpor ${importedCount} data kode.`);
      } else {
        alert('Gagal membaca data. Pastikan format kolom sesuai: No | Kode | ICD 10 | Tarif | Kelengkapan Wajib');
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
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

      <div className="flex gap-2">
        <div className="relative flex-1">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
                type="text" 
                placeholder="Cari kode atau deskripsi..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button 
            onClick={handleImportClick}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center group"
            title="Import Excel (CSV)"
        >
            <span className="material-icons-round text-teal-600 group-hover:text-teal-700">upload_file</span>
        </button>
        <button 
            onClick={handleExportClick}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center group"
            title="Download Format Excel"
        >
            <span className="material-icons-round text-emerald-600 group-hover:text-emerald-700">file_download</span>
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv,.txt" 
            className="hidden" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <span className="bg-teal-50 text-teal-700 font-mono font-bold px-2 py-1 rounded text-sm border border-teal-100">
                        {template.code}
                    </span>
                    {/* Severity display removed */}
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
