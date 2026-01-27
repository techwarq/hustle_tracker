"use client";

import React, { useState } from 'react';

interface HeatmapProps {
    data: { date: string; hours: number; goals: number }[];
}

export default function Heatmap({ data }: HeatmapProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    // Generate last 12 weeks (84 days) like GitHub
    const totalDays = 84;
    const weeks = 12;

    const days = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (totalDays - 1 - i));
        return d.toISOString().split('T')[0];
    });

    // Get month labels
    const getMonthLabels = () => {
        const months: { label: string; col: number }[] = [];
        let lastMonth = -1;

        days.forEach((date, i) => {
            const month = new Date(date).getMonth();
            if (month !== lastMonth) {
                months.push({
                    label: new Date(date).toLocaleDateString('en-US', { month: 'short' }),
                    col: Math.floor(i / 7)
                });
                lastMonth = month;
            }
        });
        return months;
    };

    const getLevel = (date: string) => {
        const entry = data.find(d => d.date === date);
        if (!entry) return 0;
        const total = entry.hours + entry.goals * 0.5;
        if (total === 0) return 0;
        if (total < 1) return 1;
        if (total < 3) return 2;
        if (total < 5) return 3;
        return 4;
    };

    const levelColors = [
        'bg-zinc-800',
        'bg-green-900',
        'bg-green-700',
        'bg-green-500',
        'bg-green-400'
    ];

    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

    const handleMouseEnter = (e: React.MouseEvent, date: string) => {
        const entry = data.find(d => d.date === date);
        const hours = entry?.hours || 0;
        const goals = entry?.goals || 0;
        const dateStr = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        setTooltip({
            x: e.clientX,
            y: e.clientY,
            content: `${dateStr}\n${hours.toFixed(1)}h worked • ${goals} goals done`
        });
    };

    return (
        <div className="relative">
            {/* Month labels */}
            <div className="flex mb-2 ml-8">
                {getMonthLabels().map((m, i) => (
                    <div
                        key={i}
                        className="text-[10px] text-zinc-500"
                        style={{ marginLeft: i === 0 ? 0 : `${(m.col - (getMonthLabels()[i - 1]?.col || 0)) * 14 - 20}px` }}
                    >
                        {m.label}
                    </div>
                ))}
            </div>

            <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-[3px] mr-1">
                    {dayLabels.map((day, i) => (
                        <div key={i} className="h-[12px] text-[10px] text-zinc-500 flex items-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex gap-[3px]">
                    {Array.from({ length: weeks }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dateIndex = weekIndex * 7 + dayIndex;
                                const date = days[dateIndex];
                                if (!date) return <div key={dayIndex} className="w-[12px] h-[12px]" />;

                                const level = getLevel(date);

                                return (
                                    <div
                                        key={date}
                                        className={`w-[12px] h-[12px] rounded-[2px] ${levelColors[level]} cursor-pointer transition-all hover:ring-1 hover:ring-white/30`}
                                        onMouseEnter={(e) => handleMouseEnter(e, date)}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl pointer-events-none whitespace-pre-line"
                    style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
                >
                    {tooltip.content}
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-zinc-500">
                <span>Less</span>
                {levelColors.map((c, i) => (
                    <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
