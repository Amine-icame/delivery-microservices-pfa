import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, MapPin, LogOut, User, History, Settings, Moon, Sun, Bell, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDriverProfile } from '../../services/api';
import { AlertTriangle } from 'lucide-react';

const DriverLayout = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  
  // --- GESTION DARK MODE ---
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsMenuOpen(false) || setIsDarkMode(!isDarkMode);

  // --- CHARGEMENT PROFIL ---
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const data = await getDriverProfile(payload.email);
          setDriver(data);
        }
      } catch (error) {
        console.error("Erreur chargement profil", error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (driver && driver.status === 'PENDING_APPROVAL') {
    return (
        <div className="flex h-screen bg-slate-50 items-center justify-center p-6">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md border border-yellow-100">
            <div className="w-24 h-24 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertTriangle size={48}/>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Compte en attente</h1>
            <p className="text-slate-500 mb-8">
              Bonjour <strong>{driver.name}</strong>. Votre inscription a bien été reçue.
              L'administrateur doit valider votre dossier avant que vous puissiez commencer à livrer.
            </p>
            <button onClick={handleLogout} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
              Se déconnecter
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-300">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all duration-300 z-20 shadow-xl shadow-blue-900/5">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-50 dark:border-slate-700">
            <div className="bg-blue-600 p-2 rounded-xl mr-0 lg:mr-3 shadow-lg shadow-blue-600/30">
              <Truck className="text-white w-5 h-5" />
            </div>
            <span className="hidden lg:block text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
              Driver<span className="text-blue-500">App</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 mt-6">
            <NavItem to="/driver/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/driver/deliveries" icon={MapPin} label="Mes Courses" />
            <NavItem to="/driver/history" icon={History} label="Historique" />
            <div className="pt-4 pb-2 border-b border-slate-50 dark:border-slate-700 mx-2"></div>
            <NavItem to="/driver/settings" icon={User} label="Mon Profil" />
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-700">
          <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
            <span className="hidden lg:block ml-3 font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Espace Livreur</h2>
          
          <div className="flex items-center gap-4">
            
            {/* INDICATEUR DE STATUT (Visible en permanence) */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${
                driver?.status === 'AVAILABLE' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                : 'bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400'
            }`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${driver?.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${driver?.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">{driver ? driver.status : "..."}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition bg-slate-50 dark:bg-slate-700 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>

            {/* --- MENU DÉROULANT (ENGRENAGE) --- */}
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none"
                >
                    <Settings size={24} className="animate-[spin_5s_linear_infinite]" />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-900 z-50"
                        >
                            {/* Header Menu */}
                            <div className="p-5 bg-gradient-to-r from-blue-600 to-cyan-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold border border-white/30 text-lg shadow-inner">
                                        {driver ? driver.name.charAt(0).toUpperCase() : <User/>}
                                    </div>
                                    <div className="text-white overflow-hidden">
                                        <div className="font-bold text-base truncate">
                                            {driver ? driver.name : "Chargement..."}
                                        </div>
                                        <div className="text-xs text-blue-100 truncate opacity-90">
                                            {driver ? driver.email : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-2">
                                <button 
                                    onClick={() => { navigate('/driver/settings'); setIsMenuOpen(false); }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-slate-600 rounded-lg text-blue-600 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition">
                                            <User size={18} />
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Mon Profil</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button 
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group mt-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 dark:bg-slate-600 rounded-lg text-purple-600 dark:text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition">
                                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Mode {isDarkMode ? 'Clair' : 'Sombre'}
                                        </div>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full p-0.5 flex transition-colors ${isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                                        <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </button>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-700 p-2 mt-2">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition"
                                >
                                    <LogOut size={16} /> Se déconnecter
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center p-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md hover:text-blue-600 dark:hover:text-white'}`}>
    <Icon size={22} />
    <span className="hidden lg:block ml-3 font-medium">{label}</span>
  </NavLink>
);

export default DriverLayout;