import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import Roadmap from '@/models/Roadmap';
import Week from '@/models/Week';
import Day from '@/models/Day';
import Task from '@/models/Task';
import Reference from '@/models/Reference';
import User from '@/models/User';

export async function GET() {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get user's active roadmap
        const user = await User.findById(userId);
        if (!user?.activeRoadmapId) {
            return NextResponse.json({ roadmap: null });
        }

        const roadmap = await Roadmap.findOne({ _id: user.activeRoadmapId, userId });
        if (!roadmap) {
            return NextResponse.json({ roadmap: null });
        }

        // Get all weeks
        const weeks = await Week.find({ roadmapId: roadmap._id }).sort({ weekNumber: 1 });

        // Get all days with tasks
        const days = await Day.find({ roadmapId: roadmap._id }).sort({ globalDayIndex: 1 });
        const dayIds = days.map(d => d._id);
        const tasks = await Task.find({ dayId: { $in: dayIds } });

        // Group tasks by day
        const tasksByDay: Record<string, typeof tasks> = {};
        for (const task of tasks) {
            const dayId = task.dayId.toString();
            if (!tasksByDay[dayId]) tasksByDay[dayId] = [];
            tasksByDay[dayId].push(task);
        }

        // Get references
        const references = await Reference.find({ roadmapId: roadmap._id });

        // Build response
        const weeksWithDays = weeks.map(week => {
            const weekDays = days
                .filter(d => d.weekNumber === week.weekNumber)
                .map(day => ({
                    ...day.toObject(),
                    tasks: tasksByDay[day._id.toString()] || [],
                }));
            return {
                ...week.toObject(),
                days: weekDays,
            };
        });

        return NextResponse.json({
            roadmap: roadmap.toObject(),
            weeks: weeksWithDays,
            references: references.map(r => r.toObject()),
        });
    } catch (error) {
        console.error('Roadmap fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch roadmap' },
            { status: 500 }
        );
    }
}
