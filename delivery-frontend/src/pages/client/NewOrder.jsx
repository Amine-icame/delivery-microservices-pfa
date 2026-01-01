import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, ShoppingCart, Check, Loader, AlertCircle, Search, X } from 'lucide-react';
import { getProducts, createOrder, getCustomerProfile } from '../../services/api';
import { useNavigate } from 'react-router-dom';
// --- 1. IMPORTS AJOUTÉS ---
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const NewOrder = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);

  // --- 2. STATE MODALE ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // --- INITIALISATION ---
  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const profile = await getCustomerProfile(payload.email);
        setCurrentCustomerId(profile.id);

        const productData = await getProducts();
        setProducts(Array.isArray(productData) ? productData : []);

      } catch (error) {
        console.error(error);
        toast.error("Erreur de chargement du catalogue.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [navigate]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- PANIER ---
  const addToCart = (product) => {
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) newCart[productId]--;
      else delete newCart[productId];
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find(p => p.id === parseInt(id));
    return total + (product ? product.price * qty : 0);
  }, 0);

  // --- 3. LOGIQUE DE VALIDATION (MODALE) ---
  
  // Étape A : Vérification avant ouverture modale
  const handlePreCheckout = () => {
    if (!currentCustomerId) {
        toast.error("Erreur d'identification. Reconnectez-vous.");
        return;
    }
    if (totalItems === 0) {
        toast.error("Votre panier est vide.");
        return;
    }
    setIsConfirmOpen(true); // Ouvre la modale
  };

  // Étape B : Envoi réel après confirmation
  const finalizeOrder = async () => {
    setSubmitting(true);
    try {
      const orderPayload = {
        customerId: currentCustomerId,
        items: Object.entries(cart).map(([id, qty]) => ({
          productId: parseInt(id),
          quantity: qty
        }))
      };

      const res = await createOrder(orderPayload);
      
      // Toast Succès avec Tracking
      toast.success(
        <div className="flex flex-col">
            <span className="font-bold">Commande validée ! 🎉</span>
            <span className="text-xs mt-1">Tracking: {res.trackingNumber}</span>
        </div>,
        { duration: 5000 }
      );
      
      navigate('/client/orders'); 
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la commande.");
    } finally {
      setSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600 dark:text-blue-400" size={40}/></div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 pb-4">
      
      {/* --- GAUCHE : CATALOGUE --- */}
      <div className="flex-1 flex flex-col min-h-0"> 
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Catalogue</h2>
            
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Chercher un produit..." 
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all shadow-sm text-slate-700 dark:text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 h-full flex flex-col items-center justify-center">
                    <Search className="mx-auto text-slate-300 mb-2" size={40}/>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun produit trouvé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- DROITE : PANIER --- */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col h-full overflow-hidden"
      >
        <div className="p-6 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
              <ShoppingCart size={20} />
            </div>
            <h3 className="font-bold text-lg">Mon Panier</h3>
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{totalItems}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {Object.keys(cart).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 opacity-50">
              <Package size={48} strokeWidth={1} />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            Object.entries(cart).map(([id, qty]) => {
              const product = products.find(p => p.id === parseInt(id));
              if (!product) return null;
              return (
                <motion.div layout key={id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-slate-600 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{product.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{product.price} MAD x {qty}</div>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <button onClick={() => removeFromCart(id)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"><Minus size={14}/></button>
                    <span className="text-sm font-bold w-4 text-center dark:text-white">{qty}</span>
                    <button onClick={() => addToCart(product)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"><Plus size={14}/></button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total à payer</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalPrice.toLocaleString()} <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">MAD</span></span>
          </div>
          
          {/* BOUTON DECLENCHEUR MODALE */}
          <button 
            disabled={totalItems === 0 || submitting}
            onClick={handlePreCheckout}
            className="w-full bg-slate-900 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {submitting ? <Loader className="animate-spin" size={20}/> : <>Confirmer <Check size={20}/></>}
          </button>
        </div>
      </motion.div>

      {/* --- 4. MODALE DE CONFIRMATION --- */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={finalizeOrder}
        title="Confirmer la commande ?"
        message={`Vous allez commander ${totalItems} articles pour un total de ${totalPrice.toLocaleString()} MAD.`}
        isDanger={false} // Style Bleu (Confirmation positive)
      />
    </div>
  );
};

const ProductCard = ({ product, onAdd }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col group cursor-pointer hover:shadow-md transition-all"
    onClick={onAdd}
  >
    <div className="h-40 bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl mb-4 flex items-center justify-center group-hover:from-blue-50 group-hover:to-cyan-50 dark:group-hover:from-slate-600 dark:group-hover:to-slate-500 transition-colors relative overflow-hidden">
      <Package size={48} className="text-slate-300 dark:text-slate-500 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors duration-300" strokeWidth={1.5} />
    </div>
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-slate-800 dark:text-white text-lg line-clamp-1">{product.name}</h3>
    </div>
    <p className="text-xs text-slate-400 mb-4 line-clamp-2 h-8">{product.description || "Aucune description"}</p>
    <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg">{product.price} MAD</span>
        <button className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors">
            <Plus size={20} />
        </button>
    </div>
  </motion.div>
);

export default NewOrder;