import Link from 'next/link';
import Image from 'next/image';
import { NEWS_ARTICLES } from '@/data/news';

export function NewsSection() {
    // Filter out the items that are already in the carousel if needed, 
    // or just show everything. For now, let's show items 2-5
    const latestNews = NEWS_ARTICLES;

    return (
        <section className="mb-20">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h2 className="text-slate-500 font-mono text-[10px] sm:text-[12px] font-bold uppercase tracking-widest pl-4 border-l-2 border-red-600">
                    Latest Headlines
                </h2>
                <Link href="/news" className="text-red-500 text-xs font-bold italic uppercase tracking-wider hover:text-red-400 transition-colors">
                    View All Stories →
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestNews.map((article) => (
                    <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                        <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl bg-slate-900 border border-white/5 group-hover:border-white/20 transition-colors">
                            <Image
                                src={article.image_url}
                                alt={article.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-2 left-2">
                                <span
                                    className="px-2 py-1 text-[8px] font-black italic uppercase tracking-wider text-white"
                                    style={{ backgroundColor: article.accent }}
                                >
                                    {article.category}
                                </span>
                            </div>
                        </div>

                        <div className="px-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{article.date}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{article.readTime}</span>
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase leading-none mb-2 group-hover:text-red-500 transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {article.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
