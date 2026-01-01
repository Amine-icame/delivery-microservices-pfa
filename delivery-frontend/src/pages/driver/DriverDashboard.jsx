import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, MapPin, Wallet, CheckCircle, Clock, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { getDriverProfile, getDriverDeliveries } from '../../services/api';

const DriverDashboard = () => {
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(true);

  // Stats réelles (initialisées à 0)
  const [stats, setStats] = useState({
    totalAssigned: 0,
    totalPickedUp: 0,
    totalDelivered: 0,
    earnings: 0,
  });

  // Données pour le graphique (Dynamique)
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if(!token) return;
        
        // 1. Récupérer l'utilisateur
        const email = JSON.parse(atob(token.split('.')[1])).email;
        const driver = await getDriverProfile(email);
        setDriverName(driver.name);
        
        // 2. Récupérer TOUTES les livraisons depuis la BDD
        const deliveries = await getDriverDeliveries(driver.id);
        
        // 3. CALCULER LES STATS EN TEMPS RÉEL (Javascript Logic)
        const assigned = deliveries.filter(d => d.status === 'ASSIGNED').length;
        const pickedUp = deliveries.filter(d => d.status === 'PICKED_UP').length;
        const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;
        
        // Règle métier : On gagne 25 DH par livraison terminée
        const PRICE_PER_DELIVERY = 25; 

        setStats({
            totalAssigned: assigned,
            totalPickedUp: pickedUp,
            totalDelivered: delivered,
            earnings: delivered * PRICE_PER_DELIVERY, 
        });

        // 4. Préparer les données pour le graphique
        setChartData([
            { name: 'À récupérer', value: assigned, color: '#F59E0B' }, // Orange
            { name: 'En cours', value: pickedUp, color: '#3B82F6' },    // Bleu
            { name: 'Terminées', value: delivered, color: '#10B981' },  // Vert
        ]);

      } catch (e) {
        console.error("Erreur calcul stats:", e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500">Données en temps réel pour {driverName}.</p>
      </motion.div>

      {/* Cartes KPI (Connectées à la BDD) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Livré" value={stats.totalDelivered} icon={CheckCircle} color="emerald" />
        <StatCard title="Portefeuille" value={`${stats.earnings} DH`} icon={Wallet} color="purple" />
        <StatCard title="À récupérer" value={stats.totalAssigned} icon={Clock} color="orange" />
        <StatCard title="En transit" value={stats.totalPickedUp} icon={Truck} color="blue" />
      </div>

      {/* Graphique & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique de Répartition des Tâches */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
            <h3 className="font-bold text-slate-800 mb-6">État de vos courses</h3>
            
            {/* Si aucune donnée, on affiche un message */}
            {(stats.totalAssigned + stats.totalPickedUp + stats.totalDelivered) === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400">
                    Aucune donnée disponible
                </div>
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12, fontWeight: 'bold'}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                            <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>

        {/* Card Status (Reste statique car on ne gère pas le ON/OFFLINE en base pour l'instant) */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[50px] opacity-20"></div>
            <div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    SYSTÈME ACTIF
                </div>
                <h3 className="text-2xl font-bold mb-2">Performance</h3>
                <p className="text-slate-400 text-sm">
                    Vous avez réalisé <span className="text-white font-bold">{stats.totalDelivered}</span> livraisons au total.
                    Continuez comme ça !
                </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-700">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Taux de succès</span>
                    <span className="font-bold text-emerald-400">100%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 font-medium uppercase">{title}</div>
        </motion.div>
    );
};

export default DriverDashboard;