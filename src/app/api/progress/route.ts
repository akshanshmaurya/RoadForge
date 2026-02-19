import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Roadmap from '@/models/Roadmap';
import Day from '@/models/Day';
import Task from '@/models/Task';

export async function GET() {
    try {
        await dbConnect();

        const roadmap = await Roadmap.findOne().sort({ createdAt: -1 });
        if (!roadmap) {
            return NextResponse.json({ error: 'No roadmap found' }, { status: 404 });
        }

        // Get all days and tasks
        const days = await Day.find({ roadmapId: roadmap._id });
        const dayIds = days.map(d => d._id);
        const tasks = await Task.find({ dayId: { $in: dayIds } });

        // Calculate metrics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Category breakdown
        const graphTasks = tasks.filter(t => t.category === 'graph');
        const revisionTasks = tasks.filter(t => t.category === 'revision');
        const theoryTasks = tasks.filter(t => t.category === 'theory');

        const graphCompleted = graphTasks.filter(t => t.completed).length;
        const revisionCompleted = revisionTasks.filter(t => t.completed).length;
        const theoryCompleted = theoryTasks.filter(t => t.completed).length;

        // Days with all tasks completed
        const tasksByDay: Record<string, typeof tasks> = {};
        for (const task of tasks) {
            const dayId = task.dayId.toString();
            if (!tasksByDay[dayId]) tasksByDay[dayId] = [];
            tasksByDay[dayId].push(task);
        }

        let daysCompleted = 0;
        for (const dayTasks of Object.values(tasksByDay)) {
            if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
                daysCompleted++;
            }
        }

        // Streak: count consecutive completed days from the most recent
        const sortedDays = days.sort((a, b) => a.globalDayIndex - b.globalDayIndex);
        let streak = 0;
        for (let i = sortedDays.length - 1; i >= 0; i--) {
            const dayTasks = tasksByDay[sortedDays[i]._id.toString()] || [];
            if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
                streak++;
            } else {
                break;
            }
        }

        return NextResponse.json({
            totalDays: days.length,
            daysCompleted,
            totalTasks,
            completedTasks,
            completionPercentage,
            streak,
            graph: { total: graphTasks.length, completed: graphCompleted },
            revision: { total: revisionTasks.length, completed: revisionCompleted },
            theory: { total: theoryTasks.length, completed: theoryCompleted },
        });
    } catch (error) {
        console.error('Progress error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate progress' },
            { status: 500 }
        );
    }
}
