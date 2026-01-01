import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Search, User, Mail, Phone, MapPin } from 'lucide-react';
import { getAllCustomers, deleteCustomer } from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
          const data = await getAllCustomers();
          setCustomers(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };
    loadCustomers();
  }, []);

  // Etape A : Ouvrir la modale
  const handleDeleteClick = (id) => {
    setDeleteModal({ open: true, id: id });
  };

  // Etape B : L'action réelle (passée à la modale)
  const confirmDelete = async () => {
    try {
        await deleteCustomer(deleteModal.id);
        setCustomers(customers.filter(c => c.id !== deleteModal.id));
        toast.success("Client supprimé avec succès !");
    } catch (e) { 
        console.error(e);
        toast.error("Erreur : Impossible de supprimer ce client."); 
    }
  };

  const filtered = customers.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Clients</h1>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
                type="text" placeholder="Rechercher..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="p-5 text-sm font-bold text-slate-500">Identité</th>
                    <th className="p-5 text-sm font-bold text-slate-500">Contact</th>
                    <th className="p-5 text-sm font-bold text-slate-500">Adresse</th>
                    <th className="p-5 text-sm font-bold text-slate-500 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {client.firstName.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white">{client.firstName} {client.lastName}</div>
                                    <div className="text-xs text-slate-400">ID: {client.id}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-5">
                            <div className="flex flex-col gap-1 text-sm text-slate-500">
                                <div className="flex items-center gap-2"><Mail size={14}/> {client.email}</div>
                                <div className="flex items-center gap-2"><Phone size={14}/> {client.phoneNumber || 'N/A'}</div>
                            </div>
                        </td>
                        <td className="p-5 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-2"><MapPin size={14}/> {client.address || 'Non renseignée'}</div>
                        </td>
                        <td className="p-5 text-right">
                            <button 
                                onClick={() => handleDeleteClick(client.id)} 
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" 
                                title="Supprimer"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={confirmDelete}
        title="Supprimer ce client ?"
        message={`Êtes-vous sûr de vouloir supprimer le client ID ${deleteModal.id} ? Cette action est irréversible.`}
        isDanger={true}
      />
    </div>
  );
};

export default AdminCustomers;