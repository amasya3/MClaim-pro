
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  users: User[];
  onLogin: (hospitalName: string, user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ users, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifierName, setVerifierName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If registering, we simulate successful registration and login for the prototype
    if (isRegister) {
      const finalHospitalName = hospitalName || "RSI Mabarrot MWC NU Bungah";
      const newUser: User = { 
        id: crypto.randomUUID(), 
        username: username || 'newuser', 
        name: verifierName || 'User Baru', 
        role: 'Verifikator', 
        email: email || 'user@mclaim.id' 
      };
      onLogin(finalHospitalName, newUser);
      return;
    }

    // If logging in, check against the "database" (users prop)
    const foundUser = users.find(u => 
      (u.username === username || u.email === username) && u.password === password
    );

    if (foundUser) {
      const finalHospitalName = "RSI Mabarrot MWC NU Bungah";
      onLogin(finalHospitalName, foundUser);
    } else {
      setError("Kombinasi Email/Username dan Password tidak sesuai dengan database.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        <div className="p-8 w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4 border-2 border-teal-800 shadow-sm">
                <svg className="w-10 h-10 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MClaim <span className="text-teal-600">Manajer</span></h1>
            <p className="text-slate-500 text-sm mt-2">Sistem Manajemen Klaim & INA-CBGs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-lg text-xs font-medium animate-pulse">
                {error}
              </div>
            )}
            
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Rumah Sakit</label>
                  <input 
                    type="text" 
                    required 
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                    placeholder="Contoh: RSI Mabarrot MWC NU Bungah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required 
                    value={verifierName}
                    onChange={(e) => setVerifierName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                    placeholder="Contoh: dr Ahmad Makhdum"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRegister ? 'Username' : 'Email atau Username'}
              </label>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                placeholder={isRegister ? "Contoh: RSIMB" : "admin atau email"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/30 transition-all transform active:scale-95 mt-2"
            >
              {isRegister ? 'Daftar Akun RS' : 'Masuk Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isRegister ? 'Sudah punya akun?' : 'Belum terdaftar?'}
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1 text-teal-600 font-bold hover:underline"
              >
                {isRegister ? 'Login disini' : 'Daftarkan Rumah Sakit'}
              </button>
            </p>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} MClaim Manajer. Dilindungi Undang-Undang.
      </p>
    </div>
  );
};
