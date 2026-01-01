import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Phone, Save, X, Edit2, ShieldCheck, Home } from 'lucide-react';
import { getCustomerProfile, updateCustomerProfile } from '../../services/api';
// IMPORTS
import toast from 'react-hot-toast';

const Settings = () => {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '',
    address: '' 
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if(token) {
            const email = JSON.parse(atob(token.split('.')[1])).email;
            const data = await getCustomerProfile(email);
            setCustomer(data);
            setFormData({ 
                firstName: data.firstName, 
                lastName: data.lastName, 
                email: data.email, 
                phone: data.phoneNumber || '',
                address: data.address || ''
            });
        }
    } catch (e) {
        console.error(e);
        toast.error("Erreur de chargement du profil.");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        const apiData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone, 
            address: formData.address
        };

        await updateCustomerProfile(customer.id, apiData);
        
        setCustomer({ ...customer, ...apiData, phoneNumber: apiData.phone }); 
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès ! ✨");
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
        firstName: customer.firstName, 
        lastName: customer.lastName, 
        email: customer.email, 
        phone: customer.phoneNumber || '',
        address: customer.address || ''
    });
  };

  if (!customer) return <div className="p-10 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Paramètres Compte</h1>
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
                    className="flex items-center gap-2 text-white font-bold bg-blue-600 dark:bg-indigo-600 px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-70"
                  >
                      {loading ? '...' : <><Save size={18}/> Enregistrer</>}
                  </motion.button>
              </div>
          )}
      </div>
      
      {/* CARTE PRINCIPALE */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
        
        {/* Banner Dégradé */}
        <div className="h-40 bg-gradient-to-r from-purple-600 to-blue-500 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="px-10 pb-12">
            {/* Avatar & Nom */}
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-10 gap-6">
                <div className="relative">
                    <div className="w-32 h-32 bg-white dark:bg-slate-800 p-1.5 rounded-[2rem] shadow-2xl transition-colors duration-300">
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-[1.7rem] flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-4xl">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white dark:border-slate-800 shadow-sm" title="Client Vérifié">
                        <ShieldCheck size={16} fill="currentColor" />
                    </div>
                </div>

                <div className="text-center md:text-left flex-1 mb-2">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{customer.firstName} {customer.lastName}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Membre depuis 2025</p>
                </div>
            </div>

            {/* Formulaire Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                
                <EditableField 
                    label="Prénom" 
                    icon={User} 
                    value={formData.firstName} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, firstName: val})}
                />

                <EditableField 
                    label="Nom" 
                    icon={User} 
                    value={formData.lastName} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, lastName: val})}
                />

                <EditableField 
                    label="Email" 
                    icon={Mail} 
                    value={formData.email} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, email: val})}
                />

                <EditableField 
                    label="Téléphone" 
                    icon={Phone} 
                    value={formData.phone} 
                    isEditing={isEditing}
                    onChange={(val) => setFormData({...formData, phone: val})}
                />

                <div className="md:col-span-2">
                    <EditableField 
                        label="Adresse de Livraison par défaut" 
                        icon={Home} 
                        value={formData.address} 
                        isEditing={isEditing}
                        onChange={(val) => setFormData({...formData, address: val})}
                    />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

// Composant Champ
const EditableField = ({ label, icon: Icon, value, isEditing, onChange }) => {
    return (
        <motion.div 
            layout
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                isEditing 
                ? 'bg-white dark:bg-slate-700 border-purple-500 shadow-lg shadow-purple-500/10 ring-4 ring-purple-500/5' 
                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 hover:border-purple-200 dark:hover:border-slate-500'
            }`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isEditing ? 'bg-purple-100 text-purple-600' : 'bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-300 shadow-sm'
            }`}>
                <Icon size={20} />
            </div>
            
            <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
                {isEditing ? (
                    <input 
                        type="text" 
                        className="w-full font-bold text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-300"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ) : (
                    <div className="font-bold text-slate-800 dark:text-white truncate">{value || <span className="text-slate-300 italic">Non renseigné</span>}</div>
                )}
            </div>
        </motion.div>
    );
};

export default Settings;