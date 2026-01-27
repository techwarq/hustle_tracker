"use client";

import React from 'react';

interface Goal {
    id: string;
    text: string;
    completed: boolean;
    dueDate: string;
}

interface GoalListProps {
    goals: Goal[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function GoalList({ goals, onToggle, onDelete }: GoalListProps) {
    // Sort by due date
    const sortedGoals = [...goals].sort((a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (dateStr: string, completed: boolean) => {
        if (completed) return false;
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <div className="space-y-2">
            {sortedGoals.map((goal) => (
                <div
                    key={goal.id}
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${goal.completed
                            ? 'bg-green-500/10 border border-green-500/20'
                            : isOverdue(goal.dueDate, goal.completed)
                                ? 'bg-red-500/10 border border-red-500/20'
                                : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600'
                        }`}
                >
                    {/* Checkbox */}
                    <button
                        onClick={() => onToggle(goal.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${goal.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-zinc-600 hover:border-zinc-400'
                            }`}
                    >
                        {goal.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>

                    {/* Text & Date */}
                    <div className="flex-1 min-w-0">
                        <span
                            className={`block text-sm font-medium transition-all ${goal.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                                }`}
                        >
                            {goal.text}
                        </span>
                        <span
                            className={`text-[10px] font-medium ${goal.completed
                                    ? 'text-zinc-600'
                                    : isOverdue(goal.dueDate, goal.completed)
                                        ? 'text-red-400'
                                        : 'text-zinc-500'
                                }`}
                        >
                            {formatDate(goal.dueDate)}
                            {isOverdue(goal.dueDate, goal.completed) && ' • Overdue'}
                        </span>
                    </div>

                    {/* Status / Delete */}
                    <div className="flex items-center gap-2">
                        {goal.completed && (
                            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Done</span>
                        )}
                        <button
                            onClick={(e) => handleDelete(e, goal.id)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete goal"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}

            {goals.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                    No goals yet. Add one to get started!
                </div>
            )}
        </div>
    );
}
