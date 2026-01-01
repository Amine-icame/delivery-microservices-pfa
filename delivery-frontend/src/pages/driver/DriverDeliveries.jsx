import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Package, CheckCircle, Clock, Loader, AlertTriangle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { getDriverProfile, getDriverDeliveries, updateDeliveryStatus } from '../../services/api';
// IMPORTS AJOUTÉS
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const DriverDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState(null);
  
  // State pour la modale
  const [modalConfig, setModalConfig] = useState({ open: false, id: null, status: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.email; 

        const driver = await getDriverProfile(userEmail);
        setDriverInfo(driver);

        const myDeliveries = await getDriverDeliveries(driver.id);
        setDeliveries(myDeliveries);

      } catch (err) {
        console.error("Erreur chargement:", err);
        toast.error("Impossible de charger vos courses.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- LOGIQUE MODALE ---
  const requestStatusChange = (id, currentStatus) => {
      // On détermine le prochain statut
      let nextStatus = "";
      let message = "";
      let title = "";

      switch (currentStatus) {
        case "ASSIGNED":
            nextStatus = "PICKED_UP";
            title = "Confirmer la récupération ?";
            message = "Avez-vous bien récupéré le colis chez le client ?";
            break;
        case "PICKED_UP":
            nextStatus = "ON_THE_WAY";
            title = "Démarrer la course ?";
            message = "Vous dirigez-vous vers le destinataire ?";
            break;
        case "ON_THE_WAY":
            nextStatus = "DELIVERED";
            title = "Valider la livraison ?";
            message = "Confirmez-vous avoir remis le colis au destinataire ?";
            break;
        default: return;
      }

      // Ouvre la modale
      setModalConfig({ open: true, id, status: nextStatus, title, message });
  };

  // --- ACTION RÉELLE ---
  const confirmStatusChange = async () => {
    const { id, status } = modalConfig;
    
    // Optimistic UI
    const oldDeliveries = [...deliveries];
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: status } : d));

    try {
        await updateDeliveryStatus(id, status);
        toast.success(
            <div className="flex flex-col">
                <span className="font-bold">Statut mis à jour !</span>
                <span className="text-xs">Le client a été notifié.</span>
            </div>
        );
    } catch (err) {
        toast.error("Erreur lors de la mise à jour.");
        setDeliveries(oldDeliveries); // Rollback
    }
  };

  // --- HELPER STYLES ---
  const getStatusStyles = (status) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'ASSIGNED': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 'PICKED_UP': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
        case 'ON_THE_WAY': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={40}/></div>;

  const activeDeliveries = deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Courses</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Bonjour {driverInfo?.name}, prêt à livrer ? 🚛</p>
        </div>
        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
            {activeDeliveries} active(s)
        </div>
      </div>

      {deliveries.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Navigation size={30}/></div>
              <p>Aucune course assignée pour le moment.</p>
          </div>
      )}

      {deliveries.map((delivery) => {
        const isFinished = delivery.status === 'DELIVERED' || delivery.status === 'CANCELLED';
        const badgeStyle = getStatusStyles(delivery.status);

        return (
            <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={delivery.id}
            className={`p-6 rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all ${
                isFinished 
                ? 'bg-slate-50 border-slate-100 opacity-70 dark:bg-slate-800/50 dark:border-slate-700' 
                : 'bg-white border-blue-50 shadow-blue-100 ring-1 ring-blue-100 dark:bg-slate-800 dark:border-blue-900/30 dark:shadow-none dark:ring-blue-900/20'
            }`}
            >
            {/* Header Carte */}
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyle}`}>
                    {delivery.status.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                    <Package size={14}/> Colis #{delivery.orderId}
                </span>
            </div>

            {/* Adresse */}
            <div className="flex items-start gap-4 mb-8">
                <div className={`p-3 rounded-2xl ${
                    isFinished 
                    ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' 
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50'
                }`}>
                    <MapPin size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{delivery.deliveryAddress}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Destination</p>
                </div>
            </div>

            {/* --- BOUTONS D'ACTION --- */}
            
            {/* Cas 1 : PENDING */}
            {delivery.status === 'PENDING' && (
                <div className="text-center text-yellow-600 font-bold bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 py-3 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="inline mr-2" size={18}/> En attente de validation
                </div>
            )}

            {/* Cas 2 : ASSIGNED -> PICKED_UP */}
            {delivery.status === 'ASSIGNED' && (
                <button 
                    onClick={() => requestStatusChange(delivery.id, delivery.status)}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                    📦 Confirmer la récupération
                </button>
            )}

            {/* Cas 3 : PICKED_UP -> ON_THE_WAY */}
            {delivery.status === 'PICKED_UP' && (
                <button 
                    onClick={() => requestStatusChange(delivery.id, delivery.status)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                    🚚 Je suis en route
                </button>
            )}

            {/* Cas 4 : ON_THE_WAY -> DELIVERED */}
            {delivery.status === 'ON_THE_WAY' && (
                <button 
                    onClick={() => requestStatusChange(delivery.id, delivery.status)}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                    ✅ Valider la livraison
                </button>
            )}

            {/* Cas 5 : FINI */}
            {delivery.status === 'DELIVERED' && (
                <div className="w-full py-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle size={20} /> Course terminée
                </div>
            )}

            </motion.div>
        );
      })}

      {/* --- MODALE --- */}
      <ConfirmModal 
        isOpen={modalConfig.open}
        onClose={() => setModalConfig({ ...modalConfig, open: false })}
        onConfirm={confirmStatusChange}
        title={modalConfig.title}
        message={modalConfig.message}
        isDanger={false} // Action positive (Bleu/Vert)
      />
    </div>
  );
};

export default DriverDeliveries;