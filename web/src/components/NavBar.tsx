'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/drivers', label: 'Drivers' },
    { href: '/teams', label: 'Teams' },
    { href: '/standings', label: 'Standings' },
    { href: '/races', label: 'Race Replay', isAction: true },
];

export function NavBar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Don't show navbar on race replay pages (it has its own UI)
    const isRacePage = pathname?.startsWith('/race/');

    if (isRacePage) {
        return null;
    }

    return (
        <>
            {/* Mobile Menu Overlay - Outside header for proper stacking */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950 z-[100] sm:hidden flex flex-col"
                    onClick={() => setIsMenuOpen(false)}
                >
                    {/* Header area in overlay */}
                    <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            <h1 className="text-lg font-black text-white italic tracking-tighter leading-none uppercase">
                                F1 FANHUB <span className="text-red-600 font-mono not-italic text-[10px] align-top ml-1">v2.0</span>
                            </h1>
                        </Link>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                            className="p-2 text-white"
                            aria-label="Close menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 flex flex-col items-center justify-center gap-4 px-8" onClick={(e) => e.stopPropagation()}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`
                                    text-3xl font-black italic uppercase tracking-tighter w-full text-center py-4 border-b border-white/5
                                    ${pathname === item.href ? 'text-red-500' : 'text-white hover:text-red-500'}
                                    ${item.isAction ? 'text-red-500' : ''}
                                `}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Main Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20">
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

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex items-center gap-2">
                            {navItems.map(item => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/' && pathname?.startsWith(item.href));

                                if (item.isAction) {
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all ml-2"
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
                                            px-4 py-2 rounded-lg text-sm font-bold transition-all
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

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="sm:hidden p-2 text-white/80 hover:text-white"
                            aria-label="Open menu"
                        >
                            <div className="w-6 h-5 flex flex-col justify-between">
                                <span className="h-0.5 w-6 bg-current" />
                                <span className="h-0.5 w-4 bg-current ml-auto" />
                                <span className="h-0.5 w-5 bg-current ml-auto" />
                            </div>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
