import Link from 'next/link';
import { Camera, LayoutDashboard, Car } from 'lucide-react';

export default function Navigation() {
    return (
        <nav className="glass sticky top-0 z-50 w-full border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex space-x-8">
                        <Link href="/" className="flex items-center space-x-2 text-brand-600 dark:text-brand-500 font-bold text-xl">
                            <Car className="h-6 w-6" />
                            <span>NITT Scanner</span>
                        </Link>

                        <div className="hidden sm:flex sm:space-x-8 items-center">
                            <Link
                                href="/scanner"
                                className="flex items-center space-x-1 text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                            >
                                <Camera className="h-4 w-4" />
                                <span>Scanner</span>
                            </Link>

                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-1 text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
