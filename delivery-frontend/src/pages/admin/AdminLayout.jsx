import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, ShoppingBag, Settings, LogOut, Package, Moon, Sun, ShieldCheck, Search, Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] dark:bg-[#0f172a] font-sans overflow-hidden transition-colors duration-500 selection:bg-indigo-500 selection:text-white">
      
      {/* --- SIDEBAR FLOTTANTE --- */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: isSidebarOpen ? '18rem' : '5rem' }}
        className="hidden md:flex flex-col m-4 rounded-[2rem] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl z-20 relative overflow-hidden"
      >
        {/* Glow Effect en arrière plan */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>

        {/* Logo Area */}
        <div className={`h-24 flex items-center ${isSidebarOpen ? 'px-8' : 'justify-center'} border-b border-slate-100 dark:border-slate-800/50`}>
            <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-indigo-600 p-2.5 rounded-xl shadow-lg flex items-center justify-center">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
            </div>
            {isSidebarOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="ml-4"
                >
                    <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        Admin<span className="text-indigo-600">OS</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Control Center</p>
                </motion.div>
            )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto scrollbar-hide">
            <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Vue Globale" isOpen={isSidebarOpen} />
            
            <div className={`text-xs font-bold text-slate-400 uppercase tracking-wider pl-4 mt-6 mb-2 ${!isSidebarOpen && 'hidden'}`}>Opérations</div>
            <NavItem to="/admin/orders" icon={ShoppingBag} label="Commandes" isOpen={isSidebarOpen} />
            <NavItem to="/admin/drivers" icon={Truck} label="Flotte Livreurs" isOpen={isSidebarOpen} />
            <NavItem to="/admin/customers" icon={Users} label="Base Clients" isOpen={isSidebarOpen} />
            <NavItem to="/admin/products" icon={Package} label="Catalogue" isOpen={isSidebarOpen} />
            
            <div className={`text-xs font-bold text-slate-400 uppercase tracking-wider pl-4 mt-6 mb-2 ${!isSidebarOpen && 'hidden'}`}>Système</div>
            <NavItem to="/admin/settings" icon={Settings} label="Paramètres" isOpen={isSidebarOpen} />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
            <button 
                onClick={handleLogout}
                className={`flex items-center w-full p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group ${!isSidebarOpen && 'justify-center'}`}
            >
                <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500"/>
                {isSidebarOpen && <span className="ml-3 font-bold text-sm">Déconnexion</span>}
            </button>
        </div>
      </motion.aside>

      {/* --- ZONE CONTENU --- */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Header Flottant */}
        <header className="h-24 px-8 flex items-center justify-between z-10">
            {/* Titre Page / Breadcrumb */}
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition md:hidden">
                    <Menu size={20}/>
                </button>
                <div className="hidden md:block">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bonjour, Admin 👋</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Voici ce qui se passe aujourd'hui.</p>
                </div>
            </div>

            {/* Actions Droite */}
            <div className="flex items-center gap-4">
                {/* Search Bar "Glass" */}
                <div className="hidden md:flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all w-64">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm ml-3 text-slate-700 dark:text-slate-200 w-full placeholder-slate-400"/>
                </div>

                {/* Theme Toggle */}
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)} 
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-yellow-400 hover:scale-105 transition-transform"
                >
                    {isDarkMode ? <Sun size={20} className="animate-spin-slow"/> : <Moon size={20}/>}
                </button>

                {/* Notifications */}
                <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-indigo-400 relative hover:scale-105 transition-transform">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
                </button>

                {/* Profile Pic */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AD</span>
                    </div>
                </div>
            </div>
        </header>

        {/* Main Content Scrollable */}
        <main className="flex-1 overflow-y-auto px-4 pb-4 md:px-8 md:pb-8">
           {/* Wrapper pour l'animation de page */}
           <AnimatePresence mode='wait'>
                <motion.div 
                    key={window.location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    <Outlet />
                </motion.div>
           </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

// --- COMPOSANT NAV ITEM "LIQUIDE" ---
const NavItem = ({ to, icon: Icon, label, isOpen }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <div 
            onClick={() => window.location.href = '#' + to} // Hack pour React Router si besoin ou utiliser Link wrapper
            className="relative"
        >
            <button
                onClick={() => { /* Navigation via hook navigate dans le parent idéalement */ }}
                // Utilise NavLink normalement ici
                className={`relative flex items-center w-full p-3.5 rounded-2xl transition-all duration-300 z-10 group overflow-hidden ${
                    !isOpen && 'justify-center'
                }`}
                // Note: J'utilise un onClick simulé via le parent ou Link
            >
                {/* Background "Liquide" Animé qui suit l'actif */}
                {isActive && (
                    <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-500/40 rounded-2xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className={`relative z-20 flex items-center ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isOpen && <span className="ml-4 font-bold text-sm tracking-wide">{label}</span>}
                </div>
            </button>
            
            {/* Lien React Router réel invisible par dessus pour la navigation */}
            <NavLink to={to} className="absolute inset-0 z-20" />
        </div>
    );
};

export default AdminLayout;