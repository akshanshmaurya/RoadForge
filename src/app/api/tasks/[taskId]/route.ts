import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import { isValidObjectId, sanitizeError } from '@/lib/validate';
import Task from '@/models/Task';
import Day from '@/models/Day';
import Roadmap from '@/models/Roadmap';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { taskId } = await params;

        if (!isValidObjectId(taskId)) {
            return NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 });
        }

        const body = await request.json();

        // Verify task ownership
        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const day = await Day.findById(task.dayId);
        if (!day) {
            return NextResponse.json({ error: 'Day not found' }, { status: 404 });
        }

        const roadmap = await Roadmap.findOne({ _id: day.roadmapId, userId });
        if (!roadmap) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Build update object
        const update: Record<string, unknown> = {};

        if (body.completed !== undefined) {
            update.completed = body.completed;
            update.completedAt = body.completed ? new Date() : null;
        }

        if (body.difficulty !== undefined) {
            update.difficulty = body.difficulty;
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, update, { new: true });

        return NextResponse.json({ task: updatedTask?.toObject() });
    } catch (error) {
        console.error('Task update error:', error);
        return NextResponse.json(
            { success: false, error: sanitizeError(error) },
            { status: 500 }
        );
    }
}
