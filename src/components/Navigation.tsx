import Link from 'next/link';
import { Camera, LayoutDashboard, Car } from 'lucide-react';

export default function Navigation() {
    return (
        <div className="sticky top-6 z-50 flex justify-center w-full px-4 pointer-events-none mb-6">
            <nav className="nav-pill pointer-events-auto rounded-full px-6 py-3 flex items-center justify-between gap-8 md:gap-16 transition-all duration-300 ease-in-out hover:shadow-lg">
                <Link href="/" className="flex items-center space-x-2 text-brand-700 dark:text-brand-400 font-extrabold text-xl transition-transform hover:scale-105">
                    <div className="bg-brand-100 dark:bg-brand-900/40 p-1.5 rounded-full">
                        <Car className="h-5 w-5" />
                    </div>
                    <span className="hidden sm:inline-block tracking-tight text-slate-900 dark:text-white">NITT <span className="text-brand-700 dark:text-brand-400">Scanner</span></span>
                </Link>

                <div className="flex space-x-2 sm:space-x-4 items-center">
                    <Link
                        href="/scanner"
                        className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all px-4 py-2 rounded-full text-sm font-semibold active:scale-95"
                    >
                        <Camera className="h-4 w-4" />
                        <span>Scanner</span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all px-4 py-2 rounded-full text-sm font-semibold active:scale-95"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
