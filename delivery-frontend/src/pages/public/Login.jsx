import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import api from '../../services/api';
import toast from 'react-hot-toast'; // <--- Pour les belles alertes

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Petit délai artificiel pour l'effet "Traitement" (optionnel, fait plus pro)
    // await new Promise(resolve => setTimeout(resolve, 800)); 

    try {
        const res = await api.post('/identity-service/auth/token', formData);
        const token = res.data;
        localStorage.setItem('token', token);
        
        // Décoder le token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role; 
        
        toast.success(`Bienvenue, ${payload.sub} ! 👋`);

        // Redirection
        switch(userRole) {
            case 'ADMIN': navigate('/admin/dashboard'); break;
            case 'DRIVER': navigate('/driver/dashboard'); break;
            case 'CUSTOMER': navigate('/client/dashboard'); break;
            default: navigate('/');
        }

    } catch (err) {
        console.error(err);
        toast.error("Identifiants incorrects. Veuillez réessayer.");
        // Petit effet de vibration (shake) pourrait être ajouté ici
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* --- CÔTÉ GAUCHE : VISUEL ARTISTIQUE --- */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px] opacity-30 translate-y-1/3 -translate-x-1/4"></div>

        {/* Top: Retour */}
        <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition group">
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition"><ArrowLeft size={16} /></div>
                Retour à l'accueil
            </Link>
        </div>

        {/* Center: Carte Flottante (Glassmorphism) */}
        <div className="relative z-10 flex flex-col justify-center h-full">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm mx-auto transform hover:scale-105 transition-transform duration-500"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/40">
                        <ShieldCheck size={24} className="text-white"/>
                    </div>
                    <div>
                        <div className="font-bold text-lg">Sécurité Maximale</div>
                        <div className="text-xs text-slate-300">Données chiffrées de bout en bout</div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                    <div className="h-2 bg-white/10 rounded-full w-full"></div>
                    <div className="h-2 bg-white/10 rounded-full w-5/6"></div>
                </div>
            </motion.div>
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10 text-xs text-slate-500">
            © 2025 DeliveryExpress. Secure Login System.
        </div>
      </div>

      {/* --- CÔTÉ DROIT : FORMULAIRE --- */}
      <div className="w-full lg:w-7/12 bg-slate-50 flex items-center justify-center p-6 relative">
        
        {/* Décoration mobile (Cercle flou) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full blur-[80px] opacity-40 lg:hidden"></div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }} 
            className="w-full max-w-md bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white relative z-10"
        >
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-sm transform rotate-3">
                    <LogIn size={32} />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bon retour !</h2>
                <p className="text-slate-500 mt-3 text-lg">Entrez vos identifiants pour continuer.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5">Identifiant</label>
                    <Input 
                        icon={Mail} 
                        type="text" 
                        name="username" 
                        placeholder="Email ou Pseudo" 
                        value={formData.username} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Mot de passe</label>
                        <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-500">Oublié ?</a>
                    </div>
                    <Input 
                        icon={Lock} 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={handleChange} 
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>Se connecter <ArrowRightIcon size={20} /></>
                    )}
                </motion.button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500">
                    Nouveau ici ? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Créer un compte</Link>
                </p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

// Petite icône flèche custom
const ArrowRightIcon = ({size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default Login;