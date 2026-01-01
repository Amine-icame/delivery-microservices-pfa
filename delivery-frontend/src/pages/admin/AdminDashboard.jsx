import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Truck, DollarSign, Activity, PieChart as PieIcon, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Sector
} from 'recharts';
import { getAllCustomers, getAllDrivers, getAllOrders } from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ customers: 0, drivers: 0, orders: 0, revenue: 0 });
    const [revenueData, setRevenueData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0); // Pour l'animation du Donut

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customers, drivers, ordersRaw] = await Promise.all([
                    getAllCustomers(),
                    getAllDrivers(),
                    getAllOrders()
                ]);

                const orders = Array.isArray(ordersRaw) ? ordersRaw : [];

                // 1. CALCULS KPI
                const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

                setStats({
                    customers: Array.isArray(customers) ? customers.length : 0,
                    drivers: Array.isArray(drivers) ? drivers.length : 0,
                    orders: orders.length,
                    revenue: totalRevenue
                });

                // 2. DATA REVENUS (AREA CHART)
                const revenueMap = {};
                orders.forEach(order => {
                    if (order.orderDate) {
                        const date = new Date(order.orderDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                        revenueMap[date] = (revenueMap[date] || 0) + (order.totalAmount || 0);
                    }
                });

                // Remplir les jours vides pour avoir une belle courbe
                const chartData = Object.keys(revenueMap).map(date => ({
                    name: date,
                    value: revenueMap[date]
                })).slice(-7);
                setRevenueData(chartData);

                // 3. DATA STATUTS (DONUT)
                const statusMap = { 'DELIVERED': 0, 'ON_WAY': 0, 'PENDING': 0, 'CANCELLED': 0 };
                orders.forEach(order => {
                    const s = order.status;
                    if (s === 'DELIVERED') statusMap['DELIVERED']++;
                    else if (s === 'CANCELLED') statusMap['CANCELLED']++;
                    else if (s === 'ON_WAY' || s === 'PICKED_UP') statusMap['ON_WAY']++;
                    else statusMap['PENDING']++;
                });

                setStatusData([
                    { name: 'Livrées', value: statusMap['DELIVERED'], color: '#10B981' }, // Vert Néon
                    { name: 'En cours', value: statusMap['ON_WAY'], color: '#3B82F6' },   // Bleu Electrique
                    { name: 'En attente', value: statusMap['PENDING'], color: '#F59E0B' }, // Orange
                    { name: 'Annulées', value: statusMap['CANCELLED'], color: '#EF4444' }  // Rouge
                ].filter(item => item.value > 0)); // On cache les segments vides pour le look

            } catch (err) {
                console.error("Erreur stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="space-y-8 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Vue d'ensemble
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Performance en temps réel.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    LIVE DATA
                </div>
            </motion.div>

            {/* --- CARTES KPI GLOW --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Clients" value={stats.customers} icon={Users} color="blue" delay={0} />
                <KpiCard title="Flotte Livreurs" value={stats.drivers} icon={Truck} color="violet" delay={0.1} />
                <KpiCard title="Total Commandes" value={stats.orders} icon={ShoppingBag} color="orange" delay={0.2} />
                <KpiCard title="Revenu Global" value={`${stats.revenue.toLocaleString()} DH`} icon={DollarSign} color="emerald" delay={0.3} isMoney />
            </div>

            {/* --- GRAPHIQUES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* GRAPHIQUE 1 : REVENUS (NEON AREA CHART) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
                >
                    {/* Fond Glow subtil */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <TrendingUp size={24} className="text-indigo-500"/> Revenus
                            </h3>
                            <p className="text-sm text-slate-400">7 derniers jours</p>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Activity size={20}/>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fill: '#94a3b8', fontSize: 12}}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fill: '#94a3b8', fontSize: 12}}
                                        tickFormatter={(value) => `${value/1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        filter="url(#glow)" // Effet glow si supporté, sinon fallback
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-medium">Données insuffisantes</div>
                        )}
                    </div>
                </motion.div>

                {/* GRAPHIQUE 2 : STATUTS (FUTURISTIC DONUT) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden"
                >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2 relative z-10">
                        <PieIcon size={24} className="text-purple-500"/> Distribution
                    </h3>

                    <div className="flex-1 h-64 relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={statusData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    cornerRadius={10}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Compteur central animé */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-4xl font-extrabold text-slate-800 dark:text-white">{stats.orders}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</div>
                        </div>
                    </div>

                    {/* Légende Custom */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {statusData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- CUSTOM COMPONENTS (LE SECRET DU DESIGN) ---

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">{label}</p>
                <p className="text-xl font-bold flex items-center gap-1">
                    {payload[0].value.toLocaleString()} <span className="text-sm font-normal text-slate-400">DH</span>
                </p>
            </div>
        );
    }
    return null;
};

// Animation du secteur actif du Donut (Il grossit)
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                startAngle={startAngle} endAngle={endAngle}
                fill={fill} cornerRadius={10}
            />
            <Sector
                cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
                innerRadius={innerRadius - 6} outerRadius={innerRadius - 4}
                fill={fill}
            />
        </g>
    );
};

const KpiCard = ({ title, value, icon: Icon, color, delay, isMoney }) => {
    const gradients = {
        blue: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
        violet: 'from-violet-500 to-purple-600 shadow-purple-500/30',
        orange: 'from-orange-400 to-pink-500 shadow-orange-500/30',
        emerald: 'from-emerald-400 to-teal-600 shadow-emerald-500/30',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {value}
                    </div>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* Petit indicateur de croissance fake pour le style */}
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-lg">
                <ArrowUpRight size={14}/> +12% cette semaine
            </div>
        </motion.div>
    );
};

export default AdminDashboard;