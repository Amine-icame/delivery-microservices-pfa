import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, MapPin, Mail, Truck, CheckCircle, UserCheck, AlertCircle } from 'lucide-react';
import { getAllDrivers, deleteDriver, validateDriver } from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [activeTab, setActiveTab] = useState('active'); // 'active' ou 'pending'

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const data = await getAllDrivers();
            setDrivers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error("Erreur de chargement des livreurs.");
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id: id });
    };

    const confirmDelete = async () => {
        try {
            await deleteDriver(deleteModal.id);
            setDrivers(drivers.filter(d => d.id !== deleteModal.id));
            toast.success("Livreur supprimé.");
        } catch (e) {
            toast.error("Impossible de supprimer ce livreur.");
        }
    };

    const handleValidate = async (id) => {
        try {
            await validateDriver(id);
            // Mise à jour locale : on change le statut pour qu'il change d'onglet automatiquement
            setDrivers(drivers.map(d => d.id === id ? { ...d, status: 'AVAILABLE' } : d));
            toast.success("Livreur validé avec succès ! ✅");
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la validation.");
        }
    };

    // --- FILTRAGE ---
    const searchResults = drivers.filter(d =>
        (d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.city || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingDrivers = searchResults.filter(d => d.status === 'PENDING_APPROVAL');
    const activeDrivers = searchResults.filter(d => d.status !== 'PENDING_APPROVAL');

    const displayedDrivers = activeTab === 'pending' ? pendingDrivers : activeDrivers;

    return (
        <div className="space-y-6 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestion de la Flotte</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gérez les accès et les statuts des livreurs.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none w-full focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 dark:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- ONGLETS --- */}
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700">
                <TabButton
                    isActive={activeTab === 'active'}
                    onClick={() => setActiveTab('active')}
                    label="Livreurs Actifs"
                    count={activeDrivers.length}
                    icon={Truck}
                />
                <TabButton
                    isActive={activeTab === 'pending'}
                    onClick={() => setActiveTab('pending')}
                    label="En Attente"
                    count={pendingDrivers.length}
                    icon={UserCheck}
                    isAlert={pendingDrivers.length > 0}
                />
            </div>

            {/* Loading & Empty */}
            {loading && <div className="text-center py-10 text-slate-400">Chargement...</div>}

            {!loading && displayedDrivers.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        {activeTab === 'pending' ? <CheckCircle size={30}/> : <Truck size={30}/>}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        {activeTab === 'pending' ? "Aucune demande en attente." : "Aucun livreur trouvé."}
                    </p>
                </div>
            )}

            {/* --- GRILLE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {displayedDrivers.map((driver) => (
                        <motion.div
                            key={driver.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 relative group overflow-hidden hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {(driver.name || "?").charAt(0).toUpperCase()}
                                </div>

                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                    driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                                        driver.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                    {driver.status === 'PENDING_APPROVAL' ? 'En Attente' : driver.status}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{driver.name || "Nom Inconnu"}</h3>

                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <MapPin size={16} className="text-indigo-500"/> {driver.city || "Ville N/A"}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <Mail size={16} className="text-indigo-500"/> {driver.email}
                                </div>
                            </div>

                            {/* BARRE D'ACTION */}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">

                                {/* Bouton VALIDER */}
                                {driver.status === 'PENDING_APPROVAL' && (
                                    <button
                                        onClick={() => handleValidate(driver.id)}
                                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircle size={16}/> Valider
                                    </button>
                                )}

                                {/* Bouton SUPPRIMER */}
                                <button
                                    onClick={() => handleDeleteClick(driver.id)}
                                    className={`py-2.5 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2 ${driver.status !== 'PENDING_APPROVAL' ? 'w-full' : ''}`}
                                    title="Supprimer le compte"
                                >
                                    <Trash2 size={16}/> {driver.status !== 'PENDING_APPROVAL' && "Supprimer le compte"}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ ...deleteModal, open: false })}
                onConfirm={confirmDelete}
                title="Supprimer ce livreur ?"
                message="Êtes-vous sûr ? Cette action est irréversible."
                isDanger={true}
            />
        </div>
    );
};

// Composant Onglet
const TabButton = ({ isActive, onClick, label, count, icon: Icon, isAlert }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 pb-4 px-4 border-b-2 transition-all ${
            isActive
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
    >
        <Icon size={18} />
        <span className="font-bold">{label}</span>
        {count > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : isAlert ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
                {count}
            </span>
        )}
    </button>
);

export default AdminDrivers;