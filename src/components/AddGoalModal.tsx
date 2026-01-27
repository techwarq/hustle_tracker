"use client";

import React, { useState } from 'react';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (goal: { text: string; dueDate: string }) => void;
    userName: string;
}

export default function AddGoalModal({ isOpen, onClose, onAdd, userName }: AddGoalModalProps) {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd({ text: text.trim(), dueDate });
            setText('');
            setDueDate(new Date().toISOString().split('T')[0]);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <h2 className="text-lg font-semibold text-white mb-1">Add Goal for {userName}</h2>
                <p className="text-xs text-zinc-500 mb-4">This goal will be assigned to {userName}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Goal text */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">
                            Goal Description
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What do you want to achieve?"
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Due date */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min="2026-01-01"
                            max="2026-12-31"
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-green-500 rounded-xl text-white font-medium hover:bg-green-600 transition-colors"
                        >
                            Add Goal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
