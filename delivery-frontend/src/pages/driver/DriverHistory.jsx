import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, Search, Filter, Clock, Package, CheckCircle } from 'lucide-react';
import { getDriverProfile, getDriverDeliveries } from '../../services/api';

const DriverHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const email = JSON.parse(atob(token.split('.')[1])).email;
        const driver = await getDriverProfile(email);
        const allDeliveries = await getDriverDeliveries(driver.id);
        
        // On ne garde que les livraisons TERMINÉES (DELIVERED)
        // Et on simule une date car on n'a pas de colonne "date" en BDD (pour l'instant)
        const finished = allDeliveries
            .filter(d => d.status === 'DELIVERED')
            .map(d => ({
                ...d,
                date: "24 Dec 2025", // Simulé pour le design
                time: "14:30",       // Simulé
                earnings: 25         // Simulé (25 DH par course)
            }))
            .reverse(); // Les plus récentes en haut

        setHistory(finished);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredHistory = history.filter(item => 
    item.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderId.toString().includes(searchTerm)
  );

  const totalEarnings = history.length * 25;

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      
      {/* --- HEADER AVEC TOTAL --- */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h1 className="text-3xl font-bold mb-1">Historique</h1>
                <p className="text-slate-400">Retrouvez toutes vos courses terminées.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl">
                <div className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Total Gagné</div>
                <div className="text-3xl font-bold flex items-center gap-1">
                    {totalEarnings} <span className="text-sm font-normal text-slate-400">DH</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- BARRE DE RECHERCHE FLOTTANTE --- */}
      <div className="sticky top-0 z-20 -mt-4">
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
            <div className="pl-3 text-slate-400"><Search size={20}/></div>
            <input 
                type="text" 
                placeholder="Rechercher une adresse ou ID..." 
                className="flex-1 outline-none text-slate-700 font-medium bg-transparent py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                <Filter size={20}/>
            </button>
        </div>
      </div>

      {/* --- LISTE TIMELINE (Le Oufff) --- */}
      <div className="space-y-4">
        {loading ? (
            <div className="text-center py-10 text-slate-400">Chargement de l'historique...</div>
        ) : filteredHistory.length === 0 ? (
            <div className="text-center py-20 text-slate-400">Aucune course terminée.</div>
        ) : (
            filteredHistory.map((item, index) => (
                <HistoryCard 
                    key={item.id} 
                    item={item} 
                    expanded={expandedId === item.id} 
                    onClick={() => toggleExpand(item.id)}
                    index={index}
                />
            ))
        )}
      </div>
    </div>
  );
};

// Composant Carte Individuelle
const HistoryCard = ({ item, expanded, onClick, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={`bg-white rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                expanded ? 'shadow-xl border-blue-200 ring-4 ring-blue-50' : 'shadow-sm border-slate-100 hover:border-blue-100'
            }`}
        >
            {/* Partie Visible (Résumé) */}
            <div className="p-5 flex items-center gap-4">
                {/* Date Box */}
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-bold text-sm ${
                    expanded ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'
                }`}>
                    <span>24</span>
                    <span className="text-xs uppercase opacity-80">DEC</span>
                </div>

                {/* Info Centrale */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={10}/> LIVRÉ
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{item.orderId}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{item.deliveryAddress}</h3>
                </div>

                {/* Prix & Toggle */}
                <div className="text-right">
                    <div className="font-bold text-lg text-emerald-600">+{item.earnings} DH</div>
                    <div className="text-slate-400 flex justify-end mt-1">
                        {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </div>
                </div>
            </div>

            {/* Partie Cachée (Détails Ticket) */}
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50 border-t border-slate-100"
                    >
                        <div className="p-6 grid grid-cols-2 gap-6 relative">
                            {/* Décoration Ticket (Ligne pointillée) */}
                            <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-slate-200"></div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Heure</div>
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <Clock size={16} className="text-blue-500"/> {item.time}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Distance</div>
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <MapPin size={16} className="text-blue-500"/> 4.2 km (Est.)
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Type de colis</div>
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <Package size={16} className="text-blue-500"/> Standard
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Preuve</div>
                                    <div className="text-blue-600 text-xs font-bold underline cursor-pointer">Voir la signature</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DriverHistory;