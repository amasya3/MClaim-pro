
import React, { useState, useEffect } from 'react';
import { ViewState, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  hospitalName: string;
  currentUser: User | null;
  onLogout: () => void;
  isDarkMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  hospitalName,
  currentUser,
  onLogout,
  isDarkMode
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: 'grid_view', requiresAdmin: false },
    { id: 'PATIENTS', label: 'Manajemen Pasien', icon: 'people', requiresAdmin: false },
    { id: 'CBG_DATABASE', label: 'Database INA-CBGs', icon: 'library_books', requiresAdmin: true },
    { id: 'USER_DATABASE', label: 'Database Users', icon: 'manage_accounts', requiresAdmin: true },
  ];

  // Filter navigation items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (item.requiresAdmin) {
      return currentUser?.role === 'Admin';
    }
    return true;
  });

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
          flex-shrink-0 flex flex-col shadow-sm z-30 transition-all duration-300 print:hidden 
          fixed md:relative inset-y-0 left-0 h-full
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
          border-r
      `}>
        <div className={`h-20 flex items-center px-4 relative shrink-0 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-sm border-2 border-green-800 shrink-0 mx-auto">
             <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
             </svg>
          </div>
          
          <div className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className={`text-lg font-bold tracking-tight leading-none ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>MClaim <span className="text-teal-600">Manajer</span></h1>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wide truncate max-w-[140px]" title={hospitalName}>{hospitalName}</p>
          </div>

          <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute -right-3 top-7 border rounded-full p-1 shadow-sm transition-colors z-20 hidden md:flex ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-teal-400' : 'bg-white border-slate-200 text-slate-400 hover:text-teal-600'}`}
                title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
            >
                 <span className="material-icons-round text-sm">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 group whitespace-nowrap overflow-hidden ${
                currentView === item.id 
                  ? (isDarkMode ? 'bg-teal-900/40 text-teal-400 font-medium' : 'bg-teal-50 text-teal-700 font-medium shadow-sm') 
                  : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')
              } ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'}`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <span className={`material-icons-round ${currentView === item.id ? 'text-teal-500' : 'text-slate-400 group-hover:text-slate-600'} ${isSidebarCollapsed ? '' : 'mr-3'}`}>
                {item.icon}
              </span>
              {!isSidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={`p-4 shrink-0 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col justify-center gap-4' : 'gap-2'}`}>
                <div 
                    className={`flex items-center rounded-xl cursor-pointer group transition-all ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} ${isSidebarCollapsed ? 'p-1' : 'flex-1 gap-3 px-2 py-2'}`}
                    title={currentUser?.name}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                    <span className="material-icons-round text-sm">person</span>
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0 text-left">
                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{currentUser?.name}</p>
                            <p className="text-xs text-slate-500">{currentUser?.role}</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onLogout}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                    title="Logout"
                >
                    <span className="material-icons-round">logout_outlined</span>
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible w-full relative">
        {/* Mobile Header */}
        <header className={`h-16 border-b flex items-center justify-between px-4 md:hidden shrink-0 print:hidden relative z-10 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 -ml-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
             >
                <span className="material-icons-round">menu</span>
             </button>
             <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2 border-2 border-green-800 shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
                <span className={`font-bold text-lg ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>MClaim</span>
             </div>
           </div>
           <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-600">
             <span className="material-icons-round">logout</span>
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible print:h-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
