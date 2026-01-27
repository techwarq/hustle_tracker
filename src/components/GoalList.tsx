"use client";

import React from 'react';

interface Goal {
    id: string;
    text: string;
    completed: boolean;
}

interface GoalListProps {
    goals: Goal[];
    onToggle: (id: string) => void;
}

export default function GoalList({ goals, onToggle }: GoalListProps) {
    return (
        <div className="space-y-2">
            {goals.map((goal) => (
                <button
                    key={goal.id}
                    onClick={() => onToggle(goal.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${goal.completed
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600'
                        }`}
                >
                    {/* Checkbox */}
                    <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-zinc-600'
                            }`}
                    >
                        {goal.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>

                    {/* Text */}
                    <span
                        className={`flex-1 text-sm font-medium transition-all ${goal.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                            }`}
                    >
                        {goal.text}
                    </span>

                    {/* Status indicator */}
                    {goal.completed && (
                        <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Done</span>
                    )}
                </button>
            ))}
        </div>
    );
}
