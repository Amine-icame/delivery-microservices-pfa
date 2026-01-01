import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ icon: Icon, type, placeholder, value, onChange, name }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <motion.input
        whileFocus={{ scale: 1.01, borderColor: "#3B82F6", boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)" }}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-300 font-medium"
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;