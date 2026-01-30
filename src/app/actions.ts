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

export async function getTarget() {
    const result = await sql`SELECT value FROM settings WHERE key = 'goal_target'`;
    return result.length > 0 ? parseInt(result[0].value) : 10;
}

export async function updateTarget(value: number) {
    await sql`
        INSERT INTO settings (key, value)
        VALUES ('goal_target', ${value.toString()})
        ON CONFLICT (key) DO UPDATE SET value = ${value.toString()}
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
        VALUES ('goal_target', '10')
        ON CONFLICT (key) DO NOTHING
    `;
}
