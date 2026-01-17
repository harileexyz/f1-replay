'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/drivers', label: 'Drivers' },
    { href: '/teams', label: 'Teams' },
    { href: '/race/2024/1', label: 'Race Replay', isAction: true },
];

export function NavBar() {
    const pathname = usePathname();

    // Don't show navbar on race replay pages (it has its own UI)
    const isRacePage = pathname?.startsWith('/race/');

    if (isRacePage) {
        return null;
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-16 sm:h-20">
                {/* Logo */}
                <div className="flex flex-col">
                    <Link href="/">
                        <h1 className="text-lg sm:text-2xl font-black text-white italic tracking-tighter leading-none mb-1 uppercase hover:text-red-500 transition-colors">
                            F1 FANHUB <span className="text-red-600 font-mono not-italic text-[10px] align-top ml-1">v2.0</span>
                        </h1>
                    </Link>
                    <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em] hidden sm:block">
                        Global Telemetry Discovery
                    </p>
                </div>

                {/* Navigation items */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname?.startsWith(item.href));

                        if (item.isAction) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-3 sm:px-5 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all ml-1 sm:ml-2"
                                >
                                    {item.label}
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all
                                    ${isActive
                                        ? 'text-red-500 bg-red-600/10'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }
                                `}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
