"use client";

import React, { useState } from 'react';
import Heatmap from '@/components/Heatmap';
import UserTimer from '@/components/UserTimer';
import GoalList from '@/components/GoalList';
import AddGoalModal from '@/components/AddGoalModal';

const USERS = [
  { id: 'user-1', name: 'Sonali' },
  { id: 'user-2', name: 'Himanshu' },
  { id: 'user-3', name: 'Piyush' }
];

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  completedDate?: string;
}

interface HeatmapData {
  date: string;
  hours: number;
  goals: number;
}

export default function Home() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'goal-1', text: 'Setup project structure', completed: true, dueDate: '2026-01-27', completedDate: '2026-01-27' },
    { id: 'goal-2', text: 'Implement heatmap feature', completed: false, dueDate: '2026-01-28' },
    { id: 'goal-3', text: 'Add user authentication', completed: false, dueDate: '2026-01-30' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateHeatmapData = (date: string, hours: number = 0, goalsDone: number = 0) => {
    setHeatmapData(prev => {
      const existing = prev.find(d => d.date === date);
      if (existing) {
        return prev.map(d =>
          d.date === date
            ? { ...d, hours: d.hours + hours, goals: d.goals + goalsDone }
            : d
        );
      }
      return [...prev, { date, hours, goals: goalsDone }];
    });
  };

  const handleStopTimer = (duration: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateHeatmapData(today, duration, 0);
  };

  const handleToggleGoal = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newCompleted = !g.completed;
        if (newCompleted) {
          updateHeatmapData(today, 0, 1);
          return { ...g, completed: true, completedDate: today };
        } else {
          // Decrement if uncompleting
          updateHeatmapData(today, 0, -1);
          return { ...g, completed: false, completedDate: undefined };
        }
      }
      return g;
    }));
  };

  const handleAddGoal = (newGoal: { text: string; dueDate: string }) => {
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      text: newGoal.text,
      completed: false,
      dueDate: newGoal.dueDate
    };
    setGoals(prev => [...prev, goal]);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalHours = heatmapData.reduce((acc, d) => acc + d.hours, 0);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Hustle Tracker</h1>
              <p className="text-sm text-zinc-500">Track your progress and stay productive</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{completedCount}</span>/{goals.length} goals
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{totalHours.toFixed(1)}</span>h tracked
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
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Team</h2>
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

          {/* Right column */}
          <div className="col-span-12 lg:col-span-9 space-y-6">

            {/* Heatmap */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Activity</h2>
              </div>
              <Heatmap data={heatmapData} />
            </div>

            {/* Goals */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Goals</h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Goal
                </button>
              </div>
              <GoalList goals={goals} onToggle={handleToggleGoal} />

              {/* Progress */}
              {goals.length > 0 && (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddGoal}
      />
    </div>
  );
}
