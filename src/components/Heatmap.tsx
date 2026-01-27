"use client";

import React from 'react';

interface HeatmapProps {
    data: { date: string; intensity: number }[];
}

export default function Heatmap({ data }: HeatmapProps) {
    const weeks = 7;
    const daysPerWeek = 7;

    const days = Array.from({ length: weeks * daysPerWeek }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (weeks * daysPerWeek - 1 - i));
        return d.toISOString().split('T')[0];
    });

    const getLevel = (date: string) => {
        const entry = data.find(d => d.date === date);
        if (!entry || entry.intensity === 0) return 0;
        if (entry.intensity < 1) return 1;
        if (entry.intensity < 3) return 2;
        if (entry.intensity < 6) return 3;
        return 4;
    };

    const levelColors = [
        'bg-zinc-800/50',
        'bg-green-900/60',
        'bg-green-700/70',
        'bg-green-500/80',
        'bg-green-400'
    ];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="flex gap-4">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pt-6">
                {weekDays.map((day, i) => (
                    <div key={day} className="h-4 text-[10px] text-zinc-500 flex items-center">
                        {i % 2 === 0 ? day : ''}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
                    {Array.from({ length: weeks }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: daysPerWeek }).map((_, dayIndex) => {
                                const dateIndex = weekIndex * daysPerWeek + dayIndex;
                                const date = days[dateIndex];
                                const level = getLevel(date);
                                const intensity = data.find(d => d.date === date)?.intensity || 0;

                                return (
                                    <div
                                        key={date}
                                        className={`h-4 w-full rounded-sm ${levelColors[level]} transition-all duration-200 hover:ring-2 hover:ring-green-400/50 cursor-pointer`}
                                        title={`${date}: ${intensity.toFixed(1)}h`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
