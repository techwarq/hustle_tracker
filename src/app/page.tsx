"use client";

import React, { useState } from 'react';
import Heatmap from '@/components/Heatmap';
import UserTimer from '@/components/UserTimer';
import GoalList from '@/components/GoalList';

const USERS = [
  { id: 'user-1', name: 'User 1' },
  { id: 'user-2', name: 'User 2' },
  { id: 'user-3', name: 'User 3' }
];

const INITIAL_GOALS = [
  { id: 'goal-1', text: 'Complete project setup', completed: true },
  { id: 'goal-2', text: 'Implement core features', completed: false },
  { id: 'goal-3', text: 'Add authentication', completed: false },
  { id: 'goal-4', text: 'Deploy to production', completed: false }
];

export default function Home() {
  const [logs, setLogs] = useState<{ date: string; intensity: number }[]>([]);
  const [goals, setGoals] = useState(INITIAL_GOALS);

  const handleStopTimer = (duration: number) => {
    const today = new Date().toISOString().split('T')[0];
    setLogs(prev => {
      const existing = prev.find(l => l.date === today);
      if (existing) {
        return prev.map(l => l.date === today ? { ...l, intensity: l.intensity + duration } : l);
      }
      return [...prev, { date: today, intensity: duration }];
    });
  };

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newState = !g.completed;
        if (newState) handleStopTimer(0.5);
        return { ...g, completed: newState };
      }
      return g;
    }));
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalHours = logs.reduce((acc, l) => acc + l.intensity, 0);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Work Tracker</h1>
              <p className="text-sm text-zinc-500">Track your progress and stay productive</p>
            </div>

            {/* Stats pills */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{completedCount}</span>/{goals.length} goals
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{totalHours.toFixed(1)}</span>h today
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left column - Users */}
          <div className="col-span-12 lg:col-span-3">
            <div className="card p-4">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Team Members</h2>
              <div className="space-y-3">
                {USERS.map(user => (
                  <UserTimer
                    key={user.id}
                    userName={user.name}
                    userId={user.id}
                    onStop={handleStopTimer}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Main content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">

            {/* Heatmap */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Activity Overview</h2>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {['bg-zinc-800/50', 'bg-green-900/60', 'bg-green-700/70', 'bg-green-500/80', 'bg-green-400'].map((c, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
              <Heatmap data={logs} />
            </div>

            {/* Goals */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Goals</h2>
                <span className="text-xs text-zinc-500">
                  {completedCount} of {goals.length} completed
                </span>
              </div>
              <GoalList goals={goals} onToggle={handleToggleGoal} />

              {/* Progress bar */}
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((completedCount / goals.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / goals.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
