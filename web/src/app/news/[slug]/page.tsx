'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { NEWS_ARTICLES } from '@/data/news';

export default function ArticlePage() {
    const params = useParams();
    const slug = params?.slug as string;

    const article = NEWS_ARTICLES.find(a => a.slug === slug);

    if (!article) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4">404 - Story Not Found</h1>
                <Link href="/" className="px-8 py-4 bg-red-600 text-white font-black italic uppercase rounded-2xl hover:bg-red-500 transition-all">
                    ← Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-red-500/30">
            <main className="flex-1">
                {/* Hero section */}
                <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0">
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-slate-950/40 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-20" />

                        <Image
                            src={article.image_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="absolute inset-0 z-30 flex flex-col justify-end pb-12 sm:pb-20 px-4 sm:px-8 max-w-4xl mx-auto w-full">
                        <div className="flex items-center gap-4 mb-4 sm:mb-6">
                            <span
                                className="px-3 py-1 text-[10px] sm:text-xs font-black italic uppercase tracking-wider text-white"
                                style={{ backgroundColor: article.accent }}
                            >
                                {article.category}
                            </span>
                            <span className="text-slate-300 font-mono text-xs font-bold tracking-widest uppercase border-l border-white/20 pl-4">
                                {article.date} • {article.readTime}
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9] drop-shadow-lg">
                            {article.title}
                        </h1>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Article Body */}
                        <div className="lg:col-span-8">
                            <p className="text-xl sm:text-2xl text-white font-medium italic border-l-4 pl-6 mb-12 leading-relaxed" style={{ borderColor: article.accent }}>
                                {article.description}
                            </p>

                            <div
                                className="prose prose-invert prose-lg max-w-none 
                                prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight
                                prose-p:text-slate-400 prose-p:leading-relaxed prose-p:font-light
                                prose-strong:text-white prose-strong:font-bold
                                prose-a:text-red-500 prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Author</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                                        ✍️
                                    </div>
                                    <span className="text-white font-bold italic">{article.author}</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Share</h3>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-sm transition-colors">X</button>
                                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-sm transition-colors">FB</button>
                                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-sm transition-colors">LINK</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
