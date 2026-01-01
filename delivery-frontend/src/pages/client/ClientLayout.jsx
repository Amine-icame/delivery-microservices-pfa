import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, LogOut, Bell, User, ShoppingBag, Moon, Sun, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCustomerProfile } from '../../services/api';

const ClientLayout = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  
  // --- GESTION DU MODE SOMBRE ---
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Applique la classe 'dark' au corps du site HTML
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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const data = await getCustomerProfile(payload.email);
          setCustomer(data);
        }
      } catch (error) {
        console.error("Erreur profil", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-300">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all duration-300 z-20">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-50 dark:border-slate-700">
            <div className="bg-blue-600 p-2 rounded-xl mr-0 lg:mr-3 shadow-lg shadow-blue-600/20">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="hidden lg:block text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
              Delivery<span className="text-blue-500">Express</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 mt-4">
            <NavItem to="/client/dashboard" icon={LayoutDashboard} label="Vue d'ensemble" />
            <NavItem to="/client/orders" icon={ShoppingBag} label="Mes Commandes" />
            <NavItem to="/client/settings" icon={Settings} label="Paramètres" />
          </nav>
        </div>

        {/* Logout (Sidebar) */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-700">
          <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block ml-3 font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Mon Espace</h2>
          
          <div className="flex items-center gap-6">
            
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition bg-slate-50 dark:bg-slate-700 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            
            {/* --- LE BOUTON MAGIQUE (Engrenage Rotatif) --- */}
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none"
                >
                    {/* animate-[spin_5s_linear_infinite] : Tourne doucement en permanence */}
                    <Settings size={24} className="animate-[spin_5s_linear_infinite]" />
                </button>

                {/* --- LE MENU DÉROULANT --- */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-900 z-50"
                        >
                            {/* En-tête du menu (Nom + Email) */}
                            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold border border-white/30 text-xl shadow-inner">
                                        {customer ? customer.firstName.charAt(0) : <User size={20}/>}
                                    </div>
                                    <div className="text-white overflow-hidden">
                                        <div className="font-bold text-base truncate">
                                            {customer ? `${customer.firstName} ${customer.lastName}` : "Chargement..."}
                                        </div>
                                        <div className="text-xs text-blue-100 truncate opacity-90">
                                            {customer ? customer.email : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Options du menu */}
                            <div className="p-2 space-y-1">
                                {/* Bouton Paramètres */}
                                <button 
                                    onClick={() => { navigate('/client/settings'); setIsMenuOpen(false); }}
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

                                {/* Bouton Dark Mode */}
                                <button 
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 dark:bg-slate-600 rounded-lg text-purple-600 dark:text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition">
                                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Apparence : {isDarkMode ? 'Sombre' : 'Clair'}
                                        </div>
                                    </div>
                                    
                                    {/* Switch UI */}
                                    <div className={`w-11 h-6 rounded-full p-1 flex transition-colors ${isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'}`}>
                                        <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </button>
                            </div>

                            {/* Footer Déconnexion */}
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

        {/* Injection des Pages */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
           <Outlet />
        </main>

      </div>
    </div>
  );
};

// Composant Lien Menu
const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center p-3 rounded-xl transition-all duration-300 group ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md hover:text-blue-600 dark:hover:text-white'
      }`
    }
  >
    <Icon size={20} />
    <span className="hidden lg:block ml-3 font-medium">{label}</span>
  </NavLink>
);

export default ClientLayout;