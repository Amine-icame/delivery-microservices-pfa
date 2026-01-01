import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, MapPin, ArrowLeft, Clock, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { trackOrderPublic } from '../../services/api';

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Pour forcer le rafraîchissement visuel si besoin
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // --- LOGIQUE TEMPS RÉEL (POLLING) ---
  useEffect(() => {
    let intervalId;

    const fetchTracking = async (isFirstLoad = false) => {
      try {
        const data = await trackOrderPublic(trackingNumber);
        if (!data) throw new Error("Commande introuvable");
        
        setOrder(data);
        setLastUpdate(new Date());
        
        // On enlève le chargement seulement au premier appel
        if (isFirstLoad) setLoading(false);
      } catch (err) {
        console.error(err);
        if (isFirstLoad) {
            setError("Numéro de suivi invalide ou commande introuvable.");
            setLoading(false);
        }
      }
    };

    // 1. Appel immédiat au chargement
    fetchTracking(true);

    // 2. Appel récurrent toutes les 5 secondes (Temps réel simulé)
    intervalId = setInterval(() => {
        fetchTracking(false);
    }, 5000);

    // Nettoyage quand on quitte la page
    return () => clearInterval(intervalId);
  }, [trackingNumber]);

  // Mapping des étapes (Logique Backend -> Logique Visuelle)
  const getStepStatus = (status) => {
    // 0: Validé, 1: Préparé/Assigné, 2: En Route, 3: Livré
    switch (status) {
        case 'CREATED':
        case 'PENDING': return 0;
        
        case 'ASSIGNED':
        case 'PREPARING': return 1;
        
        case 'PICKED_UP':
        case 'ON_WAY':
        case 'ON_THE_WAY': return 2;
        
        case 'DELIVERED': return 3;
        
        case 'CANCELLED': return -1;
        default: return 0;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Recherche du satellite...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 py-10 px-4 transition-colors duration-500">
      
      {/* Navbar Minimaliste */}
      <nav className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold">
            <ArrowLeft size={20}/> Retour
        </button>
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg"><Package className="text-white w-5 h-5"/></div>
            <span className="font-extrabold text-lg">DeliveryExpress</span>
        </div>
      </nav>

      {/* Contenu Principal */}
      <div className="max-w-4xl mx-auto">
        
        {error ? (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white p-10 rounded-3xl shadow-xl text-center border border-red-100">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={40}/>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Introuvable</h1>
                <p className="text-slate-500">{error}</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">Réessayer</button>
            </motion.div>
        ) : (
            <div className="grid md:grid-cols-3 gap-8">
                
                {/* --- COLONNE GAUCHE : INFOS --- */}
                <motion.div 
                    initial={{x:-50, opacity:0}} animate={{x:0, opacity:1}} 
                    className="md:col-span-2 space-y-6"
                >
                    {/* Carte Statut Principal */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                        
                        {/* Indicateur LIVE */}
                        <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            LIVE TRACKING
                        </div>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="relative z-10 mt-4">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">N° de Suivi</div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">{order.trackingNumber}</h1>
                                </div>
                            </div>

                            {/* Barre de Progression Visuelle */}
                            <ProgressBar currentStep={getStepStatus(order.status)} />
                            
                            <div className="mt-10 grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Date Commande</div>
                                    <div className="font-semibold text-slate-700 flex items-center gap-2">
                                        <Clock size={16} className="text-indigo-500"/>
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Destination</div>
                                    <div className="font-semibold text-slate-700 flex items-center gap-2">
                                        <MapPin size={16} className="text-indigo-500"/>
                                        {order.deliveryCity || "Casablanca"} {/* Fallback si ville vide */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Détails Commande */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Contenu du colis</h3>
                        <div className="space-y-4">
                            {order.orderItems && order.orderItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                            <Package size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">Produit ID #{item.productId}</div>
                                            <div className="text-xs text-slate-500">Quantité : {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-indigo-600">{item.price} MAD</div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                                <span className="font-bold text-slate-500">Total</span>
                                <span className="text-2xl font-extrabold text-slate-900">{order.totalAmount} MAD</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- COLONNE DROITE : TIMELINE VERTICALE --- */}
                <motion.div 
                    initial={{x:50, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.2}}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 h-fit sticky top-10"
                >
                    <h3 className="text-xl font-bold text-slate-900 mb-8">Historique</h3>
                    <Timeline currentStep={getStepStatus(order.status)} />
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">Dernière mise à jour : {lastUpdate.toLocaleTimeString()}</p>
                    </div>
                </motion.div>

            </div>
        )}
      </div>
    </div>
  );
};

// --- COMPOSANT PROGRESS BAR HORIZONTALE ---
const ProgressBar = ({ currentStep }) => {
    const progress = (currentStep / 3) * 100;
    
    // Texte dynamique selon l'étape
    const getStatusText = () => {
        if (currentStep === 0) return "En attente de traitement";
        if (currentStep === 1) return "Livreur assigné";
        if (currentStep === 2) return "En route vers vous";
        if (currentStep === 3) return "Livré avec succès";
        return "Statut inconnu";
    }

    return (
        <div className="relative mt-8 mb-4">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-indigo-600 animate-pulse">{getStatusText()}</span>
                <span className="text-sm font-bold text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                <span className={currentStep >= 0 ? "text-indigo-600" : ""}>Validé</span>
                <span className={currentStep >= 1 ? "text-indigo-600" : ""}>Pris en charge</span>
                <span className={currentStep >= 2 ? "text-indigo-600" : ""}>En route</span>
                <span className={currentStep >= 3 ? "text-emerald-600" : ""}>Livré</span>
            </div>
        </div>
    );
};

// --- COMPOSANT TIMELINE VERTICALE ---
const Timeline = ({ currentStep }) => {
    const steps = [
        { title: "Commande Validée", desc: "Votre commande a été reçue.", icon: Package },
        { title: "Pris en charge", desc: "Un livreur a récupéré le colis.", icon: Truck },
        { title: "En transit", desc: "En route vers votre adresse.", icon: MapPin },
        { title: "Livré", desc: "Colis remis au destinataire.", icon: CheckCircle },
    ];

    return (
        <div className="relative space-y-8 pl-4">
            {/* Ligne verticale */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>

            {steps.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;

                return (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className={`flex gap-4 ${isCompleted ? 'opacity-100' : 'opacity-40 grayscale'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-4 flex-shrink-0 z-10 bg-white transition-all duration-500 ${
                            isCompleted ? 'border-indigo-600 box-content scale-110' : 'border-slate-200'
                        } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}></div>
                        
                        <div className="-mt-1">
                            <h4 className={`font-bold text-sm ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-[150px]">{step.desc}</p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default TrackingPage;