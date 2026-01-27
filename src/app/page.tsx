"use client";

import React, { useState, useEffect } from 'react';
import Heatmap from '@/components/Heatmap';
import UserTimer from '@/components/UserTimer';
import GoalList from '@/components/GoalList';
import AddGoalModal from '@/components/AddGoalModal';

const USERS = [
  { id: 'sonali', name: 'Sonali' },
  { id: 'himanshu', name: 'Himanshu' },
  { id: 'piyush', name: 'Piyush' }
];

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  completedDate?: string;
  userId: string;
}

interface HeatmapData {
  date: string;
  hours: number;
  goals: number;
}

const STORAGE_KEYS = {
  GOALS: 'hustle_tracker_goals',
  HEATMAP: 'hustle_tracker_heatmap'
};

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<string>(USERS[0].id);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUserId, setModalUserId] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    const savedHeatmap = localStorage.getItem(STORAGE_KEYS.HEATMAP);

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Default goals for first time
      setGoals([
        { id: 'goal-1', text: 'Setup project structure', completed: true, dueDate: '2026-01-27', completedDate: '2026-01-27', userId: 'sonali' },
        { id: 'goal-2', text: 'Implement heatmap feature', completed: false, dueDate: '2026-01-28', userId: 'sonali' },
        { id: 'goal-3', text: 'Design UI mockups', completed: false, dueDate: '2026-01-29', userId: 'himanshu' },
        { id: 'goal-4', text: 'Backend API setup', completed: false, dueDate: '2026-01-30', userId: 'piyush' }
      ]);
    }

    if (savedHeatmap) {
      setHeatmapData(JSON.parse(savedHeatmap));
    }

    setIsLoaded(true);
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }, [goals, isLoaded]);

  // Save heatmap data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.HEATMAP, JSON.stringify(heatmapData));
    }
  }, [heatmapData, isLoaded]);

  const updateHeatmapData = (date: string, hours: number = 0, goalsDone: number = 0) => {
    setHeatmapData(prev => {
      const existing = prev.find(d => d.date === date);
      if (existing) {
        return prev.map(d =>
          d.date === date
            ? { ...d, hours: Math.max(0, d.hours + hours), goals: Math.max(0, d.goals + goalsDone) }
            : d
        );
      }
      if (goalsDone > 0 || hours > 0) {
        return [...prev, { date, hours: Math.max(0, hours), goals: Math.max(0, goalsDone) }];
      }
      return prev;
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
          if (g.completedDate) {
            updateHeatmapData(g.completedDate, 0, -1);
          }
          return { ...g, completed: false, completedDate: undefined };
        }
      }
      return g;
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleOpenModal = (userId: string) => {
    setModalUserId(userId);
    setIsModalOpen(true);
  };

  const handleAddGoal = (newGoal: { text: string; dueDate: string }) => {
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      text: newGoal.text,
      completed: false,
      dueDate: newGoal.dueDate,
      userId: modalUserId
    };
    setGoals(prev => [...prev, goal]);
  };

  const getUserGoals = (userId: string) => {
    const userGoals = goals.filter(g => g.userId === userId);
    if (showCompleted) {
      return userGoals;
    }
    return userGoals.filter(g => !g.completed);
  };

  const totalCompleted = goals.filter(g => g.completed).length;
  const totalHours = heatmapData.reduce((acc, d) => acc + d.hours, 0);

  const selectedUserData = USERS.find(u => u.id === selectedUser);
  const selectedUserGoals = getUserGoals(selectedUser);
  const selectedUserTotalGoals = goals.filter(g => g.userId === selectedUser);
  const selectedUserCompletedCount = selectedUserTotalGoals.filter(g => g.completed).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Hustle Tracker</h1>
              <p className="text-sm text-zinc-500">2026 Progress Dashboard</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">{totalCompleted}</span>/{goals.length} goals
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

        {/* Heatmap */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">2026 Activity</h2>
          </div>
          <Heatmap data={heatmapData} />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left column - Users & Timers */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card p-4">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Team</h2>
              <div className="space-y-3">
                {USERS.map(user => {
                  const userGoals = goals.filter(g => g.userId === user.id);
                  const userCompleted = userGoals.filter(g => g.completed).length;

                  return (
                    <div
                      key={user.id}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedUser === user.id
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                        }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${selectedUser === user.id ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-300'
                            }`}>
                            {user.name[0]}
                          </div>
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {userCompleted}/{userGoals.length} goals
                        </span>
                      </div>
                      <UserTimer
                        userName={user.name}
                        userId={user.id}
                        onStop={handleStopTimer}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column - User Goals */}
          <div className="col-span-12 lg:col-span-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {selectedUserData?.name}'s Goals
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1">
                    {selectedUserCompletedCount} of {selectedUserTotalGoals.length} completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Show Completed Toggle */}
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showCompleted
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showCompleted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                    {showCompleted ? 'Hide Done' : 'Show Done'}
                  </button>

                  {/* Add Goal Button */}
                  <button
                    onClick={() => handleOpenModal(selectedUser)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Goal
                  </button>
                </div>
              </div>

              <GoalList goals={selectedUserGoals} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />

              {/* Progress */}
              {selectedUserTotalGoals.length > 0 && (
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((selectedUserCompletedCount / selectedUserTotalGoals.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedUserCompletedCount / selectedUserTotalGoals.length) * 100}%` }}
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
        userName={USERS.find(u => u.id === modalUserId)?.name || ''}
      />
    </div>
  );
}
