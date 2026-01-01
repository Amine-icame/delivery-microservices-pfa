import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, X, Trash2, Package, Truck } from 'lucide-react';
// On importe les nouvelles fonctions de suppression
import { getAllDeliveries, getAllDrivers, assignDriverToDelivery, deleteDelivery } from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminOrders = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [delData, driverData] = await Promise.all([getAllDeliveries(), getAllDrivers()]);
        // Tri : PENDING en premier
        const sorted = (Array.isArray(delData) ? delData : []).sort((a, b) => (a.status === 'PENDING' ? -1 : 1));
        setDeliveries(sorted);
        setDrivers(Array.isArray(driverData) ? driverData : []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

 const handleAssign = async (driverId) => {
    if(!selectedDelivery) return;
    try {
        await assignDriverToDelivery(selectedDelivery.id, driverId);
        toast.success(
            <div>
                <span className="font-bold">Succès ! 🚀</span>
                <div className="text-sm">Le livreur a été assigné.</div>
            </div>
        );
        setSelectedDelivery(null);
        loadData();
    } catch (e) {
        toast.error("Erreur lors de l'assignation.");
    }
  };

  // --- 4. LOGIQUE DE SUPPRESSION (MODALE) ---
  
  // A. Ouvrir la modale
  const handleDeleteClick = (id) => {
      setDeleteModal({ open: true, id: id });
  };

  // B. Confirmer la suppression
  const confirmDelete = async () => {
      try {
          await deleteDelivery(deleteModal.id);
          setDeliveries(deliveries.filter(d => d.id !== deleteModal.id));
          toast.success("Livraison supprimée.");
      } catch(e) {
          toast.error("Impossible de supprimer cette livraison.");
      }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Tableau des Livraisons</h1>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="p-5 text-sm font-bold text-slate-500">ID</th>
                    <th className="p-5 text-sm font-bold text-slate-500">Adresse</th>
                    <th className="p-5 text-sm font-bold text-slate-500">Statut</th>
                    <th className="p-5 text-sm font-bold text-slate-500">Livreur Assigné</th>
                    <th className="p-5 text-sm font-bold text-slate-500 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {deliveries.map(delivery => (
                    <tr key={delivery.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="p-5 font-mono font-bold text-slate-700 dark:text-slate-300">
                            #{delivery.orderId}
                        </td>
                        <td className="p-5 text-slate-600 dark:text-slate-300">{delivery.deliveryAddress}</td>
                        <td className="p-5">
                            <StatusBadge status={delivery.status} />
                        </td>
                        <td className="p-5 text-slate-600 dark:text-slate-400">
                            {delivery.driverId ? (
                                <span className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                                    <Truck size={16}/> Driver #{delivery.driverId}
                                </span>
                            ) : (
                                <span className="text-slate-300 italic">-- En attente --</span>
                            )}
                        </td>
                        <td className="p-5 text-right flex justify-end gap-2">
                            {delivery.status === 'PENDING' && (
                                <button 
                                    onClick={() => setSelectedDelivery(delivery)}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-md"
                                >
                                    <UserPlus size={16}/> Assigner
                                </button>
                            )}
                            <button 
                                onClick={() => handleDeleteClick(delivery.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer la livraison"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODALE ASSIGNATION (Reste la même qu'avant) */}
      {selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Choisir un livreur</h3>
                      <button onClick={() => setSelectedDelivery(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X/></button>
                  </div>
                  
                  <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                      {drivers.filter(d => d.status === 'AVAILABLE').length === 0 && <p className="text-red-500 text-center font-medium">Aucun livreur disponible.</p>}

                      {drivers.map(driver => (
                          <div key={driver.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition" onClick={() => handleAssign(driver.id)}>
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                      {(driver.name || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-800 dark:text-white">{driver.name || "Nom inconnu"}</div>
                                      <div className="text-xs text-slate-400">{driver.city || "Ville N/A"}</div>
                                  </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {driver.status}
                              </span>
                          </div>
                      ))}
                  </div>
              </motion.div>
          </div>
      )}

      {/* --- 5. MODALE DE SUPPRESSION --- */}
      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={confirmDelete}
        title="Supprimer la livraison ?"
        message={`Voulez-vous supprimer la livraison #${deleteModal.id} ? Cette action est irréversible.`}
        isDanger={true}
      />
    </div>
  );
};

const StatusBadge = ({ status }) => {
    let color = 'bg-slate-100 text-slate-600';
    if (status === 'PENDING') color = 'bg-yellow-100 text-yellow-700';
    if (status === 'ASSIGNED') color = 'bg-orange-100 text-orange-700';
    if (status === 'DELIVERED') color = 'bg-emerald-100 text-emerald-700';
    return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${color}`}>{status}</span>;
};

export default AdminOrders;