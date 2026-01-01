import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, Clock, CheckCircle, Loader, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getCustomerProfile, getOrdersByCustomer } from '../../services/api';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);

  // --- 1. LA FONCTION MANQUANTE (AJOUTÉE ICI) ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const email = JSON.parse(atob(token.split('.')[1])).email;
        const profile = await getCustomerProfile(email);
        setCustomerName(profile.firstName);

        const ordersResponse = await getOrdersByCustomer(profile.id);

        // Sécurité : On s'assure que c'est un tableau
        const orders = Array.isArray(ordersResponse) ? ordersResponse : [];

        const delivered = orders.filter(o => o.status === 'DELIVERED').length;
        const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
        const spent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
            totalOrders: orders.length,
            activeOrders: active,
            deliveredOrders: delivered,
            totalSpent: spent
        });

        // Trier et prendre les 4 dernières
        const sortedOrders = [...orders].sort((a, b) => b.id - a.id);
        setRecentOrders(sortedOrders.slice(0, 4));

        // Données Graphique
        const chartData = sortedOrders.slice(0, 7).reverse().map((o) => ({
            name: `Cmd ${o.id}`,
            montant: o.totalAmount
        }));
        setChartData(chartData);

      } catch (err) {
        console.error("Erreur dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><Loader className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Titre */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vue d'ensemble</h1>
          <p className="text-slate-500 mt-1">Ravi de vous revoir, {customerName}.</p>
        </div>
        <button onClick={() => navigate('/client/orders/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition transform hover:-translate-y-1">
          + Nouvelle Commande
        </button>
      </motion.div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Commandes" value={stats.totalOrders} icon={Package} color="blue" />
        <StatCard title="En Cours" value={stats.activeOrders} icon={Clock} color="orange" />
        <StatCard title="Livrées" value={stats.deliveredOrders} icon={CheckCircle} color="emerald" />
        <StatCard title="Total Dépensé" value={`${stats.totalSpent.toLocaleString()} DH`} icon={TrendingUp} color="purple" />
      </div>

      {/* Graphique & Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graphique */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6">Évolution des dépenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="montant" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMontant)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Commandes Récentes */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Commandes Récentes</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {recentOrders.length === 0 ? <p className="text-slate-400 text-center py-10">Aucune commande</p> : 
            recentOrders.map((order, i) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white dark:bg-slate-800 group-hover:shadow-sm transition">
                    <Package size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-800 truncate">Commande #{order.id}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        {/* Utilisation de la fonction corrigée */}
                        <Clock size={10}/> {formatDate(order.orderDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{order.totalAmount} Dh</div>
                    <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/client/orders')} className="w-full mt-4 py-3 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center justify-center gap-1">
            Voir tout l'historique <ChevronRight size={16}/>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
    let color = 'bg-slate-100 text-slate-600';
    if (status === 'DELIVERED') color = 'bg-emerald-100 text-emerald-600';
    else if (status === 'CANCELLED') color = 'bg-red-100 text-red-600';
    else if (status === 'ON_WAY' || status === 'PICKED_UP') color = 'bg-blue-100 text-blue-600';
    else if (status === 'ASSIGNED') color = 'bg-orange-100 text-orange-600';
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{status}</span>;
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}><Icon size={24} /></div>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-400 font-medium mt-1">{title}</div>
    </motion.div>
  );
};

export default DashboardHome;