"use client";

import React, { useState, useEffect, useRef } from 'react';

interface UserTimerProps {
    userName: string;
    userId: string;
    onStop: (duration: number) => void;
}

export default function UserTimer({ userName, userId, onStop }: UserTimerProps) {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    const handleToggle = () => {
        if (isActive) {
            onStop(seconds / 3600);
            setIsActive(false);
            setSeconds(0);
        } else {
            setIsActive(true);
        }
    };

    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`card-inner p-4 transition-all duration-300 ${isActive ? 'ring-1 ring-green-500/50 bg-green-500/5' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-300'}`}>
                        {userName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-200">{userName}</span>
                            {isActive && (
                                <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    ACTIVE
                                </span>
                            )}
                        </div>
                        <div className={`font-mono text-lg font-semibold tracking-tight ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                            {formatTime(seconds)}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleToggle}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isActive
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                >
                    {isActive ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="1" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
