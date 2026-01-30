'use server';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getInitialData() {
    const goalsRaw = await sql`SELECT * FROM goals ORDER BY due_date ASC`;
    const logsRaw = await sql`SELECT * FROM work_logs ORDER BY date ASC`;

    const goals = goalsRaw.map(g => ({
        id: g.id,
        text: g.text,
        completed: g.completed,
        dueDate: g.due_date ? new Date(g.due_date).toISOString().split('T')[0] : '',
        completedDate: g.completed_date ? new Date(g.completed_date).toISOString().split('T')[0] : undefined,
        userId: g.user_id
    }));

    // Aggregate heatmap data
    const heatmapMap = new Map<string, { date: string; hours: number; goals: number }>();

    logsRaw.forEach(l => {
        const date = new Date(l.date).toISOString().split('T')[0];
        const existing = heatmapMap.get(date) || { date, hours: 0, goals: 0 };
        existing.hours += parseFloat(l.hours);
        heatmapMap.set(date, existing);
    });

    goals.forEach(g => {
        if (g.completed && g.completedDate) {
            const date = g.completedDate;
            const existing = heatmapMap.get(date) || { date, hours: 0, goals: 0 };
            existing.goals += 1;
            heatmapMap.set(date, existing);
        }
    });

    return { goals, heatmapData: Array.from(heatmapMap.values()) };
}

export async function getTargetSettings() {
    const results = await sql`SELECT key, value FROM settings WHERE key IN ('goal_target', 'target_desc')`;
    const settings = {
        value: 10,
        description: 'Set your mission...'
    };
    results.forEach(r => {
        if (r.key === 'goal_target') settings.value = parseInt(r.value);
        if (r.key === 'target_desc') settings.description = r.value;
    });
    return settings;
}

export async function updateTargetSettings(value: number, description: string) {
    await sql`
        INSERT INTO settings (key, value)
        VALUES 
            ('goal_target', ${value.toString()}),
            ('target_desc', ${description})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
}

export async function addGoal(goal: { text: string; dueDate: string; userId: string }) {
    await sql`
        INSERT INTO goals (id, text, completed, due_date, user_id)
        VALUES (${`goal-${Date.now()}`}, ${goal.text}, false, ${goal.dueDate}, ${goal.userId})
    `;
}

export async function toggleGoal(id: string, completed: boolean, completedDate?: string) {
    if (completed) {
        await sql`
            UPDATE goals 
            SET completed = true, completed_date = ${completedDate}
            WHERE id = ${id}
        `;
    } else {
        await sql`
            UPDATE goals 
            SET completed = false, completed_date = NULL
            WHERE id = ${id}
        `;
    }
}

export async function deleteGoal(id: string) {
    await sql`DELETE FROM goals WHERE id = ${id}`;
}

export async function addWorkLog(userId: string, date: string, hours: number) {
    // Check if a log exists for this user and date
    const existing = await sql`
        SELECT * FROM work_logs 
        WHERE user_id = ${userId} AND date = ${date}
    `;

    if (existing.length > 0) {
        await sql`
            UPDATE work_logs 
            SET hours = hours + ${hours}
            WHERE user_id = ${userId} AND date = ${date}
        `;
    } else {
        await sql`
            INSERT INTO work_logs (user_id, date, hours)
            VALUES (${userId}, ${date}, ${hours})
        `;
    }
}

export async function setupDatabase() {
    await sql`
        CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            due_date DATE,
            completed_date DATE,
            user_id TEXT NOT NULL
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS work_logs (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            hours NUMERIC DEFAULT 0,
            UNIQUE(user_id, date)
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `;

    // Initialize default target if not exists
    await sql`
        INSERT INTO settings (key, value)
        VALUES 
            ('goal_target', '10'),
            ('target_desc', '100 users -> $20k revenue')
        ON CONFLICT (key) DO NOTHING
    `;
}
