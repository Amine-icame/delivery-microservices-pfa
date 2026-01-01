import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, X, Package, DollarSign, Layers } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/api';
// --- 1. IMPORTS AJOUTÉS ---
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Gestion Modale Ajout/Modif
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', quantityAvailable: '' });

  // --- 2. STATE MODALE SUPPRESSION ---
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
    } catch (e) { 
        console.error(e);
        toast.error("Impossible de charger les produits.");
    } finally { 
        setLoading(false); 
    }
  };

  // --- 3. LOGIQUE SUPPRESSION ---
  
  // A. Ouvrir la modale
  const handleDeleteClick = (id) => {
      setDeleteModal({ open: true, id: id });
  };

  // B. Confirmer la suppression
  const confirmDelete = async () => {
      try {
          await deleteProduct(deleteModal.id);
          setProducts(products.filter(p => p.id !== deleteModal.id));
          toast.success("Produit supprimé du catalogue.");
      } catch(e) {
          console.error(e);
          toast.error("Erreur lors de la suppression.");
      }
  };

  // --- 4. GESTION AJOUT / MODIF AVEC TOASTS ---
  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
        setFormData({ 
            name: product.name, 
            description: product.description, 
            price: product.price, 
            quantityAvailable: product.quantityAvailable 
        });
    } else {
        setFormData({ name: '', description: '', price: '', quantityAvailable: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (editingProduct) {
            await updateProduct(editingProduct.id, formData);
            toast.success("Produit modifié avec succès !");
        } else {
            await addProduct(formData);
            toast.success("Nouveau produit ajouté !");
        }
        setIsModalOpen(false);
        loadProducts(); 
    } catch (e) {
        console.error(e);
        toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const filtered = products.filter(p => 
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Catalogue Produits</h1>
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                    type="text" placeholder="Rechercher..." 
                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none w-full focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-500/30">
                <Plus size={20}/> Ajouter
            </button>
        </div>
      </div>

      {/* Grid Produits */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
            {filtered.map((product) => (
                <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-xl transition-all"
                >
                    {/* Placeholder Image Stylé */}
                    <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center relative overflow-hidden">
                        <Package size={64} className="text-indigo-300 dark:text-slate-500 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-sm">
                            Stock: {product.quantityAvailable}
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">{product.name}</h3>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{product.price} DH</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-8">{product.description || "Aucune description"}</p>
                        
                        <div className="flex gap-2">
                            <button onClick={() => openModal(product)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2">
                                <Edit3 size={16}/> Modifier
                            </button>
                            {/* Clic sur Supprimer ouvre la modale */}
                            <button onClick={() => handleDeleteClick(product.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* --- MODALE D'AJOUT / MODIF --- */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                          {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                      </h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition"><X size={20}/></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom du produit</label>
                          <div className="relative">
                              <Package className="absolute left-3 top-3 text-slate-400" size={18}/>
                              <input type="text" required className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium" 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prix (DH)</label>
                              <div className="relative">
                                  <DollarSign className="absolute left-3 top-3 text-slate-400" size={18}/>
                                  <input type="number" required className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium" 
                                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock</label>
                              <div className="relative">
                                  <Layers className="absolute left-3 top-3 text-slate-400" size={18}/>
                                  <input type="number" required className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium" 
                                    value={formData.quantityAvailable} onChange={e => setFormData({...formData, quantityAvailable: e.target.value})} />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                          <textarea className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium h-24 resize-none"
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                          ></textarea>
                      </div>

                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">
                          {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
                      </button>
                  </form>
              </motion.div>
          </div>
      )}

      {/* --- 5. MODALE DE SUPPRESSION --- */}
      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={confirmDelete}
        title="Supprimer ce produit ?"
        message="Êtes-vous sûr ? Il sera définitivement retiré du catalogue."
        isDanger={true}
      />
    </div>
  );
};

export default AdminProducts;