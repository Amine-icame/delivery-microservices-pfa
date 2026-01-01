import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Fond flouté */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Carte Modale */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
          >
            {/* Header Décoratif */}
            <div className={`h-24 flex items-center justify-center ${isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <AlertTriangle size={32} />
                </div>
            </div>

            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95 ${
                            isDanger 
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                        }`}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
            
            {/* Bouton fermer coin */}
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-white/50 rounded-full transition">
                <X size={20}/>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;