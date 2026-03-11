import Link from "next/link";
import { Camera, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in zoom-in duration-500">
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center justify-center p-4 bg-brand-100 dark:bg-brand-900/40 rounded-full mb-4">
          <ShieldCheck className="h-12 w-12 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          NITT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-teal-400">Security Scanner</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          Automated vehicle entry and exit logging system using Optical Character Recognition for NITT campus security.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        <Link
          href="/scanner"
          className="group hover-card glass rounded-2xl p-8 flex flex-col items-center text-center space-y-4 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
        >
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
            <Camera className="h-8 w-8 text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Scanner</h2>
          <p className="text-slate-500 dark:text-slate-400">Scan license plates and log new vehicle entries automatically.</p>
        </Link>
        <Link
          href="/dashboard"
          className="group hover-card glass rounded-2xl p-8 flex flex-col items-center text-center space-y-4 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
        >
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
            <LayoutDashboard className="h-8 w-8 text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Monitor campus vehicles and view active security warnings.</p>
        </Link>
      </div>
    </div>
  );
}
