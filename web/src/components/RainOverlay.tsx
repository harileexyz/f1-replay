"use client";

import React, { useEffect, useRef } from 'react';

export function RainOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;

        const raindrops: { x: number; y: number; length: number; speed: number }[] = [];
        const count = 100;

        for (let i = 0; i < count; i++) {
            raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 15 + 10
            });
        }

        let animationFrame: number;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.2)';
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';

            raindrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + 2, drop.y + drop.length);
                ctx.stroke();

                drop.y += drop.speed;
                drop.x += 2;

                if (drop.y > height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * width;
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100] opacity-50"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
