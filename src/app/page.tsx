import Link from "next/link";
import { Camera, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-16 animate-in fade-in zoom-in duration-700">
      <div className="space-y-6 max-w-3xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 dark:bg-brand-500/10 blur-3xl rounded-full -z-10 animate-float"></div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 dark:bg-indigo-500/10 blur-3xl rounded-full -z-10 animate-float" style={{ animationDelay: '1s'}}></div>
        
        <div className="inline-flex items-center justify-center p-5 bg-brand-100 dark:bg-brand-900/40 rounded-2xl mb-4 shadow-sm">
          <ShieldCheck className="h-10 w-10 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
          NITT <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-700 via-teal-600 to-indigo-700 dark:from-brand-400 dark:via-teal-300 dark:to-indigo-400">Scanner Viewport</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Automated vehicle entry and exit logging system using Optical Character Recognition for comprehensive campus security.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 w-full max-w-3xl px-4">
        <Link
          href="/scanner"
          className="group hover-card glass rounded-3xl p-8 flex flex-col items-center text-center space-y-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 relative overflow-hidden h-full block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl border-0 pointer-events-none"></div>
          <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-brand-500 dark:group-hover:bg-brand-600 transition-colors z-10 shadow-sm border border-slate-200 dark:border-slate-700">
            <Camera className="h-8 w-8 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white z-10">Terminal Scanner</h2>
          <p className="text-slate-500 dark:text-slate-400 z-10 leading-relaxed">Scan license plates and log new vehicle entries automatically with AI.</p>
        </Link>
        
        <Link
          href="/dashboard"
          className="group hover-card glass rounded-3xl p-8 flex flex-col items-center text-center space-y-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 relative overflow-hidden h-full block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl border-0 pointer-events-none"></div>
          <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-500 dark:group-hover:bg-indigo-600 transition-colors z-10 shadow-sm border border-slate-200 dark:border-slate-700">
            <LayoutDashboard className="h-8 w-8 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white z-10">Security Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 z-10 leading-relaxed">Monitor campus vehicles and view active security warnings in real-time.</p>
        </Link>
      </div>
    </div>
  );
}
