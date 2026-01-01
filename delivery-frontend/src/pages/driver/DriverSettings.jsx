import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Shield, Save, X, Edit2, Phone, Camera, CheckCircle } from 'lucide-react';
import { getDriverProfile, updateDriverProfile } from '../../services/api';
// IMPORTS
import toast from 'react-hot-toast';

const DriverSettings = () => {
  const [driver, setDriver] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    city: '',
    phone: '0600000000' 
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if(token) {
            const email = JSON.parse(atob(token.split('.')[1])).email;
            const data = await getDriverProfile(email);
            setDriver(data);
            setFormData({ 
                name: data.name, 
                email: data.email, 
                city: data.city,
                phone: data.phone || '0600000000' 
            });
        }
    } catch (e) {
        console.error(e);
        toast.error("Impossible de charger le profil.");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        await updateDriverProfile(driver.id, formData);
        setDriver({ ...driver, ...formData }); 
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès ! 🔥");
    } catch (e) {
        console.error(e);
        toast.error("Erreur lors de la mise à jour.");
    } finally {
        setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ 
        name: driver.name, 
        email: driver.email, 
        city: driver.city,
        phone: driver.phone || '0600000000'
    });
  };

  if (!driver) return <div className="p-10 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mon Profil</h1>
            <p className="text-slate-500 dark:text-slate-400">Gérez vos informations personnelles.</p>
          </div>
          
          {!isEditing ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 text-white font-bold bg-slate-900 dark:bg-indigo-600 px-6 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition shadow-lg shadow-slate-900/20"
              >
                  <Edit2 size={18}/> Modifier
              </motion.button>
          ) : (
              <div className="flex gap-3">
                  <button onClick={handleCancel} className="flex items-center gap-2 text-slate-500 dark:text-slate-300 font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <X size={18}/> Annuler
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave} 
                    disabled={loading}
                    className="flex items-center gap-2 text-white font-bold bg-blue-600 dark:bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-70"
                  >
                      {loading ? '...' : <><Save size={18}/> Enregistrer</>}
                  </motion.button>
              </div>
          )}
      </div>
      
      {/* --- CARTE PRINCIPALE --- */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
        
        {/* Banner Arrière-plan */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute bottom-4 right-8 text-white/80 text-xs font-bold uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Compte Professionnel
            </div>
        </div>
        
        <div className="px-10 pb-12">
            {/* Avatar & Identité */}
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-10 gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 bg-white dark:bg-slate-800 p-1.5 rounded-[2rem] shadow-2xl transition-colors duration-300">
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-[1.7rem] flex items-center justify-center text-slate-400 dark:text-slate-300 overflow-hidden relative">
                            <User size={48} />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm">
                                    <Camera className="text-white" size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Badge de certification */}
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full border-4 border-white dark:border-slate-800 shadow-sm" title="Compte Vérifié">
                        <CheckCircle size={16} fill="currentColor" className="text-white" />
                    </div>
                </div>

                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        {isEditing ? (
                            <input 
                                type="text"
                                className="text-3xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border-b-2 border-blue-500 outline-none w-full md:w-auto text-center md:text-left px-2 py-1 rounded-t-lg"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        ) : (
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{driver.name}</h2>
                        )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-slate-500 dark:text-slate-400 font-medium">
                        <Shield size={14} className="text-emerald-500" />
                        <span>Statut actuel : <span className={`uppercase font-bold ${driver.status === 'AVAILABLE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}`}>{driver.status}</span></span>
                    </div>
                </div>
            </div>

            {/* Grille de Formulaire */}
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Email */}
                <EditableField 
                    label="Adresse Email" 
                    icon={Mail} 
                    value={formData.email} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, email: val})}
                />

                {/* Téléphone */}
                <EditableField 
                    label="Téléphone" 
                    icon={Phone} 
                    value={formData.phone} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, phone: val})}
                />

                {/* Ville */}
                <EditableField 
                    label="Zone de Livraison (Ville)" 
                    icon={MapPin} 
                    value={formData.city} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, city: val})}
                />

                {/* Champ Lecture Seule */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 flex items-center gap-4 opacity-70 cursor-not-allowed">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-300">
                        <Shield size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">ID Livreur</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200 font-mono">DRIVER-{driver.id}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Composant de champ intelligent
const EditableField = ({ label, icon: Icon, value, isEditing, onChange }) => {
    return (
        <motion.div 
            layout
            className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                isEditing 
                ? 'bg-white dark:bg-slate-700 border-blue-500 shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/5' 
                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-slate-500'
            }`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isEditing ? 'bg-blue-100 text-blue-600' : 'bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-300 shadow-sm'
            }`}>
                <Icon size={20} />
            </div>
            
            <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
                {isEditing ? (
                    <input 
                        type="text" 
                        className="w-full font-bold text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-300"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ) : (
                    <div className="font-bold text-slate-800 dark:text-white truncate">{value}</div>
                )}
            </div>
        </motion.div>
    );
};

export default DriverSettings;