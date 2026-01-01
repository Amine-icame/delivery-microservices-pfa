import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, Search, Loader, AlertCircle, XCircle, Trash2 } from 'lucide-react';
import { getCustomerProfile, getOrdersByCustomer, deleteOrder } from '../../services/api';
// --- IMPORTS AJOUTÉS ---
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE MODALE ---
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });

  // 1. Chargement des données
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const email = JSON.parse(atob(token.split('.')[1])).email;
        const profile = await getCustomerProfile(email);

        const data = await getOrdersByCustomer(profile.id);
        
        if (Array.isArray(data)) {
            const sortedData = data.sort((a, b) => b.id - a.id);
            setOrders(sortedData);
        } else {
            setOrders([]);
        }

      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger vos commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- LOGIQUE D'ANNULATION ---
  const handleCancelClick = (id) => {
      setCancelModal({ open: true, id: id });
  };

  const confirmCancel = async () => {
      try {
          // On suppose que l'API deleteOrder existe (sinon updateStatus vers CANCELLED)
          await deleteOrder(cancelModal.id); 
          setOrders(orders.filter(o => o.id !== cancelModal.id));
          toast.success("Commande annulée avec succès.");
      } catch (e) {
          toast.error("Erreur lors de l'annulation.");
      }
  };

  // 2. Gestion des couleurs de statut
  const getStatusStyle = (status) => {
    switch (status) {
      case 'DELIVERED': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle, label: 'Livré' };
      case 'ON_WAY': 
      case 'ON_THE_WAY': 
      case 'PICKED_UP': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: Truck, label: 'En route' };
      case 'ASSIGNED': return { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', icon: Package, label: 'Pris en charge' };
      case 'CREATED': 
      case 'PENDING': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', icon: Clock, label: 'En préparation' };
      case 'CANCELLED': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: XCircle, label: 'Annulé' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600', icon: Package, label: status };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => 
    order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600 dark:text-blue-400" size={40}/></div>;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Page */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Commandes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Suivez l'état d'avancement de vos achats.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Rechercher par N° Suivi..." 
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 w-full md:w-64 transition-all text-slate-700 dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Liste Vide */}
      {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Package size={30}/>
              </div>
              <p className="text-slate-500 dark:text-slate-400">Aucune commande trouvée.</p>
          </div>
      )}

      {/* Grille des Commandes */}
      <div className="grid gap-4">
        {filteredOrders.map((order, i) => {
          const style = getStatusStyle(order.status);
          const StatusIcon = style.icon;
          // On peut annuler seulement si ce n'est pas encore livré ou pris en charge
          const canCancel = ['CREATED', 'PENDING'].includes(order.status);

          return (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all cursor-pointer group"
            >
              {/* Gauche : Icone + Info Principale */}
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`p-4 rounded-2xl ${style.bg} ${style.text} border ${style.border}`}>
                  <StatusIcon size={28} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {order.trackingNumber}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                    <Clock size={14} className="text-slate-400"/> 
                    {formatDate(order.orderDate)} 
                    <span className="text-slate-300 dark:text-slate-600">•</span> 
                    {order.orderItems ? order.orderItems.length : 0} article(s)
                  </div>
                </div>
              </div>

              {/* Droite : Prix + Badge + Bouton */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 dark:border-slate-700 pt-4 md:pt-0">
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white text-lg">{order.totalAmount ? order.totalAmount.toLocaleString() : 0} <span className="text-sm font-normal text-slate-500">MAD</span></div>
                  <div className="text-xs text-slate-400 font-medium">Total TTC</div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide ${style.bg} ${style.text} border ${style.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text', 'bg')}`}></div>
                        {style.label}
                    </span>
                    
                    {/* BOUTON ANNULER (Seulement si possible) */}
                    {canCancel && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleCancelClick(order.id); }}
                            className="text-sm font-semibold text-red-400 hover:text-red-600 transition flex items-center gap-1"
                        >
                            <Trash2 size={14}/> Annuler
                        </button>
                    )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- MODALE DE CONFIRMATION --- */}
      <ConfirmModal 
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ ...cancelModal, open: false })}
        onConfirm={confirmCancel}
        title="Annuler la commande ?"
        message={`Voulez-vous vraiment annuler la commande #${cancelModal.id} ? Cette action est irréversible.`}
        isDanger={true}
      />
    </div>
  );
};

// Petit helper pour l'icône chevron
const ChevronRightIcon = ({size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default MyOrders;