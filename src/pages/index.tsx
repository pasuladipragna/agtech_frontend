import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Cpu, Radio, ScanEye, Navigation, Droplets, BarChart3, Shield, Users,
  ChevronRight, CheckCircle2, Star, Zap, Globe2, ArrowRight, Sparkles,
  Bot, Leaf, Wifi, Battery, Camera, MapPin, TrendingUp, Award
} from "lucide-react";

const FEATURES = [
  {
    icon: Radio,
    title: "Live Rover Remote Control",
    desc: "Real-time MQTT/WebSocket joystick control with < 80ms command latency. Full 4WD differential steering, camera tilt, and emergency stop.",
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-800/40"
  },
  {
    icon: ScanEye,
    title: "AI Crop Disease Inspection",
    desc: "OpenRouter Vision AI (GPT-4V / Claude Vision) analyzes rover camera frames for 50+ crop diseases with > 94% accuracy and generates treatment plans.",
    color: "text-cyan-400",
    bg: "bg-cyan-950/60",
    border: "border-cyan-800/40"
  },
  {
    icon: Navigation,
    title: "Autonomous GPS Waypoint Missions",
    desc: "Plan and execute multi-waypoint field missions. The rover auto-navigates lanes using GPS bearing calculations with real-time progress tracking.",
    color: "text-amber-400",
    bg: "bg-amber-950/60",
    border: "border-amber-800/40"
  },
  {
    icon: Droplets,
    title: "Precision Solenoid Spraying",
    desc: "Target-specific solenoid pulse spraying triggered only at AI-flagged GPS zones, reducing chemical use by up to 70% vs. blanket application.",
    color: "text-blue-400",
    bg: "bg-blue-950/60",
    border: "border-blue-800/40"
  },
  {
    icon: BarChart3,
    title: "Farm Analytics & Reporting",
    desc: "Comprehensive seasonal reports covering spray volume, crop health scores, mission history, and AI detection trends. Export as PDF.",
    color: "text-purple-400",
    bg: "bg-purple-950/60",
    border: "border-purple-800/40"
  },
  {
    icon: Shield,
    title: "Role-Based Access & Audit Trail",
    desc: "Farmer and Admin roles with JWT auth, encrypted credentials, and a full command-level audit log for compliance and traceability.",
    color: "text-red-400",
    bg: "bg-red-950/60",
    border: "border-red-800/40"
  }
];

const STATS = [
  { label: "Rover Command Latency", value: "< 80ms", icon: Wifi },
  { label: "AI Detection Accuracy", value: "94.6%", icon: Bot },
  { label: "Chemical Reduction", value: "Up to 70%", icon: Leaf },
  { label: "Hectares Supported", value: "1,000+", icon: Globe2 },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    desc: "Perfect for single-farm operations",
    features: [
      "1 Rover Fleet",
      "10 Hectare Field Mapping",
      "AI Vision Scan (50/month)",
      "Basic Analytics Dashboard",
      "Email Support"
    ],
    cta: "Start Free Trial",
    highlight: false,
    badge: null
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    desc: "For growing agricultural operations",
    features: [
      "Up to 5 Rovers",
      "Unlimited Hectares",
      "AI Vision Scans (Unlimited)",
      "Autonomous GPS Missions",
      "Precision Spray Scheduling",
      "Advanced Analytics & PDF Reports",
      "Priority Support"
    ],
    cta: "Get Started",
    highlight: true,
    badge: "Most Popular"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agribusiness & cooperatives",
    features: [
      "Unlimited Rovers",
      "Multi-Farm Management",
      "Custom AI Model Fine-tuning",
      "On-Premise Deployment Option",
      "API Access & Webhooks",
      "Dedicated Account Manager",
      "SLA 99.9% Uptime Guarantee"
    ],
    cta: "Contact Sales",
    highlight: false,
    badge: "Enterprise"
  }
];

const TESTIMONIALS = [
  {
    name: "Dr. Rajesh Patel",
    role: "Farm Manager · SunValley Orchards",
    quote: "The AI disease detection caught early blight 2 weeks before our agronomist would have spotted it. We saved 40% of the tomato crop that season.",
    avatar: "RP",
    stars: 5
  },
  {
    name: "Maria Santos",
    role: "AgriTech Coordinator · GreenFields Cooperative",
    quote: "Deploying precision spraying across 18 farms cut our pesticide costs by 65%. The ROI in the first 3 months was incredible.",
    avatar: "MS",
    stars: 5
  },
  {
    name: "James Okafor",
    role: "CEO · AgroSmart Nigeria Ltd",
    quote: "The autonomous waypoint missions let one operator manage 3 rovers simultaneously. We're covering 300% more field area with the same team.",
    avatar: "JO",
    stars: 5
  }
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, isLoading]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>AgriTech Rover | Smart Precision Agriculture SaaS Platform</title>
        <meta name="description" content="AI-powered autonomous rover platform for precision agriculture. Real-time crop disease detection, GPS waypoint missions, and precision spraying — all from your browser." />
      </Head>

      <div className="min-h-screen bg-[#050908] text-gray-100 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ──────────── NAVIGATION ──────────── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050908]/95 backdrop-blur-xl border-b border-emerald-900/30 shadow-xl shadow-black/50" : "bg-transparent"}`}>
          <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="font-black text-lg text-white tracking-wide">
                  AGRI<span className="text-emerald-400">TECH</span>
                  <span className="ml-2 px-2 py-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full align-middle">
                    SaaS
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 -mt-0.5 hidden sm:block">Precision Agriculture Platform</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-sm text-gray-400">
              <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors font-medium">
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 glow-emerald flex items-center gap-1.5"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </nav>

        {/* ──────────── HERO ──────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }} />

          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by OpenRouter AI Vision + MQTT Rover HAL
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Precision Agriculture
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400 bg-clip-text text-transparent">
                Powered by AI Rovers
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Deploy autonomous 4WD rovers to inspect, monitor, and protect your crops using
              computer vision AI. Reduce pesticide use by up to 70% with precision GPS-targeted spraying.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/login"
                id="hero-cta-primary"
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-bold text-base transition-all shadow-xl shadow-emerald-900/50 glow-emerald flex items-center justify-center gap-2"
              >
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                id="hero-cta-secondary"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Camera className="w-5 h-5 text-emerald-400" />
                See Live Demo
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="glass-panel p-4 rounded-xl border border-emerald-900/30 text-center">
                    <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <div className="text-xl font-black text-white">{stat.value}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────── HOW IT WORKS ──────────── */}
        <section id="how-it-works" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-4">
                <Zap className="w-3.5 h-3.5" /> Simple 3-Step Workflow
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">From Farm to Dashboard</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Deploy your rover, let AI do the inspection, receive actionable reports — all from your browser.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Navigation,
                  title: "Plan Your Mission",
                  desc: "Drop waypoints on the interactive field map. The rover calculates optimal lane paths for full coverage inspection.",
                  color: "text-emerald-400",
                  bg: "from-emerald-950/80"
                },
                {
                  step: "02",
                  icon: Bot,
                  title: "AI Scans & Detects",
                  desc: "As the rover drives each lane, the camera streams to OpenRouter Vision AI which detects diseases, pests, and stress with > 94% confidence.",
                  color: "text-cyan-400",
                  bg: "from-cyan-950/80"
                },
                {
                  step: "03",
                  icon: Droplets,
                  title: "Precision Spray & Report",
                  desc: "The rover auto-triggers solenoid spraying only at flagged GPS coordinates. A full analytics report is generated instantly.",
                  color: "text-amber-400",
                  bg: "from-amber-950/80"
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`relative glass-panel p-8 rounded-2xl border border-emerald-900/30 bg-gradient-to-b ${item.bg} to-transparent glass-panel-hover`}>
                    <div className="absolute top-6 right-6 text-6xl font-black text-white/5 select-none">{item.step}</div>
                    <div className={`w-12 h-12 rounded-xl bg-black/40 border border-emerald-900/40 flex items-center justify-center mb-6`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────── FEATURES ──────────── */}
        <section id="features" className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-4">
                <Award className="w-3.5 h-3.5" /> Full Platform Features
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything You Need</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">A complete precision agriculture operating system — from rover hardware to AI intelligence to farm reporting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className={`${feat.bg} glass-panel-hover p-6 rounded-2xl border ${feat.border} transition-all duration-300 group cursor-default`}>
                    <div className={`w-11 h-11 rounded-xl bg-black/40 border ${feat.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────── HARDWARE SPEC ──────────── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="glass-panel rounded-3xl border border-emerald-900/40 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 lg:p-14">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-6">
                    <Cpu className="w-3.5 h-3.5" /> 4WD Rover Hardware Specs
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                    Built for the Field.<br />
                    <span className="text-emerald-400">Controlled from Anywhere.</span>
                  </h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    The rover hardware is purpose-built for agricultural environments with weatherproof enclosures, solar-assisted charging, and a 8-hour operational runtime per charge.
                  </p>

                  <div className="space-y-3">
                    {[
                      { label: "Processing", val: "Raspberry Pi 5 / Jetson Nano", icon: Cpu },
                      { label: "Camera", val: "12MP Pi Camera Module 3", icon: Camera },
                      { label: "GPS", val: "NEO-M8N High-Precision Module (±1.5m)", icon: MapPin },
                      { label: "Battery", val: "48V 20Ah LiFePO4 + Solar Charging", icon: Battery },
                      { label: "Communication", val: "4G LTE + WiFi Dual Band MQTT Bridge", icon: Wifi },
                      { label: "Spray Tank", val: "20L Tank + Dual Solenoid Nozzles", icon: Droplets }
                    ].map((spec, i) => {
                      const Icon = spec.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-emerald-900/20">
                          <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-xs text-gray-400 w-24 flex-shrink-0">{spec.label}</span>
                          <span className="text-xs text-white font-semibold">{spec.val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-emerald-950/40 to-black/60 flex items-center justify-center p-10 border-l border-emerald-900/30 min-h-64">
                  {/* Stylized rover visualization */}
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-4 rounded-full border border-emerald-500/30 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-28 rounded-2xl bg-gradient-to-b from-emerald-900/80 to-black/80 border border-emerald-700/50 flex flex-col items-center justify-center shadow-2xl shadow-emerald-900/50">
                        <Cpu className="w-10 h-10 text-emerald-400 mb-2" />
                        <div className="text-xs font-mono text-emerald-300 font-bold">ROVER-4WD-01</div>
                        <div className="text-[9px] text-gray-500 mt-0.5">HAL v2.0 Active</div>
                        <div className="flex items-center gap-1.5 mt-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] text-emerald-400 font-mono">ONLINE</span>
                        </div>
                      </div>
                    </div>

                    {/* Orbit indicators */}
                    {[
                      { label: "GPS", pos: "top-0 left-1/2 -translate-x-1/2", color: "text-amber-400 border-amber-800/40 bg-amber-950/60" },
                      { label: "AI", pos: "right-0 top-1/2 -translate-y-1/2", color: "text-cyan-400 border-cyan-800/40 bg-cyan-950/60" },
                      { label: "MQTT", pos: "bottom-0 left-1/2 -translate-x-1/2", color: "text-purple-400 border-purple-800/40 bg-purple-950/60" },
                      { label: "CAM", pos: "left-0 top-1/2 -translate-y-1/2", color: "text-pink-400 border-pink-800/40 bg-pink-950/60" },
                    ].map((orb, i) => (
                      <div key={i} className={`absolute ${orb.pos} px-2 py-1 rounded-lg border text-[9px] font-bold font-mono ${orb.color}`}>
                        {orb.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── TESTIMONIALS ──────────── */}
        <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-400 text-xs font-semibold mb-4">
                <Star className="w-3.5 h-3.5" /> Trusted by Farmers Worldwide
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Real Results, Real Farms</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="glass-panel p-7 rounded-2xl border border-emerald-900/30 glass-panel-hover flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed italic mb-6">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-emerald-900/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-700 to-green-500 flex items-center justify-center text-black font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{t.name}</div>
                      <div className="text-[11px] text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── PRICING ──────────── */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-400 text-xs font-semibold mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> Transparent Pricing
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Choose Your Plan</h2>
              <p className="text-gray-400 max-w-xl mx-auto">All plans include a 14-day free trial. No credit card required.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan, i) => (
                <div
                  key={i}
                  className={`relative glass-panel p-8 rounded-2xl flex flex-col transition-all duration-300 ${
                    plan.highlight
                      ? "border-2 border-emerald-500/60 shadow-2xl shadow-emerald-900/40 scale-[1.03]"
                      : "border border-emerald-900/30 glass-panel-hover"
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                      plan.highlight
                        ? "bg-gradient-to-r from-emerald-600 to-green-500 text-black"
                        : "bg-red-950 text-red-400 border border-red-800"
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-lg font-bold text-white mb-1">{plan.name}</div>
                    <div className="text-xs text-gray-500 mb-4">{plan.desc}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-gray-500 text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    id={`pricing-cta-${plan.name.toLowerCase()}`}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black shadow-lg shadow-emerald-900/40 glow-emerald"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── CTA BANNER ──────────── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative glass-panel rounded-3xl border border-emerald-900/40 p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-green-400 to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-cyan-950/20" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/50">
                  <Leaf className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to Transform Your Farm?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of farmers using AI-powered rovers to protect their crops, reduce costs, and increase yields.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/login"
                    id="cta-banner-primary"
                    className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-bold text-base transition-all shadow-xl shadow-emerald-900/50 glow-emerald flex items-center justify-center gap-2"
                  >
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login?demo=true"
                    id="cta-banner-demo"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5 text-emerald-400" />
                    Try Demo Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── FOOTER ──────────── */}
        <footer className="border-t border-emerald-900/30 py-12 px-6 bg-black/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-black" />
                  </div>
                  <span className="font-black text-white">AGRITECH ROVER</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Precision agriculture powered by AI, autonomous robotics, and real-time telemetry.
                </p>
              </div>

              {[
                { title: "Platform", links: ["Features", "How It Works", "Pricing", "Roadmap"] },
                { title: "Modules", links: ["Rover Control", "AI Vision", "GPS Missions", "Precision Spraying"] },
                { title: "Company", links: ["About Us", "Contact Sales", "Privacy Policy", "Terms of Service"] }
              ].map((col, i) => (
                <div key={i}>
                  <div className="font-semibold text-white text-sm mb-4">{col.title}</div>
                  <ul className="space-y-2">
                    {col.links.map((l, j) => (
                      <li key={j}>
                        <a href="#" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-emerald-900/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">© 2026 AgriTech Rover Platform. All rights reserved.</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational · API v1.0
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
