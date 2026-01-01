import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Truck, ChevronRight, Check, AlertCircle, Home, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import api from '../../services/api';
// IMPORT TOAST
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('CUSTOMER');

  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '',  
    address: '',
    phone: '',   
    city: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        phone: formData.phone,
        city: formData.city || "Casablanca"
    };

    try {
        await api.post('/identity-service/auth/register', payload);
        
        // TOAST SUCCES
        toast.success(
            <div className="text-center">
                <div className="font-bold">Compte créé ! 🎉</div>
                <div className="text-sm">Bienvenue chez DeliveryExpress.</div>
            </div>,
            { duration: 4000 }
        );
        
        navigate('/login');
    } catch (err) {
        console.error(err);
        toast.error("Erreur d'inscription. Vérifiez vos informations.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 transition-colors duration-300">
      
      {/* CÔTÉ GAUCHE : FORMULAIRE */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative z-10"
      >
        <div className="mb-6">
           <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Rejoignez l'aventure. 🚀</h2>
           <p className="text-slate-500 dark:text-slate-400">Créez votre compte pour commencer.</p>
        </div>

        {/* SÉLECTEUR DE RÔLE */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6 relative">
            <motion.div 
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm"
                animate={{ x: role === 'CUSTOMER' ? 0 : '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
                onClick={() => setRole('CUSTOMER')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold z-10 transition-colors ${
                    role === 'CUSTOMER' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`}
            >
                <User size={18} /> Client
            </button>
            <button 
                onClick={() => setRole('DRIVER')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold z-10 transition-colors ${
                    role === 'DRIVER' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`}
            >
                <Truck size={18} /> Livreur
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
             <Input icon={User} type="text" name="firstName" placeholder="Prénom" value={formData.firstName} onChange={handleChange} />
             <Input icon={User} type="text" name="lastName" placeholder="Nom" value={formData.lastName} onChange={handleChange} />
          </div>
          
          <Input icon={Phone} type="tel" name="phone" placeholder="Numéro de téléphone" value={formData.phone} onChange={handleChange} />
          <Input icon={User} type="text" name="username" placeholder="Pseudo (Login)" value={formData.username} onChange={handleChange} />
          <Input icon={Mail} type="email" name="email" placeholder="Adresse Email" value={formData.email} onChange={handleChange} />
          
          <motion.div 
            initial={false} 
            animate={{ height: role === 'CUSTOMER' ? 'auto' : 0, opacity: role === 'CUSTOMER' ? 1 : 0, overflow: 'hidden' }}
          >
             <Input icon={Home} type="text" name="address" placeholder="Adresse complète" value={formData.address} onChange={handleChange} />
          </motion.div>
          
          <Input icon={Lock} type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} />
          
          <motion.div 
            initial={false} 
            animate={{ height: role === 'DRIVER' ? 'auto' : 0, opacity: role === 'DRIVER' ? 1 : 0, overflow: 'hidden' }}
          >
              <Input icon={MapPin} type="text" name="city" placeholder="Zone de travail (Ville)" value={formData.city} onChange={handleChange} />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Créer mon compte <ChevronRight size={20} /></>}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Déjà un compte ? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Se connecter</Link>
        </p>
      </motion.div>

      {/* CÔTÉ DROIT : VISUEL (Reste le même mais sombre ready) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[100px] opacity-20"></div>
        
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md mx-10 text-white shadow-2xl">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40"><Check className="text-white w-8 h-8" /></div>
            <h3 className="text-2xl font-bold mb-4">La plateforme n°1 au Maroc.</h3>
            <p className="text-blue-100 leading-relaxed mb-6">"Rejoignez notre réseau de plus de 10 000 livreurs et clients satisfaits."</p>
        </motion.div>
      </div>
    </div>
  );
};
export default Register;