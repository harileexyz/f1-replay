'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();

    // Don't show footer on race replay pages
    const isRacePage = pathname?.startsWith('/race/');

    if (isRacePage) {
        return null;
    }

    return (
        <footer className="p-6 sm:p-12 border-t border-white/5 text-center bg-slate-950 mt-10 sm:mt-20">
            <p className="text-slate-700 text-[10px] font-mono tracking-[0.5em] uppercase">
                F1 ANALYSIS SUITE • POWERED BY OPENF1 API & FASTF1
            </p>
        </footer>
    );
}
