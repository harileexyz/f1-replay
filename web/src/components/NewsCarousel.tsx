'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
    id: string;
    title: string;
    subtitle: string;
    tag: string;
    image_url: string;
    link: string;
    date: string;
    accent: string;
}

import { NEWS_ARTICLES } from '@/data/news';

export function NewsCarousel() {
    // Stick to the top 4 featured stories for the carousel
    const carouselItems = NEWS_ARTICLES.filter(item => item.featured).slice(0, 4);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, [carouselItems.length]);

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    }, [carouselItems.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 5000); // 5 seconds per slide
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const activeItem = carouselItems[activeIndex];

    return (
        <section className="relative w-full h-[600px] sm:h-[700px] overflow-hidden bg-slate-950 border-b border-white/5 group">

            {/* Background Images with Transitions */}
            {carouselItems.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 z-10" />

                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-20" />

                    {/* The Image */}
                    <div className="relative w-full h-full transform scale-105 transition-transform duration-[10000ms] ease-linear"
                        style={{ transform: index === activeIndex ? 'scale(1.1)' : 'scale(1.0)' }}>
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className={`object-cover ${item.id === '3' ? 'object-top' : 'object-center'}`}
                            priority={index === 0}
                        />
                    </div>
                </div>
            ))}

            {/* Content Container */}
            <div className="absolute inset-0 z-30 flex flex-col justify-end pb-20 sm:pb-32 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
                <div className="pointer-events-auto">
                    {/* Tag & Date */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-6 animate-in slide-in-from-bottom-4 fade-in duration-500" key={`tag-${activeIndex}`}>
                        <span
                            className="bg-red-600 text-white px-3 py-1 text-[10px] sm:text-xs font-black italic uppercase tracking-wider"
                            style={{ backgroundColor: activeItem.accent }}
                        >
                            {activeItem.category}
                        </span>
                        <span className="text-slate-400 font-mono text-xs font-bold tracking-widest uppercase border-l border-white/20 pl-4">
                            {activeItem.date}
                        </span>
                    </div>

                    {/* Main Title */}
                    <h2
                        className="text-5xl sm:text-7xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none mb-6 sm:mb-8 max-w-5xl drop-shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 py-2"
                        key={`title-${activeIndex}`}
                    >
                        {activeItem.title.split(' ').map((word, i) => {
                            // If it's "CHINESE GP RETURN", we want "GP RETURN" together
                            if (activeItem.title.includes('CHINESE GP RETURN')) {
                                if (word === 'CHINESE') return <div key={i} className="block">{word}</div>;
                                if (word === 'GP') return <span key={i} className="inline-block">{word}&nbsp;</span>;
                                if (word === 'RETURN') return <span key={i}>{word}</span>;
                            }

                            // Default: just space them out, let standard wrapping handle it, 
                            // but maybe force break if it's really long? No, let's trust max-w.
                            // Actually, the original design wanted words on new lines for max impact.
                            // Let's go back to that but simpler.

                            return (
                                <span key={i} className={`inline-block mr-4 ${i % 2 !== 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400' : ''}`}>
                                    {word}
                                </span>
                            );
                        })}
                    </h2>

                    {/* Subtitle */}
                    <p
                        className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 animate-in slide-in-from-bottom-8 fade-in duration-900 border-l-2 pl-6"
                        style={{ borderColor: activeItem.accent }}
                        key={`desc-${activeIndex}`}
                    >
                        {activeItem.subtitle}
                    </p>

                    {/* CTA Button */}
                    <div className="animate-in fade-in duration-1000 delay-300" key={`btn-${activeIndex}`}>
                        <Link
                            href={`/news/${activeItem.slug}`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black italic uppercase text-sm sm:text-base tracking-wider hover:bg-slate-200 transition-colors group/btn"
                        >
                            Read Full Story
                            <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute right-4 bottom-8 sm:right-8 sm:bottom-12 z-40 flex items-center gap-2 sm:gap-4">
                {/* Progress Indicators */}
                <div className="flex gap-1 sm:gap-1.5 mr-4 sm:mr-8">
                    {carouselItems.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setActiveIndex(idx); setIsAutoPlaying(false); }}
                            className={`h-1 transition-all duration-300 ${idx === activeIndex
                                ? 'w-8 sm:w-12 bg-white'
                                : 'w-2 sm:w-4 bg-white/20 hover:bg-white/40'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Arrows */}
                <button
                    onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
                    className="w-10 h-10 sm:w-14 sm:h-14 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
                    className="w-10 h-10 sm:w-14 sm:h-14 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* F1 World Label */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-30">
                <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.4em] rotate-90 origin-top-right block whitespace-nowrap">
                    F1 World News Wire • Live Feed
                </span>
            </div>
        </section>
    );
}
