"use client";

import React, { useState } from 'react';

interface HeatmapProps {
    data: { date: string; hours: number; goals: number }[];
}

export default function Heatmap({ data }: HeatmapProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    // Full year 2026: Jan 1 to Dec 31
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-12-31');

    // Get all days in 2026
    const days: string[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    // Calculate weeks (Jan 1, 2026 is Thursday = 4)
    const firstDayOfWeek = startDate.getDay();
    const totalWeeks = Math.ceil((days.length + firstDayOfWeek) / 7);

    // Get month labels with positions
    const getMonthLabels = () => {
        const months: { label: string; week: number }[] = [];
        let lastMonth = -1;

        days.forEach((date, i) => {
            const month = new Date(date).getMonth();
            if (month !== lastMonth) {
                const weekIndex = Math.floor((i + firstDayOfWeek) / 7);
                months.push({
                    label: new Date(date).toLocaleDateString('en-US', { month: 'short' }),
                    week: weekIndex
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

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleMouseEnter = (e: React.MouseEvent, date: string) => {
        const entry = data.find(d => d.date === date);
        const hours = entry?.hours || 0;
        const goals = entry?.goals || 0;
        const dateStr = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        setTooltip({
            x: e.clientX,
            y: e.clientY,
            content: `${dateStr}\n${hours.toFixed(1)}h worked • ${goals} goals`
        });
    };

    // Build the grid
    const grid: (string | null)[][] = [];
    for (let week = 0; week < totalWeeks; week++) {
        grid[week] = [];
        for (let day = 0; day < 7; day++) {
            const dayIndex = week * 7 + day - firstDayOfWeek;
            if (dayIndex >= 0 && dayIndex < days.length) {
                grid[week][day] = days[dayIndex];
            } else {
                grid[week][day] = null;
            }
        }
    }

    const cellSize = 11;
    const gap = 2;

    return (
        <div className="w-full">
            {/* Month labels */}
            <div className="flex mb-1 ml-7 relative h-4">
                {getMonthLabels().map((m, i) => (
                    <span
                        key={i}
                        className="text-[10px] text-zinc-500 absolute"
                        style={{ left: `${m.week * (cellSize + gap)}px` }}
                    >
                        {m.label}
                    </span>
                ))}
            </div>

            <div className="flex gap-[2px]">
                {/* Day labels */}
                <div className="flex flex-col gap-[2px] mr-1 shrink-0">
                    {dayLabels.map((day, i) => (
                        <div
                            key={i}
                            className="text-[9px] text-zinc-500 flex items-center justify-end pr-1"
                            style={{ height: `${cellSize}px`, width: '24px' }}
                        >
                            {i % 2 === 1 ? day : ''}
                        </div>
                    ))}
                </div>

                {/* Heatmap Grid - fills available width */}
                <div className="flex-1 overflow-hidden">
                    <div
                        className="grid gap-[2px]"
                        style={{
                            gridTemplateColumns: `repeat(${totalWeeks}, ${cellSize}px)`,
                            width: 'fit-content'
                        }}
                    >
                        {grid.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[2px]">
                                {week.map((date, dayIndex) => {
                                    if (!date) {
                                        return (
                                            <div
                                                key={dayIndex}
                                                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                                            />
                                        );
                                    }

                                    const level = getLevel(date);

                                    return (
                                        <div
                                            key={date}
                                            className={`rounded-[2px] ${levelColors[level]} cursor-pointer transition-all hover:ring-1 hover:ring-white/50`}
                                            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                                            onMouseEnter={(e) => handleMouseEnter(e, date)}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl pointer-events-none whitespace-pre-line"
                    style={{ left: tooltip.x + 10, top: tooltip.y - 50 }}
                >
                    {tooltip.content}
                </div>
            )}

            {/* Legend - aligned right */}
            <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-zinc-500">
                <span>Less</span>
                {levelColors.map((c, i) => (
                    <div
                        key={i}
                        className={`rounded-[2px] ${c}`}
                        style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
