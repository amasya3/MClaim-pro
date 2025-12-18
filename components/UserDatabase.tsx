
import React, { useState } from 'react';
import { User } from '../types';

interface UserDatabaseProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  isDarkMode?: boolean;
}

export const UserDatabase: React.FC<UserDatabaseProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Verifikator' | 'Kepala Unit'>('Verifikator');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setUsername('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('Verifikator');
    setEditingId(null);
    setShowPassword(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setUsername(user.username);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role);
    setEditingId(user.id);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateUser({ id: editingId, username, name, email, role, password });
    } else {
      onAddUser({ id: crypto.randomUUID(), username, name, email, role, password });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Database Users</h2>
          <p className="text-slate-500">Kelola hak akses pengguna sistem MClaim.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="material-icons-round text-sm">person_add</span>
          Tambah User
        </button>
      </div>

      <div className="relative">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
            type="text" 
            placeholder="Cari user berdasarkan nama, username, atau role..." 
            className={`w-full md:w-96 pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
              isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-200 focus:ring-teal-500/30 focus:border-teal-500' 
              : 'bg-white border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-xs uppercase font-semibold tracking-wider transition-colors ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Password</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {filteredUsers.map(user => (
              <tr key={user.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user.name}</td>
                <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>@{user.username}</td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{user.password ? '••••••••' : '-'}</td>
                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'Admin' || user.role === 'Kepala Unit' 
                    ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700') 
                    : (isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-700')
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-blue-400 hover:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                      <span className="material-icons-round text-sm">edit</span>
                    </button>
                    {user.username !== 'admin' && (
                      <button 
                        onClick={() => onDeleteUser(user.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                      >
                        <span className="material-icons-round text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Edit User' : 'Tambah User Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Nama Lengkap</label>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                    isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500' 
                    : 'bg-white border-slate-300 text-slate-800 focus:border-teal-500'
                  }`} 
                  placeholder="Dr. Hartono" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Username</label>
                  <input 
                    required 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value.toLowerCase())} 
                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                      isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-teal-500'
                    }`} 
                    placeholder="hartono" 
                  />
                </div>
                <div className="relative">
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Password</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className={`w-full px-4 py-2 border rounded-lg outline-none pr-10 transition-all ${
                        isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500' 
                        : 'bg-white border-slate-300 text-slate-800 focus:border-teal-500'
                      }`} 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'}`}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-icons-round text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Email</label>
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                    isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500' 
                    : 'bg-white border-slate-300 text-slate-800 focus:border-teal-500'
                  }`} 
                  placeholder="hartono@mclaim.id" 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as any)} 
                  className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                    isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500' 
                    : 'bg-white border-slate-300 text-slate-800 focus:border-teal-500'
                  }`}
                >
                  <option value="Verifikator">Verifikator</option>
                  <option value="Kepala Unit">Kepala Unit</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className={`flex gap-3 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}>Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
