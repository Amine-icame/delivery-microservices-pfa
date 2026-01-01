import React, { useState } from 'react';
import { User, Shield, Bell, Lock, Power, RefreshCw, Server } from 'lucide-react';
import { motion } from 'framer-motion';
// --- IMPORTS AJOUTÉS ---
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminSettings = () => {
  const token = localStorage.getItem('token');
  const email = token ? JSON.parse(atob(token.split('.')[1])).email : "admin@system.com";

  // États
  const [maintenance, setMaintenance] = useState(false);
  const [registrations, setRegistrations] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // États pour les Modales
  const [modalConfig, setModalConfig] = useState({ open: false, type: '', title: '', message: '' });

  // --- ACTIONS ---

  const handleToggle = (type) => {
    if (type === 'maintenance') {
        // Protection pour le mode maintenance
        if (!maintenance) {
            setModalConfig({
                open: true,
                type: 'maintenance',
                title: 'Activer le mode Maintenance ?',
                message: "Ceci coupera l'accès à tous les utilisateurs non-admins. Êtes-vous sûr ?",
                isDanger: true
            });
        } else {
            setMaintenance(false);
            toast.success("Mode Maintenance désactivé. Le site est en ligne.");
        }
    } else if (type === 'registrations') {
        setRegistrations(!registrations);
        toast.success(registrations ? "Inscriptions fermées." : "Inscriptions ouvertes.");
    } else if (type === 'notifications') {
        setNotifications(!notifications);
        toast.success("Préférences de notification mises à jour.");
    }
  };

  const handleClearCache = () => {
      setModalConfig({
          open: true,
          type: 'cache',
          title: 'Vider le cache système ?',
          message: "Cela peut ralentir temporairement l'application le temps de la reconstruction.",
          isDanger: false // Orange/Bleu plutôt que Rouge
      });
  };

  // --- CONFIRMATION DE LA MODALE ---
  const onConfirmAction = () => {
      if (modalConfig.type === 'maintenance') {
          setMaintenance(true);
          toast.error("⚠️ Mode Maintenance ACTIVÉ !");
      } else if (modalConfig.type === 'cache') {
          // Simulation d'un processus long
          const loadingToast = toast.loading("Nettoyage des fichiers temporaires...");
          setTimeout(() => {
              toast.dismiss(loadingToast);
              toast.success("Cache système vidé avec succès ! 🚀");
          }, 2000);
      }
      setModalConfig({ ...modalConfig, open: false });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Configuration Système</h1>

      {/* --- CARTE PROFIL ADMIN --- */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
        
        <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <Shield size={40} className="text-indigo-400" />
            </div>
            <div>
                <div className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">Super Admin</div>
                <h2 className="text-3xl font-bold">{email}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-slate-400 text-sm">Système Opérationnel</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- GRID CONTROLES --- */}
      <div className="grid md:grid-cols-2 gap-6">
          
          {/* Section Sécurité */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Lock size={20} className="text-indigo-500"/> Sécurité & Accès
              </h3>
              
              <div className="space-y-6">
                  <ToggleItem 
                    label="Inscriptions Publiques" 
                    desc="Autoriser les nouveaux clients à s'inscrire."
                    active={registrations} 
                    onClick={() => handleToggle('registrations')}
                  />
                  <ToggleItem 
                    label="Double Authentification (2FA)" 
                    desc="Forcer le 2FA pour tous les livreurs."
                    active={false} 
                    onClick={() => toast("Fonctionnalité disponible dans la v2.0", { icon: '🔒' })}
                  />
              </div>
          </div>

          {/* Section Système */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Server size={20} className="text-indigo-500"/> Système
              </h3>
              
              <div className="space-y-6">
                  <ToggleItem 
                    label="Mode Maintenance" 
                    desc="Couper l'accès client temporairement."
                    active={maintenance} 
                    onClick={() => handleToggle('maintenance')}
                    danger
                  />
                  <ToggleItem 
                    label="Notifications Email" 
                    desc="Envoi automatique des factures."
                    active={notifications} 
                    onClick={() => handleToggle('notifications')}
                  />
              </div>
          </div>
      </div>

      {/* Section Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30">
          <h3 className="text-red-600 font-bold mb-4 flex items-center gap-2"><Power size={20}/> Zone de Danger</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <p className="text-red-800/70 dark:text-red-300 text-sm">Attention : Ces actions impactent la performance du serveur.</p>
              
              <button 
                onClick={handleClearCache}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-red-600/20 flex items-center gap-2 active:scale-95"
              >
                  <RefreshCw size={18}/> Vider le Cache
              </button>
          </div>
      </div>

      {/* --- MODALE DE CONFIRMATION --- */}
      <ConfirmModal 
        isOpen={modalConfig.open}
        onClose={() => setModalConfig({ ...modalConfig, open: false })}
        onConfirm={onConfirmAction}
        title={modalConfig.title}
        message={modalConfig.message}
        isDanger={modalConfig.isDanger}
      />

    </div>
  );
};

const ToggleItem = ({ label, desc, active, onClick, danger }) => (
    <div className="flex justify-between items-center cursor-pointer group" onClick={onClick}>
        <div>
            <div className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">{label}</div>
            <div className="text-xs text-slate-500">{desc}</div>
        </div>
        <button 
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
                active ? (danger ? 'bg-red-500' : 'bg-indigo-600') : 'bg-slate-200 dark:bg-slate-700'
            }`}
        >
            <motion.div 
                layout 
                className={`w-6 h-6 bg-white rounded-full shadow-md ${active ? 'float-right' : 'float-left'}`}
            />
        </button>
    </div>
);

export default AdminSettings;