import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  ShieldCheck,
  Search,
  ChevronRight,
  Globe,
  Star,
  ArrowRight,
  Zap,
  CheckCircle2,
  MapPin,
  Box,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// --- COMPOSANT COMPTEUR (ANIMATION CHIFFRES) ---
const Counter = ({ from, to, suffix = "" }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: 2,
      onUpdate: (value) => setCount(Math.floor(value)),
    });
    return () => controls.stop();
  }, [from, to]);

  return (
    <span>
      {Number(count).toLocaleString()}
      {suffix}
    </span>
  );
};

// Fonction helper pour l'animation simple (car on n'a pas importé animate de framer-motion)
function animate(from, to, options) {
  let start = performance.now();
  let requestID;

  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / (options.duration * 1000), 1);
    const value = from + (to - from) * progress; // Linear easing
    options.onUpdate(value);
    if (progress < 1) requestID = requestAnimationFrame(update);
  };

  requestID = requestAnimationFrame(update);
  return { stop: () => cancelAnimationFrame(requestID) };
}

const Landing = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Parallaxe légère pour le Hero
  const yHero = useTransform(scrollY, [0, 600], [0, 160]);
  const opacityHero = useTransform(scrollY, [0, 320], [1, 0]);

  // Navbar background effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 14);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      navigate(`/tracking/${trackingNumber}`);
    }, 1000);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navItems = useMemo(
    () => [
      { label: "Services", id: "services" },
      { label: "Tracking", id: "tracking" },
      { label: "Entreprise", id: "entreprise" },
    ],
    []
  );

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#070A12] overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* ====== BACKDROP (ultra moderne) ====== */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(900px_circle_at_85%_15%,rgba(168,85,247,0.28),transparent_55%),radial-gradient(800px_circle_at_60%_90%,rgba(59,130,246,0.22),transparent_55%)]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        {/* Noise overlay (pure CSS trick) */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.45%22/%3E%3C/svg%3E')]" />
        {/* Floating blobs (Framer) */}
        <motion.div
          className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[90px]"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1], y: [0, 14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.55), transparent 60%)" }}
        />
        <motion.div
          className="absolute bottom-[-140px] right-[-90px] h-[520px] w-[520px] rounded-full blur-[100px]"
          animate={{ opacity: [0.22, 0.42, 0.22], scale: [1, 1.06, 1], x: [0, -18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle at 40% 40%, rgba(168,85,247,0.50), transparent 62%)" }}
        />
      </div>

      {/* ====== NAVBAR ====== */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/6 backdrop-blur-2xl border-b border-white/10 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-40 group-hover:opacity-70 transition" />
              <div className="relative bg-white/10 text-white p-2.5 rounded-2xl border border-white/15 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.55)] group-hover:scale-110 transition-transform duration-300">
                <Package size={22} strokeWidth={2.6} />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Delivery<span className="text-indigo-300">Express</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-sm font-semibold text-white/70">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-white/75 hover:text-white transition">
              Connexion
            </Link>
            <Link
              to="/register"
              className="relative inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-extrabold text-slate-900 bg-white hover:bg-white/95 transition-all shadow-[0_12px_30px_-18px_rgba(255,255,255,0.65)]"
            >
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-30" />
              <span className="relative">S&apos;inscrire</span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ====== HERO ====== */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-28 overflow-hidden">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="container mx-auto px-6 text-center relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/7 border border-white/10 shadow-sm mb-10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-65" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-extrabold text-white/70 uppercase tracking-wider">
              Réseau opérationnel 24/7 • SLA &amp; Tracking
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.06] mb-8"
          >
            Livrez plus vite. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300">
              Suivez mieux.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.26 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            La solution logistique nouvelle génération. Un tracking clair, des statuts fiables, des dashboards par rôle
            (client, livreur, admin) — le tout sécurisé par JWT via la Gateway.
          </motion.p>

          {/* Tracking Form (logique identique) */}
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, type: "spring", stiffness: 110, damping: 16 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-25 group-hover:opacity-45 transition duration-700" />

              <form
                onSubmit={handleTrack}
                className="relative bg-white/8 backdrop-blur-2xl p-2 rounded-3xl shadow-[0_30px_60px_-40px_rgba(0,0,0,0.8)] flex items-center md:p-3 border border-white/12"
              >
                <div className="hidden md:flex items-center justify-center w-14 h-14 bg-white/7 rounded-2xl text-white border border-white/10">
                  <Search size={26} />
                </div>

                <div className="flex-1 px-4 text-left">
                  <label className="block text-xs font-extrabold text-white/55 uppercase tracking-wider mb-1">
                    Suivre un colis
                  </label>
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-xl font-extrabold text-white placeholder-white/35"
                    placeholder="Entrez votre numéro (ex: TRK-89123)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    aria-label="Numéro de suivi"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="relative inline-flex items-center justify-center h-14 px-7 md:px-9 rounded-2xl font-extrabold text-base md:text-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed text-slate-900 bg-white hover:bg-white/95 shadow-[0_18px_45px_-28px_rgba(255,255,255,0.8)]"
                >
                  <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-30" />
                  <span className="relative flex items-center gap-3">
                    {isSearching ? (
                      <div className="w-6 h-6 border-[3px] border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        Suivre <ArrowRight size={20} />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Trust micro-copy */}
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm font-semibold text-white/65">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/6 border border-white/10 px-4 py-2 hover:bg-white/8 transition">
                <CheckCircle2 size={16} className="text-emerald-300" /> Suivi instantané
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/6 border border-white/10 px-4 py-2 hover:bg-white/8 transition">
                <ShieldCheck size={16} className="text-indigo-300" /> Sécurité JWT
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/6 border border-white/10 px-4 py-2 hover:bg-white/8 transition">
                <Globe size={16} className="text-violet-300" /> Réseau extensible
              </span>
            </div>

            {/* Logo strip (faux) */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs font-extrabold tracking-wider text-white/35">
              {["E-COM", "MARKET", "RETAIL", "FLEET", "SHOP", "EXPORT"].map((x) => (
                <div key={x} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  {x}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== STATS ====== */}
      <section className="py-12 border-y border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { label: "Colis livrés", val: 50000, suffix: "+" },
              { label: "Villes couvertes", val: 120, suffix: "" },
              { label: "Partenaires", val: 500, suffix: "+" },
              { label: "Satisfaction", val: 99, suffix: "%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                  <Counter from={0} to={stat.val} suffix={stat.suffix} />
                </div>
                <div className="text-xs font-extrabold text-white/45 uppercase tracking-[0.25em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SERVICES (BENTO ULTRA MODERNE) ====== */}
      <section id="services" className="py-28">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 border border-white/10 text-white/70 text-xs font-extrabold uppercase tracking-wider mb-6">
              <Zap size={16} className="text-amber-300" /> Suite logistique
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
              Une expérience <span className="text-indigo-300">premium</span> de bout en bout.
            </h2>
            <p className="text-lg text-white/65">
              Tracking public, dashboards par rôle, gestion produits/commandes/livraisons, et sécurité centralisée.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Big card */}
            <motion.div
              whileHover={{ y: -6 }}
              className="md:col-span-2 rounded-[2.5rem] p-10 md:p-12 border border-white/10 bg-white/6 backdrop-blur-2xl relative overflow-hidden"
            >
              <div className="absolute -top-28 -right-28 h-[380px] w-[380px] rounded-full blur-[90px] bg-indigo-500/35" />
              <div className="absolute -bottom-28 -left-28 h-[420px] w-[420px] rounded-full blur-[90px] bg-violet-500/25" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/6 border border-white/10 px-4 py-2 text-white/70 text-xs font-extrabold uppercase tracking-wider">
                      <Globe size={16} className="text-indigo-300" /> Couverture &amp; scalabilité
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-5 mb-3">
                      Expédiez partout,{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                        gardez le contrôle.
                      </span>
                    </h3>
                    <p className="text-white/65 text-lg max-w-xl">
                      Architecture microservices avec Gateway + Eureka + Config Server. Chaque service est autonome,
                      avec sa propre base de données : robuste, maintenable, prêt à évoluer.
                    </p>
                  </div>

                  <div className="hidden lg:flex flex-col gap-3">
                    {[
                      { icon: ShieldCheck, label: "JWT / RBAC" },
                      { icon: Clock, label: "Smart polling" },
                      { icon: Truck, label: "Workflow livraison" },
                    ].map((b) => (
                      <div
                        key={b.label}
                        className="inline-flex items-center gap-3 rounded-2xl bg-white/6 border border-white/10 px-4 py-3 text-white/75"
                      >
                        <b.icon size={18} className="text-indigo-200" />
                        <span className="text-sm font-extrabold">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: MapPin, title: "Suivi clair", desc: "Statuts synchronisés commande ↔ livraison." },
                    { icon: Box, title: "Gestion complète", desc: "Produits, commandes, livraisons, users." },
                    { icon: ShieldCheck, title: "Sécurité", desc: "Validation JWT à la Gateway, routes protégées." },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className="rounded-2xl bg-black/20 border border-white/10 p-6 hover:bg-black/30 transition"
                    >
                      <f.icon size={22} className="text-indigo-200 mb-3" />
                      <div className="text-white font-extrabold">{f.title}</div>
                      <div className="text-white/60 text-sm mt-1">{f.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-extrabold hover:bg-white/95 transition"
                  >
                    Démarrer <ChevronRight size={18} />
                  </Link>
                  <button
                    onClick={() => scrollToSection("tracking")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/7 border border-white/10 text-white px-6 py-3 font-extrabold hover:bg-white/10 transition"
                  >
                    Tester le tracking <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right column cards */}
            <div className="flex flex-col gap-6">
              <motion.div
                whileHover={{ y: -6 }}
                className="rounded-[2.5rem] p-9 border border-white/10 bg-white/6 backdrop-blur-2xl relative overflow-hidden"
              >
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl bg-amber-400/25" />
                <Zap size={34} className="text-amber-300 mb-6" />
                <h3 className="text-2xl font-extrabold text-white mb-2">Ultra rapide</h3>
                <p className="text-white/65">
                  Des flows optimisés : création de commande, tracking, assignation, mise à jour des statuts.
                </p>
                <div className="mt-6 flex items-center gap-2 text-white/70 text-sm font-extrabold">
                  <Clock size={16} className="text-amber-200" /> Mises à jour régulières (smart polling)
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                className="rounded-[2.5rem] p-9 border border-white/10 bg-gradient-to-br from-indigo-500/60 via-violet-500/50 to-pink-500/40 backdrop-blur-2xl shadow-[0_30px_80px_-55px_rgba(99,102,241,0.9)]"
              >
                <h3 className="text-3xl font-extrabold text-white mb-2">Prêt à livrer ?</h3>
                <p className="text-white/80 mb-6">
                  Créez votre compte et accédez à votre dashboard (client, livreur ou admin).
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-700 px-6 py-3 font-extrabold hover:bg-white/95 transition"
                >
                  Commencer <ChevronRight size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TRACKING / HOW IT WORKS ====== */}
      <section id="tracking" className="py-28 bg-white/5 border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-14">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 border border-white/10 text-white/70 text-xs font-extrabold uppercase tracking-wider mb-6">
                <Search size={16} className="text-indigo-300" /> Tracking
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Suivez chaque étape <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                  sans friction.
                </span>
              </h2>

              <p className="text-lg text-white/65 mb-8 leading-relaxed">
                Votre colis avance, votre interface s’actualise automatiquement. Les statuts sont cohérents entre
                commande et livraison, grâce à la synchronisation inter-services.
              </p>

              <div className="space-y-5">
                {[
                  { icon: CheckCircle2, txt: "Statuts normalisés (commande / livraison)" },
                  { icon: ShieldCheck, txt: "Accès protégé (JWT + routes sécurisées)" },
                  { icon: Truck, txt: "Dashboard livreur mobile-first" },
                ].map((it, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-200">
                      <it.icon size={18} />
                    </div>
                    <span className="font-extrabold text-white/85">{it.txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone / UI mock (same logic, just better visuals) */}
            <div className="flex-1 relative">
              <div className="absolute -top-6 -right-10 w-40 h-40 bg-amber-300/15 rounded-full blur-[70px]" />
              <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-violet-400/15 rounded-full blur-[90px]" />

              <motion.div
                whileHover={{ rotate: 0, y: -6 }}
                initial={{ rotate: -3, y: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 16 }}
                className="relative z-10 bg-white/6 backdrop-blur-2xl rounded-[3rem] p-4 shadow-[0_40px_90px_-60px_rgba(0,0,0,0.95)] border border-white/12 max-w-sm mx-auto"
              >
                <div className="bg-black/40 rounded-[2.5rem] h-[520px] overflow-hidden relative border border-white/10">
                  {/* Top bar */}
                  <div className="p-7 pt-10">
                    <div className="flex justify-between items-center text-white/70 mb-7">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10" />
                      <div className="w-20 h-8 rounded-full bg-white/10 border border-white/10" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/60 text-xs font-extrabold uppercase tracking-wider">En route</div>
                        <div className="text-4xl font-extrabold text-white mt-1 flex items-center gap-2">
                          24 <span className="text-white/55 text-base">min</span>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-indigo-500/20 border border-indigo-400/20 px-4 py-3 text-indigo-200 font-extrabold text-sm">
                        TRK ••••23
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white/6 backdrop-blur-2xl rounded-t-[2.2rem] -mt-4 h-full p-6 border-t border-white/10">
                    <div className="w-14 h-1.5 bg-white/15 rounded-full mx-auto mb-8" />

                    <div className="space-y-7">
                      {[
                        { active: true, title: "Commande créée", sub: "Statut : CREATED" },
                        { active: true, title: "Livraison assignée", sub: "Statut : ASSIGNED" },
                        { active: false, title: "Livrée", sub: "Statut : DELIVERED" },
                      ].map((row, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3.5 h-3.5 rounded-full ${
                                row.active ? "bg-indigo-300" : "bg-white/20"
                              }`}
                            />
                            {i !== 2 && <div className="w-0.5 h-10 bg-white/10 my-2" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-extrabold">{row.title}</div>
                            <div className="text-white/55 text-sm mt-1">{row.sub}</div>
                          </div>
                          <div className="text-white/35 text-xs font-extrabold mt-1">
                            {i === 0 ? "—" : i === 1 ? "12:40" : "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 rounded-2xl bg-black/25 border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white/70 text-xs font-extrabold uppercase tracking-wider">Sécurité</div>
                        <div className="inline-flex items-center gap-2 text-emerald-200 text-sm font-extrabold">
                          <ShieldCheck size={16} /> Token valide
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[62%] bg-gradient-to-r from-indigo-300 to-violet-300 rounded-full" />
                      </div>
                      <div className="mt-2 text-white/50 text-xs font-semibold">
                        Progression mise à jour automatiquement
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== ENTREPRISE ====== */}
      <section id="entreprise" className="py-28">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 border border-white/10 text-white/70 text-xs font-extrabold uppercase tracking-wider mb-6">
                <ShieldCheck size={16} className="text-indigo-300" /> Entreprise
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Une base solide pour{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                  scaler
                </span>{" "}
                sans douleur.
              </h2>
              <p className="text-lg text-white/65 leading-relaxed mb-8">
                Microservices indépendants, configurations centralisées, découverte de services et passerelle sécurisée.
                Idéal pour une application d’entreprise moderne (et un PFA “clean” 👌).
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Sécurité centralisée",
                    desc: "JWT validé à la Gateway + contrôle d’accès par rôle.",
                  },
                  {
                    icon: Zap,
                    title: "Évolutif",
                    desc: "Scalabilité par service (order/delivery/product...).",
                  },
                  {
                    icon: Clock,
                    title: "Opérations stables",
                    desc: "Gestion des erreurs, timeouts, cohérence des statuts.",
                  },
                  {
                    icon: Star,
                    title: "UX moderne",
                    desc: "React + Tailwind, dashboards par rôle, tracking simple.",
                  },
                ].map((x) => (
                  <div
                    key={x.title}
                    className="rounded-3xl bg-white/6 border border-white/10 p-6 hover:bg-white/8 transition"
                  >
                    <x.icon size={22} className="text-indigo-200 mb-3" />
                    <div className="text-white font-extrabold">{x.title}</div>
                    <div className="text-white/60 text-sm mt-1">{x.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-extrabold hover:bg-white/95 transition"
                >
                  Lancer le projet <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/7 border border-white/10 text-white px-6 py-3 font-extrabold hover:bg-white/10 transition"
                >
                  Accéder au dashboard <ChevronRight size={18} />
                </Link>
              </div>
            </div>

            {/* Mini “console” card */}
            <div className="rounded-[2.75rem] border border-white/10 bg-white/6 backdrop-blur-2xl overflow-hidden relative">
              <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-[90px] bg-indigo-500/25" />
              <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-[100px] bg-pink-500/20" />

              <div className="relative p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <div className="text-white font-extrabold text-xl">Control Center</div>
                  <div className="inline-flex items-center gap-2 text-emerald-200 text-sm font-extrabold">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" /> Live
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { icon: Package, label: "Orders", value: "1,248" },
                    { icon: Truck, label: "Deliveries", value: "832" },
                    { icon: Globe, label: "Cities", value: "120" },
                    { icon: ShieldCheck, label: "Secure", value: "JWT" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-3xl bg-black/25 border border-white/10 p-6">
                      <m.icon size={20} className="text-indigo-200" />
                      <div className="mt-3 text-white/60 text-xs font-extrabold uppercase tracking-wider">
                        {m.label}
                      </div>
                      <div className="mt-1 text-white text-2xl font-extrabold">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-black/25 border border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-extrabold">État des services</div>
                    <div className="text-white/50 text-xs font-extrabold uppercase tracking-wider">Eureka</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { name: "gateway-service", ok: true },
                      { name: "order-service", ok: true },
                      { name: "delivery-service", ok: true },
                      { name: "product-service", ok: true },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
                      >
                        <div className="text-white/80 font-extrabold text-sm">{s.name}</div>
                        <div
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                            s.ok
                              ? "text-emerald-200 border-emerald-300/20 bg-emerald-400/10"
                              : "text-red-200 border-red-300/20 bg-red-400/10"
                          }`}
                        >
                          {s.ok ? "UP" : "DOWN"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 text-white/45 text-sm">
                    Tip : ajoute plus tard Resilience4j (timeout/retry/circuit breaker) + observabilité.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-black/40 border-t border-white/10">
        <div className="container mx-auto px-6 pt-16 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 border-b border-white/10 pb-10 mb-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-35" />
                <div className="relative bg-white/10 p-2.5 rounded-2xl border border-white/15">
                  <Package size={22} className="text-white" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white">DeliveryExpress</div>
                <div className="text-white/55 text-sm font-semibold">Plateforme de gestion & tracking</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm font-semibold text-white/55">
              {["À propos", "Carrières", "Blog", "Contact"].map((x) => (
                <a key={x} href="#" className="hover:text-white transition">
                  {x}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left text-white/45 text-sm font-semibold">
              &copy; 2025 DeliveryExpress • Fait avec passion pour le PFA.
            </div>
            <div className="inline-flex items-center gap-2 text-white/50 text-sm font-semibold">
              <Star size={16} className="text-amber-200" />
              UI moderne • Microservices • Sécurisé JWT
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
